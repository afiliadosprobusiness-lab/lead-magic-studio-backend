# LeadMagic Mockup Studio Backend Context

## Vision del backend
Este backend es el nucleo operativo de LeadMagic Studio. Convierte datos del wizard en proyectos persistidos, resultados de mockups y ahora tambien en activos de marketing reutilizables para ejecucion publicitaria.

## Rol del backend
- Exponer API REST versionada para frontend.
- Persistir proyectos, inputs, jobs de generacion y resultados.
- Orquestar generacion desacoplada por engines/providers mock (listo para proveedores reales).
- Unificar assets y trazabilidad por proyecto para preparar una fase de publishing real.

## Arquitectura vigente
- Stack: `Express + TypeScript + Prisma + SQLite`
- API prefix: `/api/v1`
- Patron: modular monolith con `controller/service/repository`
- Validacion de entrada con `Zod`
- Correlacion temporal de usuario por `x-user-id`

## Modulos
### Existentes
- `health`
- `projects`
- `generation`
- `mockup-results`
- `uploads`
- `ugc`

### Nuevos (Phase 1 Growth)
- `copy-generator`
- `templates`
- `asset-library`
- `creative-packs`
- `publisher-drafts`
- `project-history`

## Endpoints agregados en fase 1
- Copy Generator:
  - `POST /api/v1/projects/:id/copies/generate`
  - `GET /api/v1/projects/:id/copies`
  - `GET /api/v1/copies/:copyId`
  - `POST /api/v1/copies/:copyId/duplicate`
  - `PATCH /api/v1/copies/:copyId`
  - `DELETE /api/v1/copies/:copyId`
- Templates:
  - `GET /api/v1/copy-templates`
  - `POST /api/v1/copy-templates`
  - `PATCH /api/v1/copy-templates/:id`
  - `DELETE /api/v1/copy-templates/:id`
- Creative Packs:
  - `POST /api/v1/projects/:id/creative-packs`
  - `GET /api/v1/projects/:id/creative-packs`
  - `GET /api/v1/creative-packs/:id`
- Asset Library:
  - `GET /api/v1/projects/:id/assets`
- Publisher Drafts:
  - `POST /api/v1/projects/:id/publication-drafts`
  - `GET /api/v1/projects/:id/publication-drafts`
  - `GET /api/v1/publication-drafts/:id`
  - `PATCH /api/v1/publication-drafts/:id`
  - `DELETE /api/v1/publication-drafts/:id`
- History:
  - `GET /api/v1/projects/:id/history`

## Capa de copy generation
- Nueva abstraccion `CopyGenerationEngine` desacoplada del transporte HTTP.
- Implementacion actual: `MockCopyGenerationEngine`.
- Input soportado:
  - project input
  - objetivo
  - tono
  - plataforma opcional
  - idioma opcional
  - template opcional
- Output: multiples variantes de copy (`headline`, `primaryText`, `cta`, `shortCaption`, `hookVariants`).

## Asset Library unificada
El backend agrega un inventario logico por proyecto para consultar en un solo endpoint:
- landing mockups
- copy mockups
- creative mockups
- resultados UGC
- generated copies
- creative packs

## Historial y trazabilidad
Se persisten eventos en `ProjectHistoryEvent` para:
- creacion/completado/error de generation jobs
- creacion/completado/error de UGC jobs
- creacion de generated copies
- creacion de templates ligados a proyecto
- creacion de creative packs
- creacion de publication drafts

## Seguridad y estado actual
- Sin auth real todavia; `x-user-id` como mecanismo temporal.
- Sin colas reales; ejecucion sincronica en request.
- Sin provider real de IA/UGC; motores mock con interfaces listas para providers reales.
- Sin storage cloud; filesystem local para uploads.

## Variables de entorno criticas
- `NODE_ENV`
- `PORT`
- `API_PREFIX`
- `DATABASE_URL`
- `LOG_LEVEL`
- `DEFAULT_USER_ID`
- `CORS_ALLOWED_ORIGINS`
- `CORS_ALLOWED_ORIGIN_SUFFIXES`

## Fuera de alcance en esta fase
- Integraciones reales con Meta/TikTok/Google publish APIs.
- Workers/colas distribuidas.
- Autenticacion/autorizacion productiva completa.
- Provider real LLM/visual en produccion.
