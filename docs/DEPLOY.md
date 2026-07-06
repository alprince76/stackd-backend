# Deploy — Vercel + Neon

## 1. Neon Postgres

1. Create project at https://neon.tech
2. Copy connection string → `DATABASE_URL`

## 2. Vercel

1. Import GitHub repo `alprince76/stackd-backend`
2. Framework: Next.js (auto-detected)
3. Environment variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Neon pooled connection string |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | `https://your-app.vercel.app` |

4. Deploy — `vercel.json` runs `prisma migrate deploy` on build

## 3. Post-deploy

```bash
# Seed production (once, from local)
DATABASE_URL="..." npm run db:seed
```

## 4. Local Docker (dev)

```bash
docker compose up -d
cp .env.example .env
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```
