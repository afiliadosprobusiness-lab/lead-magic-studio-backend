# LeadMagic API Contract (v1)

## Convenciones generales
- Base URL versionada: `/api/v1`
- Health sin version: `/health`
- Formato de respuesta:
  - Success: `{ "success": true, "data": ... }`
  - Error: `{ "success": false, "error": { code, message, details?, requestId } }`
- Correlacion de usuario (fase MVP): header `x-user-id` (opcional, fallback a `DEFAULT_USER_ID`).
- Correlacion de request: header `x-request-id` (opcional, backend lo genera si no existe).

## Endpoints iniciales

### GET /health
Estado basico del servicio.

Response `200`
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "lead-magic-studio-backend",
    "timestamp": "2026-03-10T12:00:00.000Z"
  }
}
```

### GET /api/v1/projects
Lista proyectos del usuario actual.

Response `200`
```json
{
  "success": true,
  "data": [
    {
      "id": "cuid",
      "name": "Proyecto A",
      "status": "READY",
      "createdAt": "ISO",
      "updatedAt": "ISO",
      "latestGenerationStatus": "COMPLETED"
    }
  ]
}
```

### POST /api/v1/projects
Crea proyecto + input del wizard.

Request body
```json
{
  "name": "Proyecto A",
  "input": {
    "offerName": "LeadMagic Studio",
    "offerDescription": "Descripcion",
    "targetAudience": "Founders SaaS",
    "painPoints": ["pain 1"],
    "benefits": ["benefit 1"],
    "uniqueValueProposition": "UVP",
    "tone": "Directo",
    "callToAction": "Agenda demo",
    "language": "es"
  }
}
```

Response `201`
```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "name": "Proyecto A",
    "status": "DRAFT",
    "ownerId": "demo-user",
    "createdAt": "ISO",
    "updatedAt": "ISO",
    "input": {}
  }
}
```

### GET /api/v1/projects/:id
Obtiene detalle de proyecto.

Response `200`
```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "name": "Proyecto A",
    "status": "READY",
    "ownerId": "demo-user",
    "createdAt": "ISO",
    "updatedAt": "ISO",
    "input": {}
  }
}
```

### POST /api/v1/projects/:id/duplicate
Duplica proyecto e input.

Request body (opcional)
```json
{
  "name": "Proyecto A (Copy)"
}
```

Response `201`
```json
{
  "success": true,
  "data": {
    "id": "new-cuid",
    "name": "Proyecto A (Copy)",
    "status": "DRAFT"
  }
}
```

### POST /api/v1/projects/:id/generate
Inicia generacion mock.

Request body
```json
{
  "parts": ["landing", "copy", "creatives"]
}
```

`parts` es opcional; por defecto se generan todas las partes.

Response `202`
```json
{
  "success": true,
  "data": {
    "projectId": "cuid",
    "generation": {
      "id": "cuid",
      "status": "COMPLETED",
      "requestedParts": ["landing", "copy", "creatives"],
      "steps": []
    }
  }
}
```

### GET /api/v1/projects/:id/generation
Consulta estado de la ultima generacion.

Response `200`
```json
{
  "success": true,
  "data": {
    "projectId": "cuid",
    "projectStatus": "READY",
    "generation": {
      "id": "cuid",
      "status": "COMPLETED",
      "createdAt": "ISO",
      "startedAt": "ISO",
      "completedAt": "ISO",
      "steps": [
        {
          "key": "LANDING_MOCKUP",
          "status": "COMPLETED"
        }
      ]
    }
  }
}
```

### GET /api/v1/projects/:id/results
Devuelve ultima salida completada.

Response `200`
```json
{
  "success": true,
  "data": {
    "projectId": "cuid",
    "generationId": "cuid",
    "results": {
      "landing": {},
      "copy": {},
      "creatives": {}
    }
  }
}
```

Si no hay generacion completada, `generationId` y cada parte retornan `null`.

## Errores posibles
- `400 BAD_REQUEST`: validacion o payload invalido.
- `404 NOT_FOUND`: proyecto o ruta no encontrada.
- `409 CONFLICT`: conflicto de dominio (reservado para futuras reglas).
- `500 INTERNAL_ERROR`: error inesperado.

## Convenciones de status code
- `200` lectura exitosa.
- `201` recurso creado.
- `202` accion aceptada/iniciada (generacion).
- `400/404/409/500` segun caso.

## Versionado
- Version actual: `v1`.
- Estrategia: versionar por path (`/api/v1`, `/api/v2`).
- Cambios breaking se publican en nueva version, manteniendo `v1` por compatibilidad.

