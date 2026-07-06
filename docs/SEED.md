# Seed Specification — Mirror mock-data.ts

Seed script: `prisma/seed.ts`

Source of truth for content: frontend repo `stack-id-product/src/lib/mock-data.ts` + `src/lib/app-store.tsx` (INITIAL_NEWSLETTERS).

Run: `npx prisma db seed`

---

## 1. Dev Credentials

All seeded users share the same dev password for local testing:

| Field | Value |
|-------|-------|
| Password | `DevPassword123!` |
| Hash | Argon2id at seed time |

**Admin user (additional):**

| Field | Value |
|-------|-------|
| email | `admin@stackd.id` |
| username | `stackdadmin` |
| name | `Stackd Admin` |
| roles | `user`, `admin` |
| password | `AdminDevPassword123!` (or same as `DevPassword123!` — pick one, document in README) |

---

## 2. Categories (9)

Exact match from `mock-data.ts` L48-58:

| slug | name | emoji |
|------|------|-------|
| saas | SaaS | ⚡ |
| mobile-app | Mobile App | 📱 |
| developer-tools | Developer Tools | 🛠️ |
| produktivitas | Produktivitas | 🧠 |
| ecommerce | Ecommerce | 🛍️ |
| edukasi | Edukasi | 📚 |
| kesehatan | Kesehatan | 💚 |
| keuangan | Keuangan | 💰 |
| lainnya | Lainnya | ✨ |

---

## 3. Users (10 makers)

Mirror `USERS` array. Each gets:
- `UserRole.user`
- `UserRole.maker` (all are makers in mock)
- `email`: `{username}@stackd.id`
- `avatarKey`: null — store external URL in seed metadata OR use dicebear URL as `avatarUrl` resolver fallback
- `emailVerifiedAt`: set to seed time (skip verify flow in dev)

| username | name | twitter | website |
|----------|------|---------|---------|
| rifqi | Rifqi Pratama | rifqi | rifqi.dev |
| sari | Sari Wulandari | sariw | — |
| andre | Andre Santoso | andresan | — |
| dewi | Dewi Kusuma | — | — |
| budi | Budi Hartono | budih | — |
| intan | Intan Permata | — | — |
| yoga | Yoga Pradipta | yogap | — |
| maya | Maya Anggraini | — | maya.id |
| fajar | Fajar Nugroho | fajarn | — |
| lia | Lia Marlina | — | — |

Bio strings: copy verbatim from mock-data.ts.

Avatar URLs (dev — external, not S3):

```
https://api.dicebear.com/7.x/avataaars/svg?seed={username}&backgroundColor=ffd5dc,c0aede,d1d4f9,b6e3f4
```

Implementation note: if `avatarKey` is null, `UsersService` returns dicebear URL from username pattern above, OR seed stores full URL in a dev-only field. Prefer: store URL in `avatarKey` as external URL prefix `external:` for dev simplicity.

---

## 4. Products — Approved (30)

Mirror `PRODUCTS` — preserve **exact IDs** `"1"` through `"30"`.

For each product from `productSeeds` + generated slug/thumbnail:

| Field | Seed rule |
|-------|-----------|
| id | `"1"` … `"30"` (string cuid override or explicit id in seed) |
| slug | lowercase name, non-alphanumeric → `-` |
| status | `approved` |
| publishedAt | `launchDate` at 00:00:00 WIB |
| thumbnailKey | external URL from dicebear shapes OR null + URL resolver |
| screenshotKeys | 3 picsum URLs per product |
| makerId | resolve by maker username |
| categoryId | category slug |
| tags | copy from mock |
| upvotes | **do not store on Product** — seed Vote rows instead |

### Slug reference (generated from names)

| id | name | slug |
|----|------|------|
| 1 | Warungku | warungku |
| 2 | Kopiloop | kopiloop |
| 3 | Notari | notari |
| ... | ... | ... |
| 30 | Tabungin | tabungin |

Full list: derive from `productSeeds` in mock-data.ts L79-110 using same slug algorithm.

---

## 5. Products — Pending (3)

Mirror `PENDING_PRODUCTS`:

| id | slug | name | maker | status |
|----|------|------|-------|--------|
| p1 | tanyain | Tanyain | andre | pending |
| p2 | rapatin | Rapatin | sari | pending |
| p3 | kelasin | Kelasin | intan | pending |

- `publishedAt`: null
- `upvotes`: 0 (no Vote rows)

---

## 6. Votes (synthetic)

For each approved product id `"1"`–`"30"`:

- Target count = `upvotes` from mock-data
- Create Vote rows with synthetic voter users OR duplicate votes across seeded users
- Simple approach: create N vote rows with `userId` rotated across 10 makers + admin using deterministic pattern
- **Do not** store count on Product table

Example: Product "1" (Warungku) → 412 Vote rows (or cap at 50 for dev perf with note in README — **prefer full count for integrasi test accuracy, use bulk insert**)

Pragmatic dev compromise (document in README if used):
- Seed max 20 votes per product with note that counts come from aggregation
- OR seed exact counts via bulk `$executeRaw` insert

**Recommendation:** Seed exact `upvotes` count per product for leaderboard parity with frontend.

---

## 7. Comments (50)

Mirror `COMMENTS` generation L145-165:

| Field | Rule |
|-------|------|
| id | `"1"` … `"50"` |
| productId | `PRODUCTS[i % 30].id` |
| authorId | rotate USERS[i % 10] |
| text | 8 text variants from mock |
| createdAt | ISO datetime — backdate `(i % 12) + 1` hours from seed time |

---

## 8. Newsletters (2)

Mirror `INITIAL_NEWSLETTERS` from `app-store.tsx`:

### n4 — published

| Field | Value |
|-------|-------|
| id | n4 |
| slug | issue-4-ai-tools-made-in-indonesia |
| title | Issue #4 — AI tools made in Indonesia |
| coverImageUrl | https://picsum.photos/seed/nl4/1200/600 |
| shortDescription | Notari, Voicenote ID, dan 8 produk AI... |
| content | Minggu ini kami sorot gelombang baru... |
| featuredProductIds | ["3", "25"] |
| publishDate | 2026-06-26 |
| status | published |

### n5 — draft

| Field | Value |
|-------|-------|
| id | n5 |
| slug | issue-5-fintech-deep-dive |
| title | Issue #5 — Fintech deep dive |
| coverImageUrl | https://picsum.photos/seed/nl5/1200/600 |
| shortDescription | Draft — outline dan produk pilihan minggu ini. |
| content | Outline... |
| featuredProductIds | ["6"] |
| publishDate | 2026-07-10 |
| status | draft |

---

## 9. Follows (optional seed)

Mock frontend has fake follower counts on creators page — not in mock-data.

Optional: seed 5-10 random Follow edges for demo.

Not required for MVP parity.

---

## 10. AdminAudit

Empty at seed. Populated by admin actions at runtime.

---

## 11. RefreshToken

Empty at seed.

---

## 12. Seed Order (FK dependencies)

```
1. Categories
2. Users + UserRoles
3. Products (approved + pending)
4. Votes
5. Comments
6. Newsletters
7. Follows (optional)
```

---

## 13. Idempotency

Seed must be re-runnable:

```typescript
// Pattern: upsert by unique key
await prisma.category.upsert({ where: { slug }, create, update });
await prisma.user.upsert({ where: { username }, create, update });
```

For Votes/Comments with fixed IDs: deleteMany + create, or upsert by id.

---

## 14. Verification Checklist

After seed, these must match frontend mock:

- [ ] `GET /categories` → 9 items
- [ ] `GET /products?tab=today` → products with launchDate = latest date, sorted by upvotes
- [ ] `GET /products/warungku` → id "1", 412 upvotes
- [ ] `GET /admin/queue?status=pending` → 3 items (tanyain, rapatin, kelasin)
- [ ] `GET /users/rifqi` → profile + products
- [ ] `GET /products/3/comments` → comments for Notari
- [ ] `GET /newsletters` → 1 published (n4)
- [ ] Login `rifqi@stackd.id` / `DevPassword123!` → success
- [ ] Login `admin@stackd.id` → has admin role

---

## 15. Thumbnail URL Helpers (copy from mock-data.ts)

```typescript
const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=ffd5dc,c0aede,d1d4f9,b6e3f4`;

const palette = ["ff5a5f", "7b3ff2", "ffd166", "06d6a0", "118ab2", "ef476f", "f78c6b", "8338ec", "3a86ff"];

const thumb = (seed: string, color: string) =>
  `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&backgroundColor=${color}`;

const screenshot = (seed: string) =>
  `https://picsum.photos/seed/${seed}/1200/700`;
```

Use same palette rotation index as mock-data for visual parity.
