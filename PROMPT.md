# Cursor Prompt — Stackd Backend

Salin isi di bawah ini ke Cursor Agent mode saat memulai implementasi di repo `stackd-backend`.

---

```
Kamu adalah senior backend engineer. Bangun backend "Stackd" — Product Hunt versi Indonesia — mengikuti spesifikasi di bawah. Kerjakan secara TDD, commit per fitur, jangan skip test.

Baca dulu: PLAN.md, docs/FLOWS.md, docs/API-CONTRACT.md, docs/SEED.md di repo ini.

STACK WAJIB
- NestJS 10 + TypeScript strict
- PostgreSQL 16 + Prisma
- Redis 7 (rate limit, cache, BullMQ)
- Storage S3-compatible via presigned URL (dev: MinIO via docker-compose)
- Auth: JWT RS256 access (15m) + refresh rotating httpOnly cookie (7d), password Argon2id
- Test: Jest + Supertest + Testcontainers (Postgres & Redis nyata di CI)
- Email: Resend (abstraksi interface EmailProvider supaya bisa diganti)
- Logger: pino, error: Sentry, config: @nestjs/config + zod schema

STRUKTUR FOLDER
stackd-backend/
├── src/
│   ├── main.ts, app.module.ts
│   ├── common/            # guards, interceptors, filters, pipes, decorators
│   │   ├── guards/        # jwt, roles, throttle
│   │   ├── decorators/    # @CurrentUser(), @Roles(), @Public()
│   │   ├── filters/       # http-exception, prisma-exception
│   │   └── dto/           # pagination, id-param
│   ├── config/            # env schema (zod)
│   ├── prisma/            # PrismaService + module
│   ├── modules/
│   │   ├── auth/          # register, login, refresh, logout, verify, forgot/reset
│   │   ├── users/         # profile, follow, avatar upload URL
│   │   ├── products/      # submit, list, detail, edit, delete
│   │   ├── votes/         # upvote toggle
│   │   ├── comments/      # thread datar
│   │   ├── categories/    # seeded, read-only
│   │   ├── newsletters/   # CRUD admin, list public, subscribe
│   │   ├── admin/         # queue, dashboard, audit
│   │   ├── uploads/       # presigned URL S3
│   │   ├── search/        # pg_trgm
│   │   └── health/
│   └── jobs/              # BullMQ: publish-product, send-newsletter
├── prisma/schema.prisma, migrations/, seed.ts
├── test/unit/, test/e2e/
├── docker-compose.yml
├── Dockerfile, .env.example, README.md

MODEL DATA (Prisma)
User (id, email unique, passwordHash, username unique, name, avatarKey, bio, twitter, website, emailVerifiedAt, createdAt)
UserRole (userId, role) — PK gabungan, JANGAN kolom users.role. Roles: user | maker | admin
Product (id, slug unique, name, tagline, description, thumbnailKey, screenshotKeys[], categoryId, tags[], launchDate, website, makerId, status enum[pending|scheduled|approved|rejected], scheduledAt, publishedAt, createdAt)
Vote (userId, productId, createdAt) — PK gabungan
Comment (id, productId, authorId, text, createdAt, deletedAt)
Follow (followerId, followingId, createdAt) — PK gabungan
Category (slug PK, name, emoji) — seeded
Newsletter (id, title, slug, coverKey, shortDescription, content, publishDate, status enum[draft|scheduled|published], featuredProductIds[])
NewsletterSubscriber (email unique, confirmedAt, unsubscribeToken)
RefreshToken (id, userId, tokenHash, expiresAt, revokedAt, userAgent, ip)
AdminAudit (id, adminId, action, targetType, targetId, metadata, createdAt)

VISIBILITY LEADERBOARD: status=approved AND publishedAt IS NOT NULL
Admin approve instant → set publishedAt=now(). Admin schedule → BullMQ job at scheduledAt sets publishedAt.

ENDPOINT (semua /api/v1)

Auth
- POST /auth/register — email, password, username, name
- POST /auth/login — set refresh cookie, return access token
- POST /auth/refresh — rotasi refresh token
- POST /auth/logout 🔒
- POST /auth/verify-email (token)
- POST /auth/forgot-password / POST /auth/reset-password
- GET /auth/me 🔒

Users
- GET /users/:username — profile publik + produk milik
- PATCH /users/me 🔒 — bio, name, twitter, website
- POST /users/me/avatar-upload-url 🔒 — presigned PUT
- POST /users/:username/follow 🔒 (toggle)
- GET /users/me/following 🔒

Products
- GET /products?tab=today|yesterday|week|month&category=&sort=&cursor=
- GET /products/:slug
- POST /products 🔒 — submit (status=pending), assign role maker on first submit
- PATCH /products/:id 🔒 (owner) / 👑
- DELETE /products/:id 🔒 (owner) / 👑
- POST /products/upload-url 🔒 — presigned thumbnail/screenshots

Votes
- POST /products/:id/vote 🔒 (toggle, idempotent, rate-limited 30/min/user)
- GET /products/:id/voters?cursor=

Comments
- GET /products/:id/comments?cursor=
- POST /products/:id/comments 🔒
- DELETE /comments/:id 🔒 (author) / 👑

Categories
- GET /categories
- GET /categories/:slug/products

Search
- GET /search?q=&type=product|creator

Newsletter (public)
- GET /newsletters — list published
- GET /newsletters/:slug
- POST /newsletters/subscribe — double opt-in
- GET /newsletters/confirm?token=
- POST /newsletters/unsubscribe?token=

Admin 👑
- GET /admin/dashboard — stats
- GET /admin/queue?status=pending|scheduled
- POST /admin/products/:id/approve — set publishedAt=now()
- POST /admin/products/:id/reject (alasan)
- POST /admin/products/:id/schedule (ISO datetime)
- POST/PATCH/DELETE /admin/newsletters
- POST /admin/newsletters/:id/publish
- POST /admin/contact

Health
- GET /health/live, GET /health/ready

KEAMANAN — TIDAK BOLEH DILANGGAR
- Password Argon2id (memory 64MB, timeCost 3)
- Access JWT RS256; refresh token hash di DB; cookie HttpOnly Secure SameSite=Lax
- Rotasi refresh + deteksi reuse → revoke seluruh chain
- Rate limit global (Redis) + spesifik: login 5/min/IP, vote 30/min/user, submit 5/jam/user, comment 20/min/user
- Validasi input class-validator + zod; reject body >100KB
- RBAC via UserRole table + hasRole(userId, role) — JANGAN kolom users.role
- DOMPurify server-side pada description & newsletter content
- Presigned upload: MIME whitelist (png/jpeg/webp), max 5MB avatar / 10MB screenshot
- CORS whitelist frontend origin; helmet, HSTS
- CSRF strategy untuk cookie refresh
- AdminAudit log untuk approve/reject/publish
- Zod env validation saat boot

ATURAN KERJA
1. Setup: docker-compose (postgres, redis, minio, mailhog), Prisma init, env.example, husky + lint-staged + eslint + prettier
2. Tiap modul: e2e test dulu (RED) → unit test → implement (GREEN) → refactor. Jangan implement tanpa test
3. Role di tabel user_roles terpisah. Sediakan hasRole(userId, role)
4. Response envelope: { data, meta? }. Error: { error: { code, message, details? } } — code stabil
5. Rate limit @nestjs/throttler + Redis backend
6. Upload: endpoint hanya presigned PUT URL + key; klien upload langsung ke S3
7. Scheduled publish: BullMQ job publish-product; idempotent
8. Search: PostgreSQL pg_trgm + GIN. Jangan Elasticsearch
9. Migration Prisma per fitur — JANGAN edit migration lama
10. Seed mirror mock-data.ts frontend — lihat docs/SEED.md
11. OpenAPI @nestjs/swagger di /api/docs (nonaktif production kecuali flag)
12. CI: lint → typecheck → unit → e2e → build docker

URUTAN MODUL (jangan lompat)
health → auth → users → uploads → products → votes → comments → categories → search → newsletters → admin → jobs → ci

DEFINITION OF DONE per endpoint
- DTO + validasi
- Service unit test (≥1 happy, ≥2 edge/failure)
- Controller e2e (auth guard, RBAC, rate limit smoke)
- Swagger decorators
- Contoh cURL di README

KONTRAK FRONTEND (docs/API-CONTRACT.md)
- thumbnailUrl bukan thumbnailKey di response
- hasUpvoted boolean untuk user login
- maker sebagai object { username, name, avatarUrl }
- Pagination cursor-based: meta.nextCursor
- Frontend "published" = backend approved + publishedAt != null

BOUNDARY FASE 1
- Repo frontend stack-id-product TIDAK diubah
- Admin frontend (cookie stackd-admin) dan admin backend (JWT) independen sampai integrasi
- Jangan implement OAuth MVP

Mulai dari setup + health, lalu modul auth.
```
