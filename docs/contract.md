# LeadMagic Backend Contract

## Scope v1
Backend REST API for LeadMagic Studio with stack Express + TypeScript + Prisma + SQLite.

Base prefix: `/api/v1`

Success shape:
```json
{
  "success": true,
  "data": {}
}
```

Error shape:
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Validation failed",
    "details": {},
    "requestId": "uuid"
  }
}
```

## Core entities

### Existing entities
- `Project`
- `ProjectInput`
- `GenerationJob`
- `GenerationStep`
- `LandingMockup`
- `CopyMockup`
- `CreativeMockup`
- `UGCProductImage`
- `UGCGenerationJob`
- `UGCGenerationJobImage`
- `UGCGenerationResult`

### New Phase 1 entities

#### GeneratedCopy
- `id: cuid`
- `projectId: cuid`
- `ownerId: string`
- `sourceTemplateId: cuid | null`
- `sourceGenerationJobId: cuid | null`
- `objective: CopyObjective`
- `tone: CopyTone`
- `platform: PublisherPlatform | null`
- `language: string`
- `label: string | null`
- `headline: string`
- `primaryText: string`
- `cta: string`
- `shortCaption: string`
- `hookVariants: json(string[])`
- `rawProviderResponse: json | null`
- `createdAt`, `updatedAt`

#### CopyTemplate
- `id: cuid`
- `ownerId: string`
- `projectId: cuid | null`
- `name: string`
- `description: string | null`
- `objective: CopyObjective | null`
- `tone: CopyTone | null`
- `platform: PublisherPlatform | null`
- `language: string`
- `isSystem: boolean`
- `isPreset: boolean`
- `templateText: string`
- `ctaDefault: string | null`
- `metadata: json | null`
- `createdAt`, `updatedAt`

#### CreativePack
- `id: cuid`
- `projectId: cuid`
- `ownerId: string`
- `name: string`
- `objective: CopyObjective | null`
- `tone: CopyTone | null`
- `platform: PublisherPlatform | null`
- `notes: string | null`
- `createdFromCopyId: cuid | null`
- `createdAt`, `updatedAt`

#### CreativePackItem
- `id: cuid`
- `creativePackId: cuid`
- `generatedCopyId: cuid | null`
- `assetType: CreativePackItemType`
- `assetId: cuid`
- `label: string | null`
- `metadata: json | null`
- `createdAt`
- unique `(creativePackId, assetType, assetId)`

#### PublicationDraft
- `id: cuid`
- `projectId: cuid`
- `ownerId: string`
- `platform: PublisherPlatform`
- `selectedCopyId: cuid | null`
- `creativePackId: cuid | null`
- `selectedAssetRefs: json([{type, id, label?}])`
- `captionText: string`
- `finalText: string | null`
- `ctaText: string | null`
- `finalUrl: string | null`
- `status: PublicationDraftStatus`
- `scheduledAt: datetime | null`
- `createdAt`, `updatedAt`

#### ProjectHistoryEvent
- `id: cuid`
- `projectId: cuid`
- `ownerId: string`
- `eventType: ProjectHistoryEventType`
- `entityType: string`
- `entityId: cuid`
- `summary: string`
- `payload: json | null`
- `createdAt`

## Enums

### Existing
- `ProjectStatus`: `DRAFT | READY | GENERATING | FAILED | ARCHIVED`
- `GenerationJobStatus`: `QUEUED | PROCESSING | COMPLETED | FAILED | CANCELED`
- `GenerationStepStatus`: `PENDING | RUNNING | COMPLETED | FAILED | SKIPPED`

### New
- `CopyObjective`: `DIRECT_SALE | AWARENESS | REMARKETING | LAUNCH | URGENCY_OFFER`
- `CopyTone`: `AGGRESSIVE | PREMIUM | EMOTIONAL | DIRECT | MINIMALIST`
- `PublisherPlatform`: `INSTAGRAM | FACEBOOK | TIKTOK | GOOGLE`
- `PublicationDraftStatus`: `DRAFT | READY`
- `CreativePackItemType`: `LANDING_MOCKUP | COPY_MOCKUP | CREATIVE_MOCKUP | UGC_RESULT | GENERATED_COPY`
- `ProjectHistoryEventType`:
  - `GENERATION_CREATED | GENERATION_COMPLETED | GENERATION_FAILED`
  - `UGC_JOB_CREATED | UGC_JOB_COMPLETED | UGC_JOB_FAILED`
  - `GENERATED_COPY_CREATED | COPY_TEMPLATE_CREATED | CREATIVE_PACK_CREATED | PUBLICATION_DRAFT_CREATED`

## Endpoints

### Existing (compatible, no breaking)
- `GET /health`
- `GET /api/v1/health`
- `GET /api/v1/projects`
- `POST /api/v1/projects`
- `GET /api/v1/projects/:id`
- `POST /api/v1/projects/:id/duplicate`
- `POST /api/v1/projects/:id/generate`
- `GET /api/v1/projects/:id/generation`
- `GET /api/v1/projects/:id/results`
- `POST /api/v1/uploads/product-images`
- `GET /api/v1/ugc/presets/scenes`
- `GET /api/v1/ugc/presets/avatars`
- `POST /api/v1/ugc/generate`
- `GET /api/v1/ugc/jobs/:id`
- `GET /api/v1/ugc/jobs/:id/results`
- `GET /api/v1/ugc/projects/:projectId/jobs`

### New Phase 1 endpoints

#### Copy Generator
- `POST /api/v1/projects/:id/copies/generate`
- `GET /api/v1/projects/:id/copies`
- `GET /api/v1/copies/:copyId`
- `POST /api/v1/copies/:copyId/duplicate`
- `PATCH /api/v1/copies/:copyId`
- `DELETE /api/v1/copies/:copyId`

#### Templates / Presets
- `GET /api/v1/copy-templates`
- `POST /api/v1/copy-templates`
- `PATCH /api/v1/copy-templates/:id`
- `DELETE /api/v1/copy-templates/:id`

#### Creative Packs
- `POST /api/v1/projects/:id/creative-packs`
- `GET /api/v1/projects/:id/creative-packs`
- `GET /api/v1/creative-packs/:id`

#### Asset Library
- `GET /api/v1/projects/:id/assets`

#### Publisher Drafts
- `POST /api/v1/projects/:id/publication-drafts`
- `GET /api/v1/projects/:id/publication-drafts`
- `GET /api/v1/publication-drafts/:id`
- `PATCH /api/v1/publication-drafts/:id`
- `DELETE /api/v1/publication-drafts/:id`

#### Project History
- `GET /api/v1/projects/:id/history`

## Main validation rules
- All route ids use `cuid`.
- Copy generation:
  - `objective`: `venta_directa | awareness | remarketing | lanzamiento | oferta_urgencia`
  - `tone`: `agresivo | premium | emocional | directo | minimalista`
  - `platform` optional: `instagram | facebook | tiktok | google`
  - `variants` optional `1..6`
- Creative packs:
  - `assets` is optional, but if omitted backend uses latest valid project assets.
- Publisher drafts:
  - `selectedCopyId`, `creativePackId` and `selectedAssetRefs` must belong to the same project.
  - `status`: `draft | ready`.
- Templates:
  - `isSystem` supported but system templates cannot be edited/deleted by API.

## Internal contracts

### CopyGenerator -> CopyGenerationEngine
- `generate(context)` receives `project input + objective + tone + platform? + language + template?`
- Returns multiple variants with `headline`, `primaryText`, `cta`, `shortCaption`, `hookVariants`.
- Current provider: mock.

### History tracking
Events are persisted on creation/finalization flows for:
- generation jobs
- ugc jobs
- generated copies
- relevant copy templates (project-linked)
- creative packs
- publication drafts

## Changelog de contrato
- Fecha: 2026-03-11
  - Cambio: modulo UGC Ads Generator agregado.
  - Tipo: additive (no-breaking).
  - Impacto: endpoints `/api/v1/ugc/*` y `/api/v1/uploads/product-images`.
- Fecha: 2026-03-12
  - Cambio: Phase 1 Growth modules (`copy-generator`, `templates`, `creative-packs`, `asset-library`, `publisher-drafts`, `project-history`).
  - Tipo: additive (no-breaking).
  - Impacto: nuevos endpoints `/api/v1/*` para copies, templates, packs, assets, drafts e historial; nuevas entidades Prisma y trazabilidad por proyecto.
