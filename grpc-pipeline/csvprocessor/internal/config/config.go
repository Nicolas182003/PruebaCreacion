package config

import (
	"os"
	"strconv"
)

// Config representa la configuración del csvprocessor.
// Aquí se centralizan todas las rutas y parámetros del proceso.
type Config struct {
	GRPCAddress    string // Dirección del servidor gRPC, por ejemplo localhost:50051.
	TimeoutSeconds int    // Tiempo máximo de espera para la llamada gRPC.

	InputDir     string // Carpeta donde llegan los logs crudos.
	RawBackupDir string // Carpeta donde se guarda el respaldo exacto del log original.
	ProcessedDir string // Carpeta donde se mueven los logs procesados correctamente.
	FailedDir    string // Carpeta donde se mueven los logs que fallaron.
}

// Load construye la configuración leyendo variables de entorno.
func Load() Config {
	return Config{
		GRPCAddress:    getEnv("GRPC_ADDRESS", "localhost:50051"),
		TimeoutSeconds: getEnvAsInt("TIMEOUT_SECONDS", 10),

		InputDir:     getEnv("INPUT_DIR", "data/incoming_logs"),
		RawBackupDir: getEnv("RAW_BACKUP_DIR", "data/raw_backup"),
		ProcessedDir: getEnv("PROCESSED_DIR", "data/processed_logs"),
		FailedDir:    getEnv("FAILED_DIR", "data/failed_logs"),
	}
}

// getEnv devuelve una variable de entorno o un valor por defecto.
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

// getEnvAsInt devuelve una variable de entorno parseada como entero.
// Si no existe o falla el parseo, devuelve el valor por defecto.
func getEnvAsInt(key string, defaultValue int) int {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}

	parsed, err := strconv.Atoi(value)
	if err != nil {
		return defaultValue
	}

	return parsed
}
