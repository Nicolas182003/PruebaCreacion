package grpcserver

import (
	"context"
	"log"

	"grpc-pipeline/csvconsumer/internal/service"
	pb "grpc-pipeline/proto"
)

// Server implementa el servicio gRPC LogIngestion.
type Server struct {
	pb.UnimplementedLogIngestionServer
	ingestionService *service.IngestionService // Servicio de negocio para procesar registros.
}

// NewServer crea una nueva instancia del servidor gRPC.
func NewServer(ingestionService *service.IngestionService) *Server {
	return &Server{ingestionService: ingestionService}
}

// Ping permite probar conectividad simple entre cliente y servidor.
func (s *Server) Ping(ctx context.Context, req *pb.PingRequest) (*pb.PingResponse, error) {
	log.Println("Ping recibido")

	return &pb.PingResponse{
		Status: "ok",
	}, nil
}

// SendRecords recibe un lote, delega el procesamiento al servicio
// y responde con el resultado consolidado.
func (s *Server) SendRecords(ctx context.Context, req *pb.SendRecordsRequest) (*pb.SendRecordsResponse, error) {
	inserted, duplicates, message, err := s.ingestionService.ProcessRecords(ctx, req.Filename, req.Records)
	if err != nil {
		log.Printf("error procesando lote [%s]: %v", req.Filename, err)

		return &pb.SendRecordsResponse{
			Ok:         false,
			Inserted:   int32(inserted),
			Duplicates: int32(duplicates),
			Message:    message,
		}, err
	}

	log.Printf("lote recibido desde archivo [%s]: insertados=%d duplicados=%d", req.Filename, inserted, duplicates)

	return &pb.SendRecordsResponse{
		Ok:         true,
		Inserted:   int32(inserted),
		Duplicates: int32(duplicates),
		Message:    message,
	}, nil
}
