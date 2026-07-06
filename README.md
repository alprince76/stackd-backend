# Stackd Backend

REST API for [Stackd](https://github.com/alprince76/stackd-backend) — product launch platform for Indonesia & SEA.

**Frontend repo (separate):** `stack-id-product` — TanStack Start MVP, not modified in phase 1.

---

## Documentation

| Document | Purpose |
|----------|---------|
| [PLAN.md](./PLAN.md) | Master blueprint — architecture, boundaries, state machines |
| [PROMPT.md](./PROMPT.md) | Copy-paste prompt for Cursor Agent to implement |
| [docs/FLOWS.md](./docs/FLOWS.md) | Frontend flow → backend endpoint mapping |
| [docs/API-CONTRACT.md](./docs/API-CONTRACT.md) | Response shapes, error codes, JSON examples |
| [docs/SEED.md](./docs/SEED.md) | Seed data spec (mirrors frontend mock-data.ts) |

---

## Phase 1 Boundary

This repo is **backend-only** during phase 1:

- Frontend continues using mock data (`mock-data.ts` + `app-store.tsx`)
- No HTTP calls between repos yet
- Admin auth is **dual**: frontend cookie (`stackd-admin`) vs backend JWT + RBAC — independent until integration

See [PLAN.md §4 Boundary Matrix](./PLAN.md#4-boundary-matrix).

---

## Quick Start (after NestJS scaffold)

```bash
# Prerequisites: Node 20, Docker Desktop running

cp .env.example .env
docker compose up -d
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

| Service | URL |
|---------|-----|
| API | http://localhost:3001/api/v1 |
| Swagger | http://localhost:3001/api/docs |
| MinIO console | http://localhost:9001 |
| Mailhog | http://localhost:8025 |

---

## Dev Seed Credentials

After running seed (see [docs/SEED.md](./docs/SEED.md)):

| User | Email | Password |
|------|-------|----------|
| Maker (e.g. rifqi) | rifqi@stackd.id | `DevPassword123!` |
| Admin | admin@stackd.id | `DevPassword123!` |

---

## Implementation Order

```
health → auth → users → uploads → products → votes → comments
→ categories → search → newsletters → admin → jobs → CI
```

TDD required: e2e test first, then unit test, then implement.

Start implementation: open [PROMPT.md](./PROMPT.md) in Cursor Agent mode.

---

## API Overview

- Base path: `/api/v1`
- Auth: JWT Bearer (15m) + refresh httpOnly cookie (7d)
- Response: `{ data, meta? }` / error: `{ error: { code, message } }`

Full contract: [docs/API-CONTRACT.md](./docs/API-CONTRACT.md)

---

## Phase 2 — Frontend Integration (later)

When backend e2e tests pass:

1. Add `VITE_API_URL=http://localhost:3001/api/v1` to frontend
2. Create `src/lib/api-client.ts` with field adapters
3. Replace `app-store.tsx` mutations with React Query
4. Migrate admin auth from cookie to JWT

Order: [docs/FLOWS.md §13](./docs/FLOWS.md#13-integrasi--urutan-migrasi-frontend)

---

## License

Private — Stackd project.
