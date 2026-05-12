# Cancha — Plataforma de Reservas Deportivas

Aplicación web full-stack para gestionar reservas de canchas deportivas. Permite a los usuarios explorar canchas disponibles, consultar horarios y hacer reservas; y a los administradores gestionar canchas, reservas y usuarios desde un panel dedicado.

---

## Estructura del proyecto

```
Cancha/
├── backend/      # API REST con Django
├── frontend/     # Aplicación web con Next.js
├── nginx/        # Configuración del proxy inverso
├── docker-compose.yml
└── .gitignore
```

---

## Backend

### ¿Qué es?

API REST construida con **Django 5.1** y **Django REST Framework**. Expone todos los endpoints que consume el frontend, maneja la autenticación con tokens JWT y contiene la lógica de negocio del sistema.

### Tecnologías principales

| Tecnología | Versión | Rol |
|---|---|---|
| Python | 3.13 | Lenguaje base |
| Django | 5.1.2 | Framework web |
| Django REST Framework | 3.15.2 | Construcción de la API |
| SimpleJWT | 5.3.1 | Autenticación con tokens JWT |
| psycopg2-binary | 2.9.10 | Conector PostgreSQL |
| python-dotenv | 1.0.1 | Carga de variables de entorno |

### Módulos (apps Django)

- **users** — Modelo de usuario custom con campo `role` (USER / ADMIN), registro, login con email o username, refresh de token.
- **courts** — CRUD de canchas con tipo de deporte, precio por hora, horario de apertura/cierre y días disponibles. Incluye el endpoint `available_slots` que devuelve los bloques de 1 hora libres/ocupados para una cancha y fecha dadas.
- **reservations** — Creación y gestión de reservas con validación anti-solapamiento. Flujo de estados: `PENDING → CONFIRMED → FINISHED` (o `CANCELED`).
- **dashboard** — Estadísticas generales (totales de canchas, reservas por estado, usuarios).

### Variables de entorno (`backend/.env`)

```env
USE_SQLITE=True           # True = usa SQLite local; False = usa PostgreSQL
DJANGO_DEBUG=True
DJANGO_SECRET_KEY=unsafe-dev-key
CORS_ALLOW_ALL=True
FRONTEND_URL=http://localhost
```

> Para producción cambia `USE_SQLITE=False` y agrega `DATABASE_URL` con la cadena de conexión PostgreSQL.

### Cómo correr el backend (desarrollo local)

**1. Crear y activar el entorno virtual**

```bash
cd backend
python -m venv .venv

# Windows CMD
.venv\Scripts\activate.bat

# Windows PowerShell
.venv\Scripts\Activate.ps1

# macOS / Linux
source .venv/bin/activate
```

**2. Instalar dependencias**

```bash
pip install -r requirements.txt
```

**3. Crear el archivo de entorno**

```bash
copy backend\.env.example backend\.env   # Windows
cp backend/.env.example backend/.env     # macOS / Linux
```

**4. Aplicar migraciones**

```bash
python manage.py migrate
```

**5. Crear un superusuario (primera vez)**

```bash
python manage.py createsuperuser
```

**6. Levantar el servidor**

```bash
python manage.py runserver
```

La API queda disponible en `http://localhost:8000/api/`.
El panel de administración de Django está en `http://localhost:8000/admin/`.

### Endpoints principales

| Método | URL | Descripción |
|---|---|---|
| POST | `/api/auth/login/` | Login (email o username) → devuelve access + refresh |
| POST | `/api/auth/refresh/` | Renueva el access token |
| GET | `/api/courts/` | Lista de canchas |
| GET | `/api/courts/{id}/available_slots/?date=YYYY-MM-DD` | Slots disponibles por día |
| POST | `/api/reservations/` | Crear una reserva |
| POST | `/api/reservations/{id}/confirm/` | Confirmar reserva (solo ADMIN) |
| POST | `/api/reservations/{id}/finish/` | Marcar como finalizada (solo ADMIN) |
| POST | `/api/reservations/{id}/cancel/` | Cancelar reserva (admin o dueño) |
| GET | `/api/dashboard/stats/` | Estadísticas generales |

---

## Frontend

### ¿Qué es?

Aplicación web construida con **Next.js 15** (App Router) y **TypeScript**. Consume la API del backend y ofrece una interfaz visual completa para usuarios y administradores.

### Tecnologías principales

| Tecnología | Versión | Rol |
|---|---|---|
| Next.js | 15.0.3 | Framework React con SSR / App Router |
| React | 18.3.1 | Librería de UI |
| TypeScript | — | Tipado estático |
| TailwindCSS | — | Estilos utilitarios |
| Zustand | 5 | Estado global (autenticación) |
| Axios | — | Peticiones HTTP con interceptores JWT |
| date-fns | — | Manipulación de fechas en el calendario |

### Páginas y funcionalidades

- **`/`** — Homepage con hero, métricas en vivo, buscador, filtro por deporte y grilla de canchas. Incluye calendario semanal de reservas.
- **`/login`** y **`/register`** — Formularios de autenticación.
- **`/mis-reservas`** — Reservas del usuario con filtros por estado y confirmación de 2 pasos para cancelar.
- **`/admin/canchas`** — CRUD de canchas con formulario completo (tipo, precio, horario, días disponibles).
- **`/admin/reservas`** — Gestión de todas las reservas con acciones Confirmar / Finalizar / Cancelar.
- **`/admin/usuarios`** — Gestión de usuarios.

### Variables de entorno (`frontend/.env`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Cómo correr el frontend (desarrollo local)

**1. Instalar dependencias**

```bash
cd frontend
npm install
```

**2. Crear el archivo de entorno**

```bash
copy frontend\.env.example frontend\.env   # Windows
cp frontend/.env.example frontend/.env     # macOS / Linux
```

Asegúrate de que `NEXT_PUBLIC_API_URL` apunte al backend que ya está corriendo.

**3. Levantar el servidor de desarrollo**

```bash
npm run dev
```

La aplicación queda disponible en `http://localhost:3000`.

**4. Build de producción (opcional)**

```bash
npm run build
npm start
```

---

## Levantar todo con Docker Compose

Si preferís no instalar dependencias manualmente, podés levantar backend + frontend + PostgreSQL + Nginx con un solo comando:

```bash
# Desde la raíz del proyecto
docker compose up --build
```

| Servicio | URL |
|---|---|
| Frontend | `http://localhost` |
| Backend API | `http://localhost/api/` |
| Django Admin | `http://localhost/admin/` |

Para detener todo:

```bash
docker compose down
```

Para detener y eliminar los volúmenes (borra la base de datos):

```bash
docker compose down -v
```

---

## Roles de usuario

| Rol | Permisos |
|---|---|
| **USER** | Explorar canchas, crear y cancelar sus propias reservas |
| **ADMIN** | Todo lo anterior + gestionar canchas, confirmar/finalizar/cancelar cualquier reserva, ver el panel de administración |

Para promover un usuario a ADMIN desde el panel de Django Admin, usá la acción **"Hacer administrador"** en la sección Usuarios.

---

## Notas para producción

- Cambiar `DJANGO_SECRET_KEY` por una clave fuerte y `DJANGO_DEBUG=False`
- Limitar `CORS_ALLOWED_ORIGINS` y `DJANGO_ALLOWED_HOSTS` a los dominios reales
- Usar `USE_SQLITE=False` con una base de datos PostgreSQL en un volumen persistente
- Configurar HTTPS con certificados en Nginx
