# LeadMagic Backend Contract

## Entidades del sistema

### Project
- `id: string (cuid)`
- `ownerId: string`
- `name: string`
- `status: ProjectStatus`
- `createdAt: datetime`
- `updatedAt: datetime`
- Relacion 1:1 opcional con `ProjectInput`
- Relacion 1:N con `GenerationJob`

### ProjectInput
- `id: string (cuid)`
- `projectId: string (unique)`
- `offerName: string`
- `offerDescription: string`
- `targetAudience: string`
- `painPoints: json(string[])`
- `benefits: json(string[])`
- `uniqueValueProposition: string`
- `tone: string`
- `callToAction: string`
- `language: string`
- `rawWizardData: json | null`
- `createdAt: datetime`
- `updatedAt: datetime`

### GenerationJob
- `id: string (cuid)`
- `projectId: string`
- `status: GenerationJobStatus`
- `requestedParts: json(GenerationPart[])`
- `startedAt: datetime | null`
- `completedAt: datetime | null`
- `errorMessage: string | null`
- `createdAt: datetime`
- `updatedAt: datetime`
- Relacion 1:N con `GenerationStep`
- Relacion 1:1 opcional con `LandingMockup`, `CopyMockup`, `CreativeMockup`

### GenerationStep
- `id: string (cuid)`
- `generationJobId: string`
- `key: string` (`LANDING_MOCKUP`, `COPY_MOCKUP`, `CREATIVES_MOCKUP`)
- `label: string`
- `order: number`
- `status: GenerationStepStatus`
- `startedAt: datetime | null`
- `completedAt: datetime | null`
- `errorMessage: string | null`

### LandingMockup
- `id: string (cuid)`
- `generationJobId: string (unique)`
- `headline: string`
- `subheadline: string`
- `ctaText: string`
- `sections: json([{title, description}])`
- `rawData: json | null`

### CopyMockup
- `id: string (cuid)`
- `generationJobId: string (unique)`
- `adPrimaryText: string`
- `adHeadline: string`
- `adDescription: string`
- `emailSubject: string`
- `emailBody: string`
- `salesScriptHook: string`
- `rawData: json | null`

### CreativeMockup
- `id: string (cuid)`
- `generationJobId: string (unique)`
- `hooks: json(string[])`
- `visualDirections: json(string[])`
- `concepts: json([{title, visualAngle, message, format}])`
- `rawData: json | null`

## Estados

### ProjectStatus
- `DRAFT`
- `READY`
- `GENERATING`
- `FAILED`
- `ARCHIVED`

### GenerationJobStatus
- `QUEUED`
- `PROCESSING`
- `COMPLETED`
- `FAILED`
- `CANCELED`

### GenerationStepStatus
- `PENDING`
- `RUNNING`
- `COMPLETED`
- `FAILED`
- `SKIPPED`

## DTOs principales

### CreateProjectDto
```json
{
  "name": "Proyecto X",
  "input": {
    "offerName": "LeadMagic Studio",
    "offerDescription": "Descripcion de oferta",
    "targetAudience": "Founders SaaS",
    "painPoints": ["pain 1"],
    "benefits": ["benefit 1"],
    "uniqueValueProposition": "UVP",
    "tone": "Directo",
    "callToAction": "Agenda demo",
    "language": "es",
    "rawWizardData": {}
  }
}
```

### DuplicateProjectDto
```json
{
  "name": "Proyecto X (Copy)"
}
```

### GenerateProjectDto
```json
{
  "parts": ["landing", "copy", "creatives"]
}
```

## Request/Response shape base

### Success
```json
{
  "success": true,
  "data": {}
}
```

### Error
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

## Reglas de validacion principales
- `projectId` debe ser `cuid`.
- `name` 3-120 chars.
- `offerDescription` 10-2000 chars.
- `painPoints` y `benefits` min 1, max 12 items.
- `parts` (si se envian) solo permite: `landing`, `copy`, `creatives`.

## Contratos internos entre modulos

### Projects -> Generation
- `GenerationService.startGeneration(ownerId, projectId, payload)`
- Requiere `Project` + `ProjectInput` existentes.
- Produce `GenerationJob` y actualiza `ProjectStatus`.

### Projects -> MockupResults
- `MockupResultsService.getProjectResults(ownerId, projectId)`
- Devuelve ultima salida completada o null por parte.

### Generation -> Engine (abstraccion)
- `GenerationEngine.generate(context)`
- `context`: `projectId`, `projectName`, `input`, `requestedParts`.
- `output`: `GenerationResultPayload`.

