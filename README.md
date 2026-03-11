# LeadMagic Studio Backend

Backend independiente para `LeadMagic Mockup Studio`.

## Requisitos
- Node.js 20+ (probado en Node 22)
- npm

## Setup
```bash
npm install
cp .env.example .env
npm run prisma:migrate
npm run dev
```

Servidor por defecto: `http://localhost:4000`

## Scripts
- `npm run dev`: desarrollo con hot reload.
- `npm run build`: compila TypeScript a `dist/`.
- `npm run start`: ejecuta build compilado.
- `npm run prisma:generate`: genera cliente Prisma.
- `npm run prisma:migrate`: aplica migraciones en desarrollo.
- `npm run prisma:deploy`: aplica migraciones en despliegue.
- `npm run prisma:studio`: abre Prisma Studio.

## Endpoints MVP
- `GET /health`
- `GET /api/v1/projects`
- `POST /api/v1/projects`
- `GET /api/v1/projects/:id`
- `POST /api/v1/projects/:id/duplicate`
- `POST /api/v1/projects/:id/generate`
- `GET /api/v1/projects/:id/generation`
- `GET /api/v1/projects/:id/results`

## Documentacion
- `docs/context.md`
- `docs/contract.md`
- `docs/design.md`
- `docs/api-contract.md`

