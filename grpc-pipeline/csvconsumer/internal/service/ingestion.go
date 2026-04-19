package service

import (
	"context"
	"fmt"
	"strings"

	pb "grpc-pipeline/proto"
)

// BatchInserter define el contrato mínimo que debe cumplir el repositorio.
// Esto desacopla la lógica de negocio de la implementación concreta de la BD.
type BatchInserter interface {
	InsertBatch(ctx context.Context, records []*pb.TelemetryRecord) (int, int, error)
}

// IngestionService contiene la lógica de negocio del proceso de ingesta.
type IngestionService struct {
	repo BatchInserter // Repositorio que guarda los registros.
}

// NewIngestionService crea una nueva instancia del servicio de ingesta.
func NewIngestionService(repo BatchInserter) *IngestionService {
	return &IngestionService{repo: repo}
}

// ProcessRecords valida y persiste un lote de registros de telemetría.
func (s *IngestionService) ProcessRecords(ctx context.Context, filename string, records []*pb.TelemetryRecord) (int, int, string, error) {
	// Valida que el lote no venga vacío.
	if len(records) == 0 {
		return 0, 0, "el lote no contiene registros", nil
	}

	// Recorre cada registro para hacer validaciones mínimas.
	for i, record := range records {
		if strings.TrimSpace(record.IdSerial) == "" {
			return 0, 0, fmt.Sprintf("registro %d sin id_serial", i), nil
		}
		if strings.TrimSpace(record.Fecha) == "" {
			return 0, 0, fmt.Sprintf("registro %d sin fecha", i), nil
		}
		if strings.TrimSpace(record.Hora) == "" {
			return 0, 0, fmt.Sprintf("registro %d sin hora", i), nil
		}
		if strings.TrimSpace(record.Data) == "" {
			return 0, 0, fmt.Sprintf("registro %d sin data", i), nil
		}
	}

	// Delegamos la persistencia al repositorio.
	inserted, duplicates, err := s.repo.InsertBatch(ctx, records)
	if err != nil {
		return inserted, duplicates, "error insertando registros en PostgreSQL", err
	}

	// Mensaje de éxito del lote.
	message := fmt.Sprintf("lote [%s] procesado correctamente", filename)
	return inserted, duplicates, message, nil
}
