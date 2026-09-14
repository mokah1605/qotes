# Qotes backend

The API for the Qotes Android application. It uses Next.js, Auth.js, Prisma, and
Turso/libSQL in production, with SQLite for local development.

## Local setup

Create `.env.local` with `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, and
`AUTH_GOOGLE_SECRET`. Production also needs `TURSO_DATABASE_URL` and
`TURSO_AUTH_TOKEN`.

```bash
npm install
npm run dev
npm run lint
npm run build
```

The Android client uses `/api/quotes`, `/api/favorites`, `/api/quotes/:id/like`, and
`/api/auth/google-token`. Quote creation, favourites, and likes require authentication.

## Database changes

The production Turso database predates Prisma migrations. Follow
[`prisma/MIGRATIONS.md`](prisma/MIGRATIONS.md) to baseline it before deploying migrations.

Render deployment is configured in `render.yaml` and uses Node 22.
