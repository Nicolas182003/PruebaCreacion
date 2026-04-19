package grpcclient

import (
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

// NewConnection crea una conexión cliente gRPC hacia el csvconsumer.
// Se usa insecure porque el entorno actual es local y sin TLS.
func NewConnection(address string) (*grpc.ClientConn, error) {
	// Crea la conexión hacia la dirección indicada.
	conn, err := grpc.NewClient(
		address,
		grpc.WithTransportCredentials(insecure.NewCredentials()),
	)
	if err != nil {
		return nil, err
	}

	return conn, nil
}
