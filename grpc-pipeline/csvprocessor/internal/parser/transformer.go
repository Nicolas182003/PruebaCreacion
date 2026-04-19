package parser

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"time"

	"grpc-pipeline/csvprocessor/internal/csvreader"
	pb "grpc-pipeline/proto"
)

// groupedRecord representa una agrupación temporal antes de serializar a TelemetryRecord.
type groupedRecord struct {
	IDSerial string             // ID limpio del dispositivo.
	Fecha    string             // Fecha en formato YYYY-MM-DD.
	Hora     string             // Hora en formato HH:MM:SS.
	Data     map[string]float64 // JSON intermedio con nombre_dato => valor_dato.
}

// BuildTelemetryRecords transforma filas crudas del CSV/log en registros agrupados.
// Agrupa por:
// - id_serial
// - fecha
// - hora
//
// Ejemplo:
// varias filas con AI23, AI24, REG4 del mismo timestamp
// terminan convertidas en un solo TelemetryRecord con data JSON.
func BuildTelemetryRecords(rows []csvreader.RawRow) ([]*pb.TelemetryRecord, error) {
	// Mapa para agrupar por clave compuesta.
	grouped := make(map[string]*groupedRecord)

	// Recorre todas las filas crudas del archivo.
	for _, row := range rows {
		// Extrae id_serial y nombre_dato desde Tagname.
		idSerial, nombreDato, err := parseTagname(row.Tagname)
		if err != nil {
			return nil, err
		}

		// Extrae fecha y hora limpiando milisegundos del timestamp.
		fecha, hora, err := parseTimestamp(row.TimeStamp)
		if err != nil {
			return nil, err
		}

		// Convierte el valor textual a número.
		valor, err := strconv.ParseFloat(strings.TrimSpace(row.Value), 64)
		if err != nil {
			return nil, fmt.Errorf("valor inválido [%s]: %w", row.Value, err)
		}

		// Crea la clave de agrupación.
		key := fmt.Sprintf("%s|%s|%s", idSerial, fecha, hora)

		// Si la agrupación no existe todavía, se crea.
		if _, exists := grouped[key]; !exists {
			grouped[key] = &groupedRecord{
				IDSerial: idSerial,
				Fecha:    fecha,
				Hora:     hora,
				Data:     make(map[string]float64),
			}
		}

		// Inserta el dato en el mapa JSON intermedio.
		grouped[key].Data[nombreDato] = valor
	}

	// Convierte la estructura agrupada en []*pb.TelemetryRecord.
	records := make([]*pb.TelemetryRecord, 0, len(grouped))

	for _, item := range grouped {
		// Serializa el mapa de datos a JSON string.
		dataJSON, err := json.Marshal(item.Data)
		if err != nil {
			return nil, err
		}

		// Agrega el registro final listo para gRPC.
		records = append(records, &pb.TelemetryRecord{
			IdSerial: item.IDSerial,
			Fecha:    item.Fecha,
			Hora:     item.Hora,
			Data:     string(dataJSON),
		})
	}

	return records, nil
}

// parseTagname transforma un Tagname como:
// 151.21.49.121--1.AI23
// en:
// id_serial   => 151.21.49.121
// nombre_dato => AI23
func parseTagname(tag string) (string, string, error) {
	// Busca el último punto para separar dispositivo y nombre_dato.
	lastDot := strings.LastIndex(tag, ".")
	if lastDot == -1 {
		return "", "", fmt.Errorf("tagname inválido: %s", tag)
	}

	// Parte izquierda: dispositivo con posible sufijo --1
	left := tag[:lastDot]

	// Parte derecha: nombre del dato, por ejemplo AI23
	nombreDato := tag[lastDot+1:]
	if strings.TrimSpace(nombreDato) == "" {
		return "", "", fmt.Errorf("nombre_dato vacío en tagname: %s", tag)
	}

	// Limpia el sufijo --1 si existe.
	idSerial := strings.Split(left, "--")[0]
	idSerial = strings.TrimSpace(idSerial)

	if idSerial == "" {
		return "", "", fmt.Errorf("id_serial vacío en tagname: %s", tag)
	}

	return idSerial, nombreDato, nil
}

// parseTimestamp transforma un timestamp como:
// 2024-04-03 19:22:00.118
// en:
// fecha => 2024-04-03
// hora  => 19:22:00
func parseTimestamp(value string) (string, string, error) {
	// Layout con milisegundos.
	layoutWithMillis := "2006-01-02 15:04:05.000"

	// Intenta parsear el timestamp crudo.
	t, err := time.Parse(layoutWithMillis, value)
	if err != nil {
		return "", "", fmt.Errorf("timestamp inválido [%s]: %w", value, err)
	}

	// Separa fecha y hora limpia.
	fecha := t.Format("2006-01-02")
	hora := t.Format("15:04:05")

	return fecha, hora, nil
}
