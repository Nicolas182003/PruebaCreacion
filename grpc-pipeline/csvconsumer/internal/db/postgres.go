package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

// Connect abre la conexión a PostgreSQL usando variables de entorno.
func Connect() (*sql.DB, error) {
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	name := os.Getenv("DB_NAME")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")

	if host == "" {
		host = "host.docker.internal"
	}
	if port == "" {
		port = "5433"
	}
	if name == "" {
		name = "db_infra"
	}
	if user == "" {
		user = "admin_infra"
	}
	if password == "" {
		password = "Infra2026Secure!"
	}

	dsn := fmt.Sprintf(
		"host=%s port=%s dbname=%s user=%s password=%s sslmode=disable",
		host, port, name, user, password,
	)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		return nil, err
	}

	log.Println("✅ conexión a PostgreSQL exitosa")
	return db, nil
}
