# Catálogo SaaS

Plataforma multi-tenant de catálogos con carrito de compras. Cada negocio se registra, un
super admin lo aprueba, y el negocio gestiona su catálogo y recibe pedidos de clientes vía
una URL pública (`/tienda/{slug}`).

## Stack

- **Monorepo**: `client/` + `server/` (npm workspaces).
- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS v4, shadcn/ui, React Router v7, Zustand, React Query, React Hook Form + Zod.
- **Backend**: Express 5, TypeScript, Mongoose.
- **Base de datos**: **MongoDB** (⚠️ desviación del requisito original "Postgres": se usó MongoDB porque el servidor ya lo tenía; funcionalmente equivalente).
- **Auth**: JWT (access + refresh con rotación y detección de reuso), bcrypt, verificación de email, recuperación de contraseña.
- **Email**: Nodemailer + SMTP (Mailtrap para testing).
- **Despliegue**: VPS (Contabo) + Docker + nginx + Cloudflare.

## Estructura

```
client/src/
  api/          Cliente de la API (auth, tenant, products, categories, orders, admin, catalog)
  components/   UI (shadcn/ui + layout + guards)
  lib/          types, api (fetch wrapper), format, queryClient
  pages/        auth, dashboard, catalog, admin
  stores/       zustand (auth, cart, ui)
server/src/
  config/       env, db, limits, uploads
  controllers/  auth, tenant, category, product, order, admin, catalog
  middleware/   authenticate, authorize, validate, upload, rateLimiter, errorHandler
  models/       User, Tenant, Category, Product, Order, RefreshToken, EmailToken, LoginAttempt
  routes/       por dominio
  schemas/      validación Zod
  services/     token, email, slug, image
  utils/        ApiError, asyncHandler, money, password, file, request
server/tests/    tests (unit + integración)
deploy/         nginx config, backup.sh, sudo-setup.sh, CI/CD
```

## Desarrollo local

```bash
npm install
npm run dev            # client + server (concurrently)
```

El server necesita MongoDB. En dev se usa un túnel SSH al Mongo del VPS:

```bash
ssh -fN -L 27017:localhost:27017 servidor
```

Configurar variables en `server/.env` (ver `server/.env.example`).

## Tests

```bash
npm test -w server     # unit + integración (Vitest + Supertest + mongodb-memory-server)
```

## Despliegue (producción)

- **Backend**: Docker (`server/Dockerfile`), corre como contenedor `catalogo-server` con `network_mode: host`.
- **Frontend**: build estático en `/var/www/catalogo/dist`, servido por nginx (ver `deploy/nginx-catalogo.conf`).
- **CI/CD**: `.github/workflows/deploy.yml` (requiere secrets `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`).
- **Backups**: `deploy/backup.sh` (cron diario a las 3 AM, retención 7 días).

## Seguridad

- Contraseñas con bcrypt (cost 12); nunca en texto plano.
- Rate limiting (auth + pedidos) y lockout de login anti fuerza bruta.
- Imágenes validadas por magic bytes (no por extensión).
- MongoDB con autenticación (usuario `catalogo`, solo acceso local).
- Scoping por `tenantId` en todas las queries.
