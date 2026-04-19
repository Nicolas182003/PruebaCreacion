# 🏭 Plataforma de Monitoreo Industrial — Emeltec

Plataforma web para monitoreo de telemetría industrial en tiempo real con autenticación por roles, gestión de usuarios y envío de códigos de acceso por correo electrónico.

---

## 📐 Arquitectura General

El proyecto está dividido en **4 carpetas independientes**, cada una con su responsabilidad:

```
📦 raíz del proyecto
├── 📁 infra-db/          → Base de datos (Docker + TimescaleDB + pgAdmin)
├── 📁 main-api/          → Backend REST API (Node.js + Express)
├── 📁 frontend-app/      → Frontend Web (React + Vite + TailwindCSS)
└── 📁 grpc-pipeline/     → Pipeline de datos CSV via gRPC (Go)
```

### ¿Cómo se conectan?

```
┌─────────────────┐      ┌──────────────┐      ┌──────────────────┐
│  frontend-app   │─────▶│   main-api   │─────▶│    infra-db      │
│  (React/Vite)   │ HTTP │  (Express)   │  SQL │  (TimescaleDB)   │
│  Puerto: 5173   │ /api │  Puerto: 3000│      │  Puerto: 5433    │
└─────────────────┘      └──────┬───────┘      └──────────────────┘
                                │
                         ┌──────▼───────┐
                         │  Gmail SMTP  │
                         │  (Nodemailer)│
                         │  Puerto: 465 │
                         └──────────────┘
```

- **Frontend → Backend:** El frontend (Vite) tiene un proxy configurado que redirige todas las rutas `/api/*` al backend en `localhost:3000`.
- **Backend → Base de Datos:** El backend se conecta a TimescaleDB (PostgreSQL) usando las credenciales del archivo `.env`.
- **Backend → Gmail:** Cuando un usuario solicita un código de acceso, el backend genera un OTP de 6 dígitos y lo envía por correo usando Nodemailer + Gmail SMTP.

---

## 🚀 Guía de Instalación Rápida (Nuevo PC)

### Requisitos Previos
| Herramienta | Versión Mínima | Descarga |
|---|---|---|
| **Node.js** | v18+ | [nodejs.org](https://nodejs.org) |
| **Docker Desktop** | Cualquiera | [docker.com](https://www.docker.com/products/docker-desktop) |
| **Git** | Cualquiera | [git-scm.com](https://git-scm.com) |

### Paso 1 — Clonar el Repositorio
```bash
git clone https://github.com/TU_USUARIO/TU_REPO.git
cd TU_REPO
```

### Paso 2 — Levantar la Base de Datos (Docker)
```bash
cd infra-db

# Copiar las variables de entorno de ejemplo
cp .env.example .env
# ⚠️ Edita el archivo .env con tus contraseñas reales

# Levantar los contenedores
docker compose up -d

# Verificar que esté corriendo
docker ps
```
Esto levanta **TimescaleDB** en el puerto `5433` y **pgAdmin** en `http://localhost:5050`.

### Paso 3 — Configurar y Arrancar el Backend
```bash
cd ../main-api

# Instalar dependencias
npm install

# Copiar las variables de entorno de ejemplo
cp .env.example .env
# ⚠️ Edita el archivo .env con tus credenciales de BD y Gmail

# Sembrar usuarios iniciales de prueba (solo la primera vez)
node src/seed_auth.js

# Iniciar el servidor
npm start
```
El backend quedará corriendo en `http://localhost:3000`.

### Paso 4 — Configurar y Arrancar el Frontend
```bash
cd ../frontend-app

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev
```
El frontend quedará corriendo en `http://localhost:5173`.

### Paso 5 — ¡Listo! Abrir el Navegador
Abre tu navegador y ve a: **http://localhost:5173**

---

## 🔐 Sistema de Autenticación (Flujo OTP)

El sistema utiliza un flujo de **código temporal por correo** (One-Time Password):

1. **Un Admin/SuperAdmin** registra al nuevo usuario desde el panel de "Gestión de Usuarios" (solo correo, nombre, rol y empresa).
2. **El usuario nuevo** va a la pantalla de Login y escribe su correo.
3. Hace clic en **"Recibir Código por Correo"**.
4. El backend valida que el correo exista en la BD, genera un PIN de 6 dígitos, lo hashea con **bcrypt** y lo envía por Gmail.
5. El usuario ingresa el código y entra al Dashboard con su rol asignado.

> ⚠️ Si el correo NO fue previamente registrado por un administrador, el sistema rechaza la solicitud. Esta es la capa de seguridad principal.

---

## 👥 Roles y Permisos

| Rol | Quién lo crea | Acceso |
|---|---|---|
| **SuperAdmin** | Solo por base de datos | Todo el sistema. Crea Admins, Gerentes y Clientes en cualquier empresa. |
| **Admin** | SuperAdmin | Dueño de una empresa padre. Crea Gerentes y Clientes dentro de su empresa. |
| **Gerente** | Admin o SuperAdmin | Supervisa una sub-empresa/faena específica. |
| **Cliente** | Admin, Gerente o SuperAdmin | Solo lectura. Visualiza el dashboard de telemetría. |

---

## 📁 Detalles por Carpeta

Cada carpeta contiene su propio `README.md` con instrucciones específicas:

- 📂 [`infra-db/README.md`](./infra-db/README.md) — Docker, TimescaleDB, esquema SQL
- 📂 [`main-api/README.md`](./main-api/README.md) — Express, JWT, Nodemailer, controladores
- 📂 [`frontend-app/README.md`](./frontend-app/README.md) — React, Vite, componentes, rutas protegidas
- 📂 [`grpc-pipeline/README.md`](./grpc-pipeline/README.md) — Pipeline Go para procesar CSV

---

## 🛑 Notas Importantes de Seguridad

- **NUNCA** subas archivos `.env` a GitHub. Contienen contraseñas reales.
- Los archivos `.env.example` son las plantillas seguras que sí se suben.
- La contraseña de Gmail (App Password) debe generarse desde: https://myaccount.google.com/apppasswords
- El `JWT_SECRET` debe cambiarse en producción (actualmente es un valor por defecto en desarrollo).

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Base de Datos | TimescaleDB (PostgreSQL 16) |
| Backend | Node.js + Express 5 |
| Frontend | React 19 + Vite 8 + TailwindCSS 4 |
| Autenticación | JWT + bcrypt + OTP |
| Correos | Nodemailer + Gmail SMTP |
| Pipeline de Datos | Go + gRPC |
| Contenedores | Docker Compose |
