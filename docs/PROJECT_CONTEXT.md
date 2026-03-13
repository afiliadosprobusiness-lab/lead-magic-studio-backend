# PROJECT_CONTEXT - LeadMagic Studio Backend

## Estado operativo actual
- Backend Node.js + Express + TypeScript + Prisma (SQLite).
- Arquitectura modular monolith (`controller/service/repository`).
- Prefix API: `/api/v1`.
- Correlacion usuario temporal con `x-user-id`.

## Modulos activos
- Base: `health`, `projects`, `generation`, `mockup-results`, `uploads`, `ugc`
- Phase 1 Growth: `copy-generator`, `templates`, `asset-library`, `creative-packs`, `publisher-drafts`, `project-history`

## Nuevas capacidades implementadas
1. Copy Generator con objetivos y tonos persistidos (`GeneratedCopy`) y motor desacoplado (`CopyGenerationEngine`).
2. Templates/presets persistentes (`CopyTemplate`) con soporte `isSystem` y `isPreset`.
3. Creative Packs persistidos (`CreativePack`, `CreativePackItem`).
4. Asset Library unificada por proyecto (`GET /projects/:id/assets`).
5. Publisher Drafts internos sin integracion externa real (`PublicationDraft`).
6. Historial cronologico por proyecto (`ProjectHistoryEvent` + `GET /projects/:id/history`).

## Endpoints nuevos
- `POST /api/v1/projects/:id/copies/generate`
- `GET /api/v1/projects/:id/copies`
- `GET /api/v1/copies/:copyId`
- `POST /api/v1/copies/:copyId/duplicate`
- `PATCH /api/v1/copies/:copyId`
- `DELETE /api/v1/copies/:copyId`
- `GET /api/v1/copy-templates`
- `POST /api/v1/copy-templates`
- `PATCH /api/v1/copy-templates/:id`
- `DELETE /api/v1/copy-templates/:id`
- `POST /api/v1/projects/:id/creative-packs`
- `GET /api/v1/projects/:id/creative-packs`
- `GET /api/v1/creative-packs/:id`
- `GET /api/v1/projects/:id/assets`
- `POST /api/v1/projects/:id/publication-drafts`
- `GET /api/v1/projects/:id/publication-drafts`
- `GET /api/v1/publication-drafts/:id`
- `PATCH /api/v1/publication-drafts/:id`
- `DELETE /api/v1/publication-drafts/:id`
- `GET /api/v1/projects/:id/history`

## Integridad de flujo existente
- No se rompen endpoints previos de `projects/generation/results/ugc/uploads`.
- Se agrego trazabilidad sin introducir colas ni workers.

## Limitaciones vigentes
- Motores de generacion siguen en modo mock.
- Publisher drafts aun no publican en plataformas externas.
- Storage de imagenes sigue en filesystem local.
- Sin auth real multiusuario.

## Migraciones
- Nueva migracion aplicada: `20260312213852_add_phase1_growth_modules`
