# LeadMagic API Contract (v1)

## Convenciones generales
- Base URL versionada: `/api/v1`
- Health sin version: `/health`
- Alias de compatibilidad health: `/api/v1/health`
- Formato de respuesta:
  - Success: `{ "success": true, "data": ... }`
  - Error: `{ "success": false, "error": { code, message, details?, requestId } }`
- Correlacion de usuario (fase MVP): header `x-user-id` (opcional, fallback a `DEFAULT_USER_ID`).
- Correlacion de request: header `x-request-id` (opcional, backend lo genera si no existe).

## Endpoints

### GET /health
Estado basico del servicio.

### GET /api/v1/projects
Lista proyectos del usuario actual.

### POST /api/v1/projects
Crea proyecto + input del wizard.

### GET /api/v1/projects/:id
Obtiene detalle de proyecto.

### POST /api/v1/projects/:id/duplicate
Duplica proyecto e input.

### POST /api/v1/projects/:id/generate
Inicia generacion mockup tradicional.

### GET /api/v1/projects/:id/generation
Consulta estado de la ultima generacion tradicional.

### GET /api/v1/projects/:id/results
Devuelve ultima salida completada tradicional.

### POST /api/v1/uploads/product-images
Sube una o mas fotos de producto para UGC Ads Generator.

Request body
```json
{
  "projectId": "cuid",
  "files": [
    {
      "fileName": "product.png",
      "mimeType": "image/png",
      "contentBase64": "iVBORw0KGgoAAAANSUhEUgAA..."
    }
  ]
}
```

Response `201`
```json
{
  "success": true,
  "data": {
    "projectId": "cuid",
    "uploadedImages": [
      {
        "id": "cuid",
        "projectId": "cuid",
        "storageProvider": "LOCAL_DEV",
        "storagePath": "storage/uploads/product-images/...",
        "publicUrl": null,
        "originalFileName": "product.png",
        "mimeType": "image/png",
        "sizeBytes": 218111,
        "checksumSha256": "hex",
        "createdAt": "ISO"
      }
    ]
  }
}
```

### GET /api/v1/ugc/presets/scenes
Lista presets de escenas permitidos.

### GET /api/v1/ugc/presets/avatars
Lista presets de avatars permitidos.

### POST /api/v1/ugc/generate
Crea y ejecuta un job UGC asociado a un proyecto.

Request body
```json
{
  "projectId": "cuid",
  "productImageIds": ["cuid-image-1"],
  "creativeType": "creator_style_ad_concepts",
  "targetPlatform": "tiktok",
  "scenePreset": "studio_tabletop",
  "avatarPreset": "creator_friendly_expert",
  "toneStyle": "direct response",
  "customPrompt": "foco en beneficios funcionales",
  "outputFormats": ["vertical_9_16", "square_1_1"],
  "brandSafeMode": true,
  "disclosureEnabled": true,
  "contentPolicyChecks": ["creativeTypeAllowlist", "prohibitedClaims", "outputModeration"]
}
```

Response `202`
```json
{
  "success": true,
  "data": {
    "projectId": "cuid",
    "job": {
      "id": "cuid",
      "projectId": "cuid",
      "status": "COMPLETED",
      "progress": 100,
      "creativeType": "creator_style_ad_concepts",
      "targetPlatform": "tiktok",
      "scenePreset": "studio_tabletop",
      "avatarPreset": "creator_friendly_expert",
      "toneStyle": "direct response",
      "outputFormats": ["vertical_9_16", "square_1_1"],
      "brandSafeMode": true,
      "disclosureEnabled": true,
      "contentPolicyChecks": ["creativeTypeAllowlist", "prohibitedClaims", "outputModeration"],
      "productImageIds": ["cuid-image-1"],
      "errorMessage": null,
      "startedAt": "ISO",
      "completedAt": "ISO",
      "createdAt": "ISO",
      "updatedAt": "ISO"
    }
  }
}
```

### GET /api/v1/ugc/jobs/:id
Devuelve el estado de un job UGC.

### GET /api/v1/ugc/jobs/:id/results
Devuelve resultado estructurado del job UGC.

Response `200`
```json
{
  "success": true,
  "data": {
    "jobId": "cuid",
    "projectId": "cuid",
    "status": "COMPLETED",
    "result": {
      "creativeVariants": [],
      "imageResultReferences": [],
      "hookSuggestions": [],
      "shortCopySuggestions": [],
      "ctaSuggestions": [],
      "placementFormats": ["vertical_9_16"],
      "disclosureFlags": {
        "enabled": true,
        "label": "AI-generated synthetic ad concept. Not a real customer testimonial.",
        "requiredByBrandSafe": true
      },
      "safetyMetadata": {
        "brandSafeMode": true,
        "appliedChecks": ["creativeTypeAllowlist", "prohibitedClaims"],
        "blockedClaimCount": 0,
        "filteredClaims": [],
        "warnings": []
      }
    }
  }
}
```

### GET /api/v1/ugc/projects/:projectId/jobs
Lista historial de jobs UGC por proyecto.

## Reglas de producto/safety UGC
- El modulo se define como synthetic UGC para anuncios.
- Prohibido generar contenido que simule testimonios/reseñas/autenticidad de cliente real.
- `brandSafeMode=true` requiere `disclosureEnabled=true`.
- El backend bloquea claims engañosos en request y filtra output en capa de moderacion.

## Errores posibles
- `400 BAD_REQUEST`: validacion o payload invalido.
- `404 NOT_FOUND`: proyecto/job/ruta no encontrada.
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
