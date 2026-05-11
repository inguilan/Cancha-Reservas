# Cancha Pro - Plataforma Full Stack de Reservas

Arquitectura profesional para reservas de canchas deportivas.

## Stack

- Frontend: Next.js 15 + TypeScript + TailwindCSS + Zustand
- Backend: Django + Django REST Framework + JWT
- DB: PostgreSQL
- Infra: Docker + Docker Compose + Nginx
- Deployment target: AWS EC2

## Estructura

- frontend/
- backend/
- nginx/
- docker-compose.yml

## Modulos backend

- /api/auth/
- /api/users/
- /api/courts/
- /api/reservations/
- /api/dashboard/

## Levantar en local

1. Copiar variables de entorno:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

2. Levantar servicios:

```bash
docker compose up --build
```

3. Servicios:

- App: http://localhost
- API: http://localhost/api/
- Admin Django: http://localhost/admin/

## Crear superusuario

```bash
docker compose exec backend python manage.py createsuperuser
```

## Notas de produccion (EC2)

- Configurar SECRET_KEY fuerte y DEBUG=False
- Limitar CORS_ALLOWED_ORIGINS y DJANGO_ALLOWED_HOSTS
- Adjuntar volumen persistente para PostgreSQL
- Usar HTTPS con certificados en Nginx
- Agregar CI/CD (lint, test, build, deploy)

## Roadmap sugerido

- Pasarela de pagos
- QR de acceso a reserva
- Notificaciones por correo y push
- WebSockets para disponibilidad en tiempo real
- App movil
