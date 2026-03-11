# LeadMagic Mockup Studio Backend Context

## Vision del backend
Este backend es el nucleo operativo de LeadMagic Mockup Studio. Su objetivo es transformar los datos del wizard en proyectos persistidos y resultados estructurados de mockups (landing, copy y creatives), con contratos estables para que el frontend pueda integrarse sin cambios de arquitectura.

## Rol del backend dentro del sistema
- Exponer API REST versionada para el frontend `lead-magic-studio`.
- Persistir proyectos, inputs y ejecuciones de generacion.
- Entregar estados de ejecucion y resultados estructurados.
- Orquestar la generacion mediante una interfaz desacoplada (`GenerationEngine`) para conectar motor real en la siguiente fase.

## Relacion con el frontend existente
- El frontend actual ya tiene landing publica, dashboard, wizard y resultados mock.
- Este backend no modifica frontend ni asume monorepo.
- El frontend consumira esta API para reemplazar datos mock por datos persistidos.
- La correlacion de usuario se prepara con `x-user-id` (stub), sin auth real en esta fase.

## Flujo esperado de datos
1. Usuario completa wizard en frontend.
2. Frontend envia `POST /api/v1/projects` con `name` + `input`.
3. Backend guarda `Project` y `ProjectInput`.
4. Frontend dispara `POST /api/v1/projects/:id/generate`.
5. Backend crea `GenerationJob` + `GenerationStep`, ejecuta motor mock y guarda resultados.
6. Frontend consulta `GET /api/v1/projects/:id/generation` para estado.
7. Frontend consume `GET /api/v1/projects/:id/results` para pintar vista final.
8. Frontend consulta historial con `GET /api/v1/projects` y puede duplicar con `POST /api/v1/projects/:id/duplicate`.

## Alcance MVP backend (fase actual)
- API inicial de health, projects, generation y results.
- Persistencia real con Prisma + SQLite + migraciones.
- Arquitectura modular con capas controller/service/repository.
- Validacion de entrada con Zod.
- Manejo consistente de errores.
- Logging basico HTTP + errores.
- Contratos DTO claros y estables.
- Preparacion para auth y jobs reales.

## Fuera de alcance por ahora
- Autenticacion/autorizacion completa (JWT, sesiones, RBAC).
- Motor IA real y proveedores externos.
- Cola distribuida (BullMQ, SQS, etc.).
- Webhooks/event streaming.
- Multi-tenant avanzado, billing y suscripciones.
- Rate limiting, auditoria avanzada y observabilidad enterprise.

