# 🌐 frontend-app — Panel Web de Monitoreo Industrial

Aplicación web construida con **React 19 + Vite 8 + TailwindCSS 4**. Proporciona un dashboard de telemetría en tiempo real, sistema de login con OTP, y panel de gestión de usuarios.

---

## 🚀 Cómo arrancar

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev
```

El frontend quedará en: `http://localhost:5173`

> ⚠️ **Importante:** El backend (`main-api`) debe estar corriendo en `http://localhost:3000` para que la aplicación funcione. El proxy de Vite redirige automáticamente todas las peticiones de `/api/*` al backend.

---

## 📂 Estructura del Proyecto

```
frontend-app/
├── index.html                → HTML principal (punto de entrada)
├── package.json              → Dependencias y scripts
├── vite.config.js            → Configuración de Vite (incluye proxy al backend)
├── tailwind.config.js        → Configuración de TailwindCSS
├── postcss.config.js         → PostCSS para TailwindCSS
└── src/
    ├── main.jsx              → Punto de entrada React (BrowserRouter)
    ├── App.jsx               → Enrutador principal (rutas protegidas y públicas)
    ├── App.css               → Estilos globales y animaciones
    ├── index.css              → Importación de Tailwind
    ├── context/
    │   └── AuthContext.jsx   → Estado global de autenticación (JWT + usuario)
    ├── pages/
    │   ├── Login.jsx         → Pantalla de login dual (solicitar código / ingresar código)
    │   ├── Dashboard.jsx     → Panel principal con métricas y gráficos en tiempo real
    │   └── UserManagement.jsx → Formulario para crear usuarios (Admin/SuperAdmin)
    └── components/
        ├── Sidebar.jsx       → Barra lateral con navegación basada en roles
        ├── MetricCard.jsx    → Tarjeta de métrica individual (nivel, temperatura, etc.)
        └── ChartCard.jsx     → Tarjeta de gráfico con Recharts
```

---

## 🔄 Conexión con el Backend

El archivo `vite.config.js` contiene un **proxy** que redirige las llamadas automáticamente:

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',  // ← Apunta al backend
      changeOrigin: true,
    }
  }
}
```

Esto significa que cuando el frontend hace `axios.post('/api/auth/login', ...)`, Vite lo traduce internamente a `http://localhost:3000/api/auth/login`.

> Si el backend corre en otra IP o puerto, edita este archivo.

---

## 🔐 Sistema de Autenticación

### AuthContext (`src/context/AuthContext.jsx`)
Maneja el estado global de sesión:
- Almacena el **token JWT** y los **datos del usuario** en `localStorage`.
- Proporciona funciones `login()` y `logout()` a toda la aplicación.
- Al recargar la página, recupera la sesión automáticamente desde `localStorage`.

### Rutas Protegidas (`App.jsx`)
- **`ProtectedRoute`**: Si no hay token, redirige a `/login`.
- **`PublicRoute`**: Si ya hay token, redirige a `/dashboard`.

| Ruta | Componente | Acceso |
|---|---|---|
| `/login` | `Login.jsx` | Pública — Solo si no hay sesión activa |
| `/dashboard` | `Dashboard.jsx` | Protegida — Todos los roles |
| `/users` | `UserManagement.jsx` | Protegida — Solo Admin y SuperAdmin |

---

## 📱 Pantallas

### Login (`Login.jsx`)
Pantalla dual con diseño glassmorphism:
- **Modo 1 — "Solicitar Código":** Campo de correo + botón "Recibir Código por Correo".
- **Modo 2 — "Ingresar Código":** Campo de correo (bloqueado) + campo de 6 dígitos monospace + botón verde "Iniciar Sesión Segura".

### Dashboard (`Dashboard.jsx`)
Panel principal con:
- Tarjetas de métricas en tiempo real (polling cada 10s).
- Gráficos de series temporales con Recharts.
- Datos dinámicos desde `/api/data/latest` y `/api/data/preset`.

### Gestión de Usuarios (`UserManagement.jsx`)
Formulario para invitar usuarios al sistema:
- Campos: Nombre, Apellido, Email, Teléfono, Cargo.
- Selector de Rol: Cliente, Gerente, Admin (según el rol del usuario actual).
- Selector en cascada: Empresa Padre → Sub Empresa (obligatorio para Gerente).
- El rol SuperAdmin NO aparece como opción (solo se crea por base de datos).

---

## 🧭 Sidebar (`Sidebar.jsx`)
La barra lateral muestra opciones según el rol del usuario autenticado:

| Elemento | SuperAdmin | Admin | Gerente | Cliente |
|---|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Gestión de Usuarios | ✅ | ✅ | ❌ | ❌ |
| Cerrar Sesión | ✅ | ✅ | ✅ | ✅ |

---

## 📦 Dependencias Principales

| Paquete | Uso |
|---|---|
| `react` | Framework UI |
| `react-router-dom` | Enrutamiento SPA |
| `axios` | Peticiones HTTP al backend |
| `recharts` | Gráficos de series temporales |
| `lucide-react` | Iconos SVG |
| `date-fns` | Formateo de fechas |
| `tailwindcss` | Framework CSS utilitario |
