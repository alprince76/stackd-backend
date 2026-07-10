# Stackd — Fullstack Next.js

Product launch platform for Indonesia & SEA. **Next.js 15** App Router + **Prisma** + **PostgreSQL** + **Auth.js**.

Formerly planned as separate NestJS backend — now unified in this repo.

## Documentation

| Document | Purpose |
|----------|---------|
| [PLAN.md](./PLAN.md) | Original NestJS blueprint (schema/state machine still valid) |
| [docs/FLOWS.md](./docs/FLOWS.md) | Feature flows — Server Actions + RSC |
| [docs/API-CONTRACT.md](./docs/API-CONTRACT.md) | Response shapes (reference) |
| [docs/SEED.md](./docs/SEED.md) | Seed data spec |

## Quick Start

```bash
# Prerequisites: Node 20+, Docker Desktop

cp .env.example .env
# Set AUTH_SECRET: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

docker compose up -d
npm install
npm run setup
npm run dev
```

Open http://localhost:3000

### Windows troubleshooting

- **Port 5432 in use:** Docker Postgres uses port `5433` (see `docker-compose.yml`). Ensure `.env` uses `localhost:5433`.
- **`npm install` slow or hanging:** Project `.npmrc` sets `strict-ssl=false` for dev machines with SSL inspection (antivirus/proxy). If install still hangs, try a different network or mobile hotspot.
- **Docker not running:** Start Docker Desktop first, then `docker compose up -d`.
- **Prisma engine download fails (SSL):** `postinstall` uses `scripts/prisma-generate.js` to work around TLS issues on some Windows machines. If it fails while dev server is running, stop `npm run dev` and run `npm install` again.

## Dev Login

| User | Email | Password |
|------|-------|----------|
| Maker | rifqi@stackd.id | DevPassword123! |
| Admin | admin@stackd.id | DevPassword123! |

## Stack (MVP)

- Next.js 15 App Router, React 19, Tailwind CSS 4
- Prisma + PostgreSQL
- Auth.js (Credentials, JWT session)
- Server Actions for mutations (vote, comment, submit, admin)
- Deploy: Vercel + Neon (see `vercel.json`)

## MVP Scope

**Included:** leaderboard, product detail, auth, vote, comment, submit, admin queue, seed mirror mock-data

**Deferred:** Redis, BullMQ, S3 uploads, email verify, OAuth, OpenAPI

## Project Structure

```
src/app/           # App Router pages
src/components/    # UI (ported from stack-id-product)
src/lib/
  actions/         # Server Actions
  queries/         # Prisma read helpers
  auth.ts          # Auth.js config
prisma/            # schema + seed
```

## Deploy (Vercel + Neon)

1. Create Neon Postgres database
2. Set env: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`
3. Connect repo to Vercel — `vercel.json` runs migrations on build

## Frontend Source

UI ported from `stack-id-product` (TanStack Start / Lovable). That repo is archived for this fullstack path.
