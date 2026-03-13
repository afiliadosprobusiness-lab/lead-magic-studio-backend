# LeadMagic Studio Backend

Backend independiente para `LeadMagic Mockup Studio`.

## Requisitos
- Node.js 20+ (probado en Node 22)
- npm

## Correr local
```bash
npm install
cp .env.example .env
npm run prisma:migrate
npm run dev
```

URLs locales por defecto:
- API v1: `http://localhost:4000/api/v1`
- Healthcheck oficial: `http://localhost:4000/health`

## Variables de entorno requeridas
- `NODE_ENV`: `development | test | production`
- `PORT`: puerto HTTP del servidor
- `API_PREFIX`: **fijo en `/api/v1`** para esta v1
- `DATABASE_URL`: cadena de conexion de Prisma
- `LOG_LEVEL`: `fatal | error | warn | info | debug | trace`
- `DEFAULT_USER_ID`: fallback para `x-user-id` en fase MVP
- `CORS_ALLOWED_ORIGINS`: lista separada por comas de origenes exactos permitidos (ej. `https://app.tudominio.com`)
- `CORS_ALLOWED_ORIGIN_SUFFIXES`: lista separada por comas de sufijos de dominio permitidos para previews/futuros entornos (ej. `vercel.app`)

Notas de seguridad CORS:
- En `production`, el backend falla al iniciar si solo hay origenes locales y no hay sufijos configurados.
- Requests sin header `Origin` (healthchecks/server-to-server) siguen permitidos.
- Antes del proximo deploy en Railway, configura `CORS_ALLOWED_ORIGINS` con el dominio real del frontend y deja `CORS_ALLOWED_ORIGIN_SUFFIXES` solo para previews controlados.

## Base URL publica (Railway)
- Host publico actual (production): `https://api-production-db0f.up.railway.app`
- Base URL final para frontend: `https://api-production-db0f.up.railway.app/api/v1`
- Healthcheck oficial de infraestructura: `GET https://api-production-db0f.up.railway.app/health`

`railway.json` deja versionado el healthcheck path en `/health`.

## Endpoints disponibles (v1)
- `GET /health` (oficial)
- `GET /api/v1/health` (alias de compatibilidad)
- `GET /api/v1/projects`
- `POST /api/v1/projects`
- `GET /api/v1/projects/:id`
- `POST /api/v1/projects/:id/duplicate`
- `POST /api/v1/projects/:id/generate`
- `GET /api/v1/projects/:id/generation`
- `GET /api/v1/projects/:id/results`

## Prisma, migraciones y startup
- `npm run build`: compila TypeScript a `dist/`.
- `npm run start`: ejecuta `prisma migrate deploy` y luego `node dist/server.js`.
- Migraciones versionadas en `prisma/migrations/`.
- Para desarrollo usar `npm run prisma:migrate`.

Importante para despliegue: el schema actual usa `sqlite`. En Railway, SQLite sobre filesystem local no es persistencia robusta entre ciclos de despliegue; para entorno productivo estable se recomienda migrar a PostgreSQL en una siguiente fase.

## Estado de datos mock/seed
- La generacion actual usa `MockGenerationEngine` (`src/modules/generation/engine/mock-generation-engine.ts`).
- No hay script de seed inicial en el proyecto.
- La API persiste proyectos/jobs reales, pero el contenido generado (landing/copy/creatives) sigue siendo mock en esta v1.

## Scripts
- `npm run dev`: desarrollo con hot reload.
- `npm run build`: compila TypeScript a `dist/`.
- `npm run start`: aplica migraciones de deploy y levanta el servidor.
- `npm run prisma:generate`: genera cliente Prisma.
- `npm run prisma:migrate`: aplica migraciones en desarrollo.
- `npm run prisma:deploy`: aplica migraciones en despliegue.
- `npm run prisma:studio`: abre Prisma Studio.

## Documentacion
- `docs/context.md`
- `docs/contract.md`
- `docs/design.md`
- `docs/api-contract.md`
