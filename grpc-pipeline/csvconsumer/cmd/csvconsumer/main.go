package main

import (
	"log"
	"net"

	"github.com/joho/godotenv"
	"google.golang.org/grpc"

	"grpc-pipeline/csvconsumer/internal/config"
	"grpc-pipeline/csvconsumer/internal/db"
	"grpc-pipeline/csvconsumer/internal/grpcserver"
	"grpc-pipeline/csvconsumer/internal/repository"
	"grpc-pipeline/csvconsumer/internal/service"
	pb "grpc-pipeline/proto"
)

func main() {
	// Carga variables de entorno desde el archivo csvconsumer/.env.
	_ = godotenv.Load("csvconsumer/.env")

	// Carga la configuración del servicio.
	cfg := config.Load()

	// Abre la conexión a PostgreSQL.
	database, err := db.Connect()
	if err != nil {
		log.Fatalf("error al conectar a PostgreSQL: %v", err)
	}
	defer database.Close()

	// Crea la capa de repositorio que habla con la tabla log_records.
	repo := repository.NewLogRecordRepository(database)

	// Crea la capa de servicio con la lógica de negocio.
	ingestionService := service.NewIngestionService(repo)

	// Abre el puerto TCP donde escuchará gRPC.
	lis, err := net.Listen("tcp", ":"+cfg.GRPCPort)
	if err != nil {
		log.Fatalf("error al escuchar: %v", err)
	}

	// Crea el servidor gRPC.
	grpcServer := grpc.NewServer()

	// Registra el servicio gRPC en el servidor.
	pb.RegisterLogIngestionServer(grpcServer, grpcserver.NewServer(ingestionService))

	log.Printf("✅ conexión a PostgreSQL exitosa")
	log.Printf("🚀 csvconsumer escuchando en puerto %s", cfg.GRPCPort)

	// Inicia el servidor y queda escuchando peticiones.
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("error al iniciar servidor: %v", err)
	}
}
