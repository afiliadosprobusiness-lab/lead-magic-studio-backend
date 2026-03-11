# LeadMagic Backend Design

## Arquitectura elegida
Se implemento un **modular monolith** en Node.js + TypeScript con Express.

Capas por modulo:
1. `routes/controller` para transporte HTTP.
2. `service` para reglas de negocio y orquestacion.
3. `repository` para acceso a datos (Prisma).

Esta forma permite escalar sin sobrearquitectura en fase MVP.

## Stack tecnico
- Node.js + TypeScript
- Express 5
- Prisma ORM
- SQLite (fase MVP)
- Zod (validacion)
- Pino + pino-http (logging)
- dotenv (config por entorno)

## Modulos y responsabilidades

### `health`
- Liveness check.

### `projects`
- Crear proyecto.
- Listar proyectos.
- Obtener detalle.
- Duplicar proyecto.

### `generation`
- Crear y administrar `GenerationJob` y `GenerationStep`.
- Orquestar ejecucion de generacion.
- Mantener estado de proyecto durante ciclo de generacion.
- Exponer abstraccion `GenerationEngine` para motor futuro real.

### `mockup-results`
- Consolidar resultados de la ultima generacion completada.

### `shared/common`
- Errores, middleware, validacion, respuesta estandar.

### `config`
- Carga y validacion de variables de entorno.
- Logger.

### `database`
- Cliente Prisma centralizado.

## Estructura de carpetas recomendada
```txt
src/
  app.ts
  server.ts
  config/
  database/
  routes/
  common/
    errors/
    http/
    middleware/
    types/
  modules/
    health/
    projects/
    generation/
      engine/
    mockup-results/
prisma/
  schema.prisma
  migrations/
docs/
```

## Decisiones tecnicas clave
- **Express + modular monolith**: baja friccion, rapido para MVP, simple de operar.
- **Prisma + SQLite**: persistencia robusta con migraciones y tipado fuerte; cambio futuro a Postgres sin reescritura de dominio.
- **JSON fields** para artefactos de mockup: evita rigidez prematura y acelera iteracion.
- **Stub auth (`x-user-id`)**: prepara ownership por usuario sin bloquear MVP.
- **Engine desacoplado**: mock actual, motor real reemplazable sin romper API.

## Estrategia de configuracion por entorno
- Variables centralizadas y validadas en `src/config/env.ts`.
- Variables actuales: `NODE_ENV`, `PORT`, `API_PREFIX`, `DATABASE_URL`, `LOG_LEVEL`, `DEFAULT_USER_ID`.
- `.env.example` como plantilla de bootstrap.

## Estrategia de errores
- Error de dominio con `AppError` (`code`, `statusCode`, `details`).
- Middleware global para transformar cualquier excepcion en contrato consistente.
- `requestId` inyectado en cada request para trazabilidad.

## Estrategia de validacion
- Zod en borde HTTP (body/params/query).
- Regla: no entra al service data sin validar.
- Respuesta uniforme para errores de validacion (`BAD_REQUEST` + `fieldErrors`).

## Estrategia de versionado de API
- Prefijo versionado `API_PREFIX` (por defecto `/api/v1`).
- Mantener `/api/v1` estable, agregar `/api/v2` cuando exista ruptura de contrato.
- `GET /health` se mantiene tambien sin version para chequeos de infraestructura.

## Estrategia de persistencia
- Esquema Prisma con entidades de proyecto, input, jobs, steps y mockups.
- Migraciones en `prisma/migrations`.
- En desarrollo: SQLite local (`prisma/dev.db`).
- Futuro: migrar datasource a PostgreSQL con mismo modelo de dominio.

## Estrategia de escalabilidad
- Separacion por modulo permite extraer bounded contexts a servicios si fuera necesario.
- Repository layer evita acoplamiento directo al ORM en controllers/services.
- Motor de generacion aislado habilita mover ejecucion a workers/colas.
- Contratos DTO y API versionada minimizan impacto de cambios.

## Puntos de extension futuros
- Auth real (JWT/OAuth/session) sobre `ownerId`.
- Cola de jobs (BullMQ/SQS) para generacion asincrona real.
- Integracion con LLM/providers en `GenerationEngine`.
- Webhooks/eventos para progreso en tiempo real.
- Observabilidad avanzada (metrics, tracing, alerting).

