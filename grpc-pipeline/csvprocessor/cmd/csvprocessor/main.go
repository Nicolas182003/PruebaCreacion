package main

import (
	"context"
	"log"
	"path/filepath"
	"time"

	"github.com/joho/godotenv"

	"grpc-pipeline/csvprocessor/internal/config"
	"grpc-pipeline/csvprocessor/internal/csvreader"
	"grpc-pipeline/csvprocessor/internal/filemanager"
	"grpc-pipeline/csvprocessor/internal/grpcclient"
	"grpc-pipeline/csvprocessor/internal/parser"
	"grpc-pipeline/csvprocessor/internal/sender"
	pb "grpc-pipeline/proto"
)

func main() {
	// Carga variables de entorno (soporta ambas rutas de ejecución).
	_ = godotenv.Load("csvprocessor/.env")
	_ = godotenv.Load(".env")

	// Carga la configuración general del processor.
	cfg := config.Load()

	// Asegura que existan las carpetas base necesarias.
	if err := filemanager.EnsureDirectories(
		cfg.InputDir,
		cfg.RawBackupDir,
		cfg.ProcessedDir,
		cfg.FailedDir,
	); err != nil {
		log.Fatalf("error preparando directorios: %v", err)
	}

	// Obtiene la lista de archivos encontrados en la carpeta de entrada.
	files, err := filemanager.ListInputFiles(cfg.InputDir)
	if err != nil {
		log.Fatalf("error listando archivos de entrada: %v", err)
	}

	// Si no hay archivos, termina normal.
	if len(files) == 0 {
		log.Println("no se encontraron archivos para procesar")
		return
	}

	// Abre una conexión gRPC reutilizable.
	conn, err := grpcclient.NewConnection(cfg.GRPCAddress)
	if err != nil {
		log.Fatalf("no se pudo conectar al servidor gRPC: %v", err)
	}
	defer conn.Close()

	client := pb.NewLogIngestionClient(conn)

	// Procesa cada archivo encontrado.
	for _, filePath := range files {
		fileName := filepath.Base(filePath)
		log.Printf("procesando archivo [%s]", fileName)

		// 1) Saca el id_serial limpio desde el contenido del archivo.
		idSerial, err := filemanager.ExtractSerialIDFromFile(filePath)
		if err != nil {
			log.Printf("error extrayendo id_serial desde [%s]: %v", fileName, err)

			if moveErr := filemanager.MoveToFailed(filePath, cfg.FailedDir); moveErr != nil {
				log.Printf("error moviendo archivo [%s] a failed: %v", fileName, moveErr)
			}
			continue
		}

		// 2) Hace respaldo exacto del archivo original en raw_backup/<id_serial>/
		if err := filemanager.CopyToBackupBySerial(filePath, cfg.RawBackupDir, idSerial); err != nil {
			log.Printf("error creando backup de [%s]: %v", fileName, err)

			if moveErr := filemanager.MoveToFailed(filePath, cfg.FailedDir); moveErr != nil {
				log.Printf("error moviendo archivo [%s] a failed: %v", fileName, moveErr)
			}
			continue
		}

		// 3) Lee las filas crudas del archivo.
		rows, err := csvreader.ReadRows(filePath)
		if err != nil {
			log.Printf("error leyendo archivo [%s]: %v", fileName, err)

			if moveErr := filemanager.MoveToFailed(filePath, cfg.FailedDir); moveErr != nil {
				log.Printf("error moviendo archivo [%s] a failed: %v", fileName, moveErr)
			}
			continue
		}

		// 4) Transforma las filas a registros agrupados.
		records, err := parser.BuildTelemetryRecords(rows)
		if err != nil {
			log.Printf("error transformando archivo [%s]: %v", fileName, err)

			if moveErr := filemanager.MoveToFailed(filePath, cfg.FailedDir); moveErr != nil {
				log.Printf("error moviendo archivo [%s] a failed: %v", fileName, moveErr)
			}
			continue
		}

		// 5) Crea un contexto con timeout para la llamada gRPC.
		ctx, cancel := context.WithTimeout(
			context.Background(),
			time.Duration(cfg.TimeoutSeconds)*time.Second,
		)

		// 6) Envía el lote al consumer.
		resp, err := sender.SendRecords(ctx, client, fileName, records)

		// Libera recursos del contexto.
		cancel()

		if err != nil {
			log.Printf("error al enviar archivo [%s] por gRPC: %v", fileName, err)

			if moveErr := filemanager.MoveToFailed(filePath, cfg.FailedDir); moveErr != nil {
				log.Printf("error moviendo archivo [%s] a failed: %v", fileName, moveErr)
			}
			continue
		}

		// Si el servidor respondió con fallo lógico, el archivo va a failed.
		if !resp.Ok {
			log.Printf(
				"el servidor rechazó el archivo [%s]: inserted=%d duplicates=%d message=%s",
				fileName,
				resp.Inserted,
				resp.Duplicates,
				resp.Message,
			)

			if moveErr := filemanager.MoveToFailed(filePath, cfg.FailedDir); moveErr != nil {
				log.Printf("error moviendo archivo [%s] a failed: %v", fileName, moveErr)
			}
			continue
		}

		// 7) Si todo salió bien, el archivo se mueve a processed.
		if err := filemanager.MoveToProcessed(filePath, cfg.ProcessedDir); err != nil {
			log.Printf("archivo [%s] procesado pero no se pudo mover a processed: %v", fileName, err)
			continue
		}

		log.Printf(
			"archivo [%s] procesado correctamente para id_serial [%s]: inserted=%d duplicates=%d message=%s",
			fileName,
			idSerial,
			resp.Inserted,
			resp.Duplicates,
			resp.Message,
		)
	}
}
