package repository

import (
	"context"
	"database/sql"

	pb "grpc-pipeline/proto"
)

// LogRecordRepository encapsula el acceso a la tabla log_records.
// Esta capa se encarga solo de persistencia.
type LogRecordRepository struct {
	db *sql.DB // Conexión abierta a PostgreSQL.
}

// NewLogRecordRepository crea una nueva instancia del repositorio.
func NewLogRecordRepository(database *sql.DB) *LogRecordRepository {
	return &LogRecordRepository{db: database}
}

// InsertBatch inserta un lote de registros en la tabla equipo.
// Devuelve cuántos se insertaron y cuántos fueron detectados como duplicados.
func (r *LogRecordRepository) InsertBatch(ctx context.Context, records []*pb.TelemetryRecord) (int, int, error) {
	inserted := 0   // Contador de registros realmente insertados.
	duplicates := 0 // Siempre será 0 porque no bloquearemos conflictos aquí de momento.

	// Recorre cada registro del lote.
	for _, record := range records {
		// Ejecuta el INSERT sobre PostgreSQL.
		// Concatenamos la fecha y hora para generar un TIMESTAMPTZ y quitamos ON CONFLICT.
		_, err := r.db.ExecContext(
			ctx,
			`INSERT INTO equipo (time, id_serial, data)
			 VALUES (($1 || ' ' || $2)::timestamptz AT TIME ZONE 'UTC', $3, $4::jsonb)`,
			record.Fecha,
			record.Hora,
			record.IdSerial,
			record.Data,
		)
		if err != nil {
			return inserted, duplicates, err
		}

		inserted++
	}

	// Devuelve el resultado acumulado del lote.
	return inserted, duplicates, nil
}
