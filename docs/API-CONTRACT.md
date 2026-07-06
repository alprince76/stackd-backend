# API Contract — Stackd Backend v1

Kontrak response untuk integrasi dengan frontend `stack-id-product/src/lib/mock-data.ts`.

Base URL: `/api/v1`

---

## 1. Response Envelope

### Success

```json
{
  "data": { },
  "meta": {
    "nextCursor": "eyJpZCI6IjEwIn0="
  }
}
```

- `meta` optional — omit when no pagination
- `nextCursor` null or absent = last page

### Error

```json
{
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "Email or password is incorrect",
    "details": {}
  }
}
```

HTTP status follows semantics (400, 401, 403, 404, 409, 429, 500).

---

## 2. Error Codes

| Code | HTTP | When |
|------|------|------|
| `VALIDATION_ERROR` | 400 | DTO/zod failure |
| `AUTH_INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `AUTH_TOKEN_EXPIRED` | 401 | Access JWT expired |
| `AUTH_TOKEN_INVALID` | 401 | Malformed JWT |
| `AUTH_REFRESH_REUSED` | 401 | Refresh token reuse detected |
| `AUTH_EMAIL_NOT_VERIFIED` | 403 | Action requires verified email |
| `FORBIDDEN` | 403 | Missing role or not owner |
| `NOT_FOUND` | 404 | Resource missing |
| `CONFLICT` | 409 | Duplicate email/username/slug |
| `RATE_LIMITED` | 429 | Throttle exceeded |
| `UPLOAD_INVALID_MIME` | 400 | Presigned upload MIME rejected |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## 3. Field Mapping — Product

Frontend type (`mock-data.ts`):

```typescript
type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  thumbnail: string;
  screenshots: string[];
  category: string;       // slug
  tags: string[];
  launchDate: string;     // YYYY-MM-DD
  website: string;
  upvotes: number;
  comments: number;
  maker: string;          // username
  status?: "pending" | "approved" | "scheduled" | "published" | "rejected";
  scheduledAt?: string;
};
```

Backend response DTO:

```typescript
type ProductResponse = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  thumbnailUrl: string;       // → adapter maps to thumbnail
  screenshotUrls: string[];   // → adapter maps to screenshots
  category: string;           // category slug
  tags: string[];
  launchDate: string;         // YYYY-MM-DD
  website: string;
  upvotes: number;
  comments: number;           // COUNT from DB
  hasUpvoted: boolean;        // false if anonymous
  maker: {
    username: string;
    name: string;
    avatarUrl: string;
  };
  status: "pending" | "scheduled" | "approved" | "rejected";
  scheduledAt: string | null;
  publishedAt: string | null;
};
```

### Frontend adapter (fase integrasi)

```typescript
function toFrontendProduct(p: ProductResponse): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    description: p.description,
    thumbnail: p.thumbnailUrl,
    screenshots: p.screenshotUrls,
    category: p.category,
    tags: p.tags,
    launchDate: p.launchDate,
    website: p.website,
    upvotes: p.upvotes,
    comments: p.comments,
    maker: p.maker.username,
    status: p.publishedAt ? "published" : p.status, // UI badge
    scheduledAt: p.scheduledAt ?? undefined,
  };
}
```

---

## 4. Field Mapping — User

Frontend:

```typescript
type User = {
  username: string;
  name: string;
  avatar: string;
  bio: string;
  twitter?: string;
  website?: string;
};
```

Backend public profile:

```json
{
  "data": {
    "username": "rifqi",
    "name": "Rifqi Pratama",
    "avatarUrl": "https://...",
    "bio": "Building tools...",
    "twitter": "rifqi",
    "website": "rifqi.dev",
    "followerCount": 128,
    "followingCount": 12,
    "isFollowing": false,
    "products": [ /* ProductResponse[] */ ]
  }
}
```

---

## 5. Field Mapping — Comment

Frontend:

```typescript
type Comment = {
  id: string;
  productId: string;
  author: string;
  text: string;
  createdAt: string;  // relative "3h ago"
};
```

Backend:

```json
{
  "data": {
    "id": "clx...",
    "productId": "3",
    "author": {
      "username": "sari",
      "name": "Sari Wulandari",
      "avatarUrl": "https://..."
    },
    "text": "Keren banget!",
    "createdAt": "2026-06-26T10:30:00.000Z"
  }
}
```

Frontend formats `createdAt` to relative string for display.

---

## 6. Field Mapping — Newsletter

Frontend:

```typescript
type Newsletter = {
  id: string;
  title: string;
  coverImage: string;
  shortDescription: string;
  content: string;
  featuredProductIds: string[];
  publishDate: string;
  status: "draft" | "scheduled" | "published";
};
```

Backend public (published only):

```json
{
  "data": {
    "id": "n4",
    "slug": "issue-4-ai-tools-made-in-indonesia",
    "title": "Issue #4 — AI tools made in Indonesia",
    "coverImageUrl": "https://...",
    "shortDescription": "Notari, Voicenote ID...",
    "content": "Minggu ini kami sorot...",
    "featuredProductIds": ["3", "25"],
    "publishDate": "2026-06-26",
    "status": "published"
  }
}
```

---

## 7. Example Responses

### POST /auth/login

Request:

```json
{
  "email": "rifqi@stackd.id",
  "password": "DevPassword123!"
}
```

Response 200:

```json
{
  "data": {
    "accessToken": "eyJhbG...",
    "expiresIn": 900,
    "user": {
      "id": "clx...",
      "email": "rifqi@stackd.id",
      "username": "rifqi",
      "name": "Rifqi Pratama",
      "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=rifqi",
      "roles": ["user", "maker"]
    }
  }
}
```

Set-Cookie: `refreshToken=...; HttpOnly; Secure; SameSite=Lax; Path=/api/v1/auth`

### GET /products?tab=today

Response 200:

```json
{
  "data": [
    {
      "id": "1",
      "slug": "warungku",
      "name": "Warungku",
      "tagline": "POS sederhana untuk warung lokal",
      "description": "...",
      "thumbnailUrl": "https://...",
      "screenshotUrls": ["https://..."],
      "category": "saas",
      "tags": ["pos", "umkm", "retail"],
      "launchDate": "2026-06-26",
      "website": "https://warungku.id",
      "upvotes": 412,
      "comments": 38,
      "hasUpvoted": false,
      "maker": {
        "username": "rifqi",
        "name": "Rifqi Pratama",
        "avatarUrl": "https://..."
      },
      "status": "approved",
      "scheduledAt": null,
      "publishedAt": "2026-06-26T00:00:00.000Z"
    }
  ],
  "meta": {
    "nextCursor": null
  }
}
```

### POST /products/:id/vote

Response 200:

```json
{
  "data": {
    "upvotes": 413,
    "hasUpvoted": true
  }
}
```

Toggle again → `upvotes: 412`, `hasUpvoted: false`.

### POST /admin/products/:id/approve

Response 200:

```json
{
  "data": {
    "id": "p1",
    "status": "approved",
    "publishedAt": "2026-07-05T12:00:00.000Z"
  }
}
```

### POST /products/upload-url

Request:

```json
{
  "filename": "thumbnail.png",
  "contentType": "image/png",
  "purpose": "product-thumbnail"
}
```

Response 200:

```json
{
  "data": {
    "uploadUrl": "https://minio:9000/stackd/...",
    "key": "products/clx.../thumbnail.png",
    "expiresIn": 300
  }
}
```

---

## 8. Pagination

Cursor-based. Request: `?cursor=eyJpZCI6IjEwIn0=`

Cursor encodes `{ id: string }` or `{ id, createdAt }` — stable sort required.

Default page size: 20. Max: 50.

---

## 9. Auth Headers

| Context | Header |
|---------|--------|
| Protected routes | `Authorization: Bearer <accessToken>` |
| Refresh | Cookie `refreshToken` (no Authorization) |
| CSRF (when enabled) | `X-CSRF-Token: <token>` |

---

## 10. CORS

```
Access-Control-Allow-Origin: http://localhost:5173  (dev)
Access-Control-Allow-Credentials: true
```

Production: frontend deploy URL only.

---

## 11. OpenAPI

Generated at `/api/docs` (dev/staging). Disabled in production unless `ENABLE_SWAGGER=true`.

Export OpenAPI JSON for frontend type generation (optional fase integrasi):

```
GET /api/docs-json
```

---

## 12. Versioning

All routes prefixed `/api/v1`. Breaking changes → `/api/v2`.

Frontend env: `VITE_API_URL=http://localhost:3001/api/v1`
