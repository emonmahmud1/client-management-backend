# NestJS Backend Template

Reusable NestJS template with:
- JWT auth flow
- User and admin management foundation
- Prisma + PostgreSQL setup
- Mail module (verification + password reset)
- Shared guards/filters/interceptors and Swagger docs

## Quick Start

1. Install dependencies:
   - `npm install`
2. Copy env:
   - `cp .env.example .env`
3. Generate Prisma client:
   - `npx prisma generate`
4. Push schema to database (for local template setup):
   - `npx prisma db push`
5. Seed super admin:
   - `npx prisma db seed`
6. Run dev server:
   - `npm run start:dev`

## Useful Commands

- `npm run lint`
- `npm run test`
- `npm run test:e2e`
- `npm run build`

## API Docs

After starting the app:
- `http://localhost:3000/api/v1/docs`

## Health Endpoint

- `GET /api/v1/health`
