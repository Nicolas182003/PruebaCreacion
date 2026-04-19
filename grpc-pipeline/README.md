# 🚀 gRPC Telemetry Pipeline

Pipeline de ingestión de datos basado en **Go + gRPC + PostgreSQL**, diseñado para procesar logs industriales (CSV), limpiarlos, estructurarlos y almacenarlos de forma eficiente.

---

## 📌 Descripción General

Este sistema permite:

- 📥 Recibir archivos de logs crudos (CSV)
- 🧹 Limpiar y transformar datos automáticamente
- 📦 Agrupar variables en formato JSON
- 🔌 Enviar datos mediante gRPC
- 🗄️ Persistir en PostgreSQL
- 💾 Generar respaldos organizados por dispositivo
- ⚠️ Manejar errores y trazabilidad de archivos

---

## 🧱 Arquitectura

```text
Logs (CSV)
   ↓
csvprocessor (Go)
   ↓ gRPC
csvconsumer (Go)
   ↓
PostgreSQL
```

Separación de responsabilidades:

| Componente     | Función                                         |
| -------------- | ----------------------------------------------- |
| `csvprocessor` | Procesa archivos, limpia datos y envía por gRPC |
| `csvconsumer`  | Recibe datos y los inserta en PostgreSQL        |
| `PostgreSQL`   | Almacenamiento final                            |
| `data/`        | Gestión de archivos                             |

---

## 📂 Estructura del Proyecto

```text
grpc-pipeline/
├── csvconsumer/
├── csvprocessor/
├── proto/
├── db-infra/
├── data/
│   ├── incoming_logs/
│   ├── raw_backup/
│   ├── processed_logs/
│   └── failed_logs/
├── go.mod
└── README.md
```

---

## ⚙️ Flujo de Procesamiento

1. Un archivo llega a:

   ```text
   data/incoming_logs/
   ```

2. Se genera respaldo exacto en:

   ```text
   data/raw_backup/<id_serial>/
   ```

3. Se procesa el contenido:
   - Se elimina `--1`
   - Se agrupan variables
   - Se eliminan milisegundos
   - Se construye JSON

4. Se envía vía gRPC al consumer

5. Resultado:
   - ✅ Éxito → `processed_logs/`
   - ❌ Error → `failed_logs/`

---

## 🧠 Ejemplo de Transformación

### Input (CSV)

```txt
151.21.49.121--1.AI23,2024-04-03 19:22:00.118,254,Good
151.21.49.121--1.AI24,2024-04-03 19:22:00.118,0,Good
```

### Output (JSON)

```json
{
  "id_serial": "151.21.49.121",
  "fecha": "2024-04-03",
  "hora": "19:22:00",
  "data": {
    "AI23": 254,
    "AI24": 0
  }
}
```

---

## 🗄️ Base de Datos

Tabla principal:

```sql
CREATE TABLE log_records (
    id_serial TEXT,
    fecha DATE,
    hora TIME,
    data JSONB,
    UNIQUE (id_serial, fecha, hora)
);
```

Inserción:

```sql
ON CONFLICT (id_serial, fecha, hora) DO NOTHING
```

✔ Evita duplicados automáticamente

---

## 🔧 Configuración

### csvconsumer/.env

```env
GRPC_PORT=50051
DB_HOST=localhost
DB_PORT=5432
DB_NAME=telemetry_platform
DB_USER=postgres
DB_PASSWORD=admin
```

---

### csvprocessor/.env

```env
GRPC_ADDRESS=localhost:50051
TIMEOUT_SECONDS=10

INPUT_DIR=data/incoming_logs
RAW_BACKUP_DIR=data/raw_backup
PROCESSED_DIR=data/processed_logs
FAILED_DIR=data/failed_logs
```

---

## ▶️ Ejecución

### 1. Levantar base de datos

```bash
cd db-infra
docker compose up -d
```

---

### 2. Iniciar servidor gRPC (consumer)

```bash
go run ./csvconsumer/cmd/csvconsumer
```

---

### 3. Procesar archivos

```bash
go run ./csvprocessor/cmd/csvprocessor
```

---

## 📥 Uso

1. Copiar archivos CSV en:

   ```text
   data/incoming_logs/
   ```

2. Ejecutar processor

3. Revisar resultados:

| Carpeta          | Descripción                       |
| ---------------- | --------------------------------- |
| `raw_backup`     | Respaldo original por dispositivo |
| `processed_logs` | Procesados correctamente          |
| `failed_logs`    | Archivos con error                |

---

## 🧪 Ejemplo de ejecución

```bash
go run ./csvprocessor/cmd/csvprocessor
```

Salida esperada:

```text
procesando archivo [log_1.csv]
archivo procesado correctamente: inserted=1 duplicates=0
```

---

## ⚠️ Manejo de errores

El sistema maneja:

- errores de lectura de archivos
- errores de transformación
- errores de conexión gRPC
- errores de base de datos

Los archivos problemáticos se mueven automáticamente a:

```text
data/failed_logs/
```

---

## 📈 Escalabilidad

Este diseño permite:

- 🔹 agregar múltiples processors
- 🔹 distribuir consumers
- 🔹 integrar colas (RabbitMQ/Kafka)
- 🔹 escalar horizontalmente
- 🔹 agregar más tipos de datos (agua, energía, etc.)

---

## 🔮 Roadmap

- [ ] Procesamiento automático (watcher de carpeta)
- [ ] Logs estructurados (observabilidad)
- [ ] Dockerización completa
- [ ] Dashboard en tiempo real
- [ ] Integración con APIs externas

---

## 👨‍💻 Autor

Desarrollado por **Moises**
Ingeniería en Informática 🚀

---

## 📄 Licencia

Uso académico / demostrativo.
