package sender

import (
	"context"

	pb "grpc-pipeline/proto"
)

// SendRecords envía un lote de registros al servidor gRPC.
// Devuelve la respuesta del consumer con inserted / duplicates.
func SendRecords(
	ctx context.Context,
	client pb.LogIngestionClient,
	filename string,
	records []*pb.TelemetryRecord,
) (*pb.SendRecordsResponse, error) {
	// Construye la petición gRPC.
	req := &pb.SendRecordsRequest{
		Filename: filename,
		Records:  records,
	}

	// Ejecuta la llamada remota al método SendRecords.
	return client.SendRecords(ctx, req)
}
