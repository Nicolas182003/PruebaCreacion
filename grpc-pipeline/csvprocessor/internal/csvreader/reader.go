package csvreader

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

// RawRow representa una fila cruda del archivo log/CSV.
type RawRow struct {
	Tagname     string // Columna Tagname.
	TimeStamp   string // Columna TimeStamp.
	Value       string // Columna Value.
	DataQuality string // Columna DataQuality.
}

// ReadRows abre un archivo de texto y devuelve las filas útiles ya separadas.
// Ignora:
// - líneas vacías
// - la línea [Data]
// - el encabezado Tagname,TimeStamp,Value,DataQuality
func ReadRows(filePath string) ([]RawRow, error) {
	// Abre el archivo en modo lectura.
	file, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	rows := make([]RawRow, 0)

	// Scanner para leer línea por línea.
	scanner := bufio.NewScanner(file)

	// Recorre el archivo completo.
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())

		// Ignora líneas vacías.
		if line == "" {
			continue
		}

		// Ignora la cabecera especial [Data].
		if line == "[Data]" {
			continue
		}

		// Ignora el encabezado clásico del CSV.
		if strings.EqualFold(line, "Tagname,TimeStamp,Value,DataQuality") {
			continue
		}

		// Divide la línea en 4 partes como máximo.
		// Esto es suficiente para este formato, ya que no esperamos comas internas.
		parts := strings.SplitN(line, ",", 4)
		if len(parts) != 4 {
			return nil, fmt.Errorf("línea inválida: %s", line)
		}

		// Construye la fila cruda y la agrega al resultado.
		rows = append(rows, RawRow{
			Tagname:     strings.TrimSpace(parts[0]),
			TimeStamp:   strings.TrimSpace(parts[1]),
			Value:       strings.TrimSpace(parts[2]),
			DataQuality: strings.TrimSpace(parts[3]),
		})
	}

	// Si hubo un error de lectura del scanner, lo devolvemos.
	if err := scanner.Err(); err != nil {
		return nil, err
	}

	return rows, nil
}