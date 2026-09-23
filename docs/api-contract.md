# SwapSkill — API Contract

> **Base URL (local):** `http://localhost:5001`
> **Base URL (production):** set via `{{baseUrl}}` in the Postman environment
>
> All protected routes require the header: `Authorization: Bearer <token>`

---

## Authentication Routes — `/api/auth`

> Auth routes are rate-limited to **20 requests per 15 minutes** per IP.

### `POST /api/auth/register`
Create a new account.

**Request body**
```json
{
  "name": "string (min 2, max 60) — required",
  "email": "valid email — required",
  "password": "string (min 6) — required",
  "role": "user | admin | moderator — optional, default: user"
}
```

**Success `201`**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "_id": "string",
    "name": "string",
    "email": "string",
    "role": "user",
    "credits": 3.5,
    "token": "JWT string"
  }
}
```

**Error `400`** — duplicate email
```json
{ "success": false, "message": "An account with that email already exists" }
```

**Error `400`** — validation failure
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "password", "message": "Password must be at least 6 characters" }]
}
```

---

### `POST /api/auth/login`

**Request body**
```json
{ "email": "string — required", "password": "string — required" }
```

**Success `200`**
```json
{
  "success": true,
  "message": "Login successful",
  "data": { "_id": "string", "name": "string", "email": "string", "role": "string", "credits": 3.5, "token": "JWT string" }
}
```

**Error `401`** — wrong credentials
```json
{ "success": false, "message": "Invalid email or password" }
```

---

### `GET /api/auth/me`
🔒 Protected.

**Success `200`**
```json
{ "success": true, "data": { "_id": "string", "name": "string", "email": "string", "role": "string", "credits": 3.5 } }
```

---

### `POST /api/auth/logout`
🔒 Protected. Client-side token discard; route exists for symmetry and future token blacklisting.

**Success `200`**
```json
{ "success": true, "message": "Logged out successfully" }
```

---

### `PATCH /api/auth/password`
🔒 Protected.

**Request body**
```json
{
  "currentPassword": "string — required",
  "newPassword": "string (min 6) — required",
  "confirmNewPassword": "string — required, must match newPassword"
}
```

**Success `200`**
```json
{ "success": true, "message": "Password updated successfully" }
```

**Error `401`** — wrong current password
```json
{ "success": false, "message": "Current password is incorrect" }
```

---

## Skills Routes — `/api/skills`

### `GET /api/skills`
Public. Supports pagination and filtering.

**Query parameters**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | `1` | Page number (1-indexed) |
| `limit` | number | `9` | Items per page (max 50) |
| `category` | string | — | Filter by category: `craft`, `tech`, `language`, `wellness` |
| `q` | string | — | Full-text search on `title` and `wants` fields |

**Success `200`**
```json
{
  "success": true,
  "data": [{ "_id": "string", "title": "string", "cat": "string", "wants": "string", "by": "string", "ownerId": "string", "owner": { "_id": "string", "name": "string", "email": "string" }, "createdAt": "ISO date" }],
  "page": 1,
  "totalPages": 3,
  "totalCount": 27
}
```

---

### `GET /api/skills/:id`
Public.

**Success `200`** — same shape as a single item from the list above.

**Error `404`**
```json
{ "success": false, "message": "Skill not found" }
```

---

### `POST /api/skills`
🔒 Protected.

**Request body**
```json
{ "title": "string (min 1, max 100)", "wants": "string (min 1, max 100)", "cat": "craft | tech | language | wellness" }
```

**Success `201`**
```json
{ "success": true, "message": "Skill listed successfully", "data": { "_id": "string", "title": "string", "cat": "string", "wants": "string", "by": "string", "ownerId": "string" } }
```

**Error `400`** — validation failure, **`401`** — unauthenticated.

---

### `PUT /api/skills/:id`
🔒 Protected. Owner or admin only.

**Request body** (all optional, at least one required)
```json
{ "title": "string (optional)", "wants": "string (optional)", "cat": "craft|tech|language|wellness (optional)" }
```

**Error `403`** — not owner.

---

### `DELETE /api/skills/:id`
🔒 Protected. Owner or admin only. Returns `{ "success": true, "message": "Skill deleted successfully" }`.

---

## User Routes — `/api/users`

### `GET /api/users`
🔒 Protected + **admin only**.

**Error `403`** — non-admin.

---

### `GET /api/users/:id`
🔒 Protected. Any authenticated user.

---

### `PUT /api/users/:id`
🔒 Protected. Self or admin. Password updates are blocked here — use `PATCH /api/auth/password`.

---

### `DELETE /api/users/:id`
🔒 Protected. Self or admin.

---

## Swap Request Routes — `/api/swaps`

All swap routes require authentication.

### `POST /api/swaps`
Create a swap proposal. Also emits `swap:new` Socket.IO event to the recipient.

**Request body**
```json
{
  "toUser": "ObjectId string — required",
  "skill": "ObjectId string — required (skill being requested)",
  "offeredSkill": "string (min 2, max 100) — required",
  "hours": "positive number (max 10) — required"
}
```

**Success `201`**
```json
{
  "success": true,
  "message": "Swap proposal sent to <name>",
  "data": { "_id": "string", "fromUser": {...}, "toUser": {...}, "skill": {...}, "offeredSkill": "string", "hours": 1, "status": "pending", "createdAt": "ISO date" }
}
```

**Error `400`** — self-proposal, skill not owned by recipient, validation failure.

---

### `PATCH /api/swaps/:id`
Accept or decline a pending swap. Only the recipient (`toUser`) may call this. Emits `swap:updated` to the proposer's socket room. On acceptance, credits the recipient's account server-side.

**Request body**
```json
{ "status": "accepted | declined" }
```

**Success `200`**
```json
{ "success": true, "message": "Swap accepted", "data": { "_id": "string", "status": "accepted", ... } }
```

**Error `403`** — not the recipient. **`400`** — swap already resolved.

---

### `GET /api/swaps/me`
Get swaps for the authenticated user.

**Query parameters**

| Param | Values | Description |
|---|---|---|
| `role` | `sent`, `received`, (empty) | Filter to sent, received, or both |
| `status` | `pending`, `accepted`, `declined` | Filter by status |

**Success `200`**
```json
{ "success": true, "data": [ { "_id": "string", "fromUser": {...}, "toUser": {...}, "skill": {...}, "status": "pending", "hours": 1 } ] }
```

---

## Common Error Shapes

| Code | Shape |
|---|---|
| `400` Validation | `{ success: false, message: "Validation failed", errors: [{ field, message }] }` |
| `401` Unauthorized | `{ success: false, message: "Not authorized, no token" }` |
| `403` Forbidden | `{ success: false, message: "Not authorised to ..." }` |
| `404` Not found | `{ success: false, message: "<Resource> not found" }` |
| `429` Rate limited | `{ success: false, message: "Too many requests..." }` |
| `500` Server error | `{ success: false, message: "...", stack: "dev only" }` |

---

## Socket.IO Events

**Connection:** `io('/', { auth: { token: '<JWT>' } })`

Each user joins a private room keyed by their user ID.

| Event | Direction | Payload |
|---|---|---|
| `swap:new` | Server → recipient | `{ _id, from, fromId, skill, offeredSkill, hours, status, createdAt }` |
| `swap:updated` | Server → proposer | `{ _id, status, skill, hours, recipientCreditsAdded? }` |
