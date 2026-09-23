# SwapSkill — Community Skill Exchange Platform

> **One full-stack project. Ten experiments. Production-grade code.**

SwapSkill is a peer-to-peer skill-exchange platform where users trade hours of expertise instead of cash. It's built to comprehensively demonstrate all 10 course experiments in a single coherent application rather than ten disconnected demos.

---

## Live URLs

| Service | URL |
|---|---|
| Frontend (Vercel) | _add after first deploy_ |
| API (Render) | _add after first deploy_ |
| Postman Collection | [`docs/postman/SwapSkill.postman_collection.json`](docs/postman/SwapSkill.postman_collection.json) |
| API Contract | [`docs/api-contract.md`](docs/api-contract.md) |

---

## Quick Start — Local Development

### Prerequisites
- Node.js 20+
- MongoDB Atlas account (or Docker for the fully local stack)

### 1. Clone and install

```bash
git clone https://github.com/hritrick/swapskill.git
cd swapskill

# Install client dependencies
cd client && npm install && cd ..

# Install server dependencies
cd server && npm install && cd ..
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
# Edit server/.env and fill in:
#   MONGODB_URI  — your Atlas connection string
#   JWT_SECRET   — a long random string (min 32 chars)
```

### 3. Run dev servers

```bash
# Terminal 1 — API + Socket.IO
cd server && npm run dev

# Terminal 2 — Vite dev server (proxies /api → localhost:5001)
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Sign in with the seeded demo account:
- **Email:** `demo@example.com`
- **Password:** `password123`

---

## Quick Start — Docker (zero Node/Mongo required)

```bash
# From the repo root:
JWT_SECRET=your_secret_here docker compose up --build

# App:  http://localhost:3000
# API:  http://localhost:5001
```

Data persists in a named Docker volume across restarts. To reset:
```bash
docker compose down -v  # removes the volume
```

---

## Architecture

```
┌─────────────────────────────────────┐   ┌──────────────────────────────────────┐
│         client/  (Vite + React)     │   │        server/  (Express + Mongoose)  │
│                                     │   │                                       │
│  AppContext       ← auth + credits  │   │  /api/auth    ← register/login/me     │
│  SwapsContext     ← swaps + socket  │◄──┤  /api/skills  ← CRUD + pagination    │
│  SkillsContext    ← skill list      │   │  /api/swaps   ← proposals + status   │
│                                     │   │  /api/users   ← admin user mgmt      │
│  useSocket.js     ← Socket.IO hook  │   │                                       │
│  NotificationBell ← live inbox      │◄──┤  Socket.IO    ← swap:new             │
│  ProposalModal    ← real API call   │──►│               ← swap:updated          │
└─────────────────────────────────────┘   └──────────────────────────────────────┘
                                                         │
                                              ┌──────────┴──────────┐
                                              │   MongoDB Atlas /    │
                                              │   mongo:7 (Docker)  │
                                              └─────────────────────┘
```

---

## Experiment → File Mapping

| # | Experiment | Key files | Status |
|---|---|---|---|
| 1 | **Tailwind CSS + responsive/interactive UI** | `client/tailwind.config.js`, `client/postcss.config.js`, all components | ✅ |
| 2 | **React Hooks** (`useEffect`, `useContext`, custom hooks) | `useSocket.js`, `useDebouncedValue.js`, `useModal.js`, `useLocalStorage.js`, contexts | ✅ |
| 3 | **Context API** | `AppContext.jsx` (auth+credits), `SwapsContext.jsx` (swaps+socket), `SkillsContext.jsx` (skill list) | ✅ |
| 4 | **REST API + MongoDB/Mongoose** | `server/models/`, `server/controllers/`, `server/routes/` | ✅ |
| 5 | **Secure, production-ready API** | `server/utils/ApiError.js`, `server/middleware/validate.js`, `server/validators/`, `server/server.js` (helmet, cors, rate-limit, morgan, env-guard) | ✅ |
| 6 | **JWT auth + roles** | `server/controllers/authController.js`, `server/middleware/authMiddleware.js`, `server/routes/authRoutes.js` (register/login/logout/password-change) | ✅ |
| 7 | **Postman validation** | `docs/postman/SwapSkill.postman_collection.json`, `docs/postman/SwapSkill.postman_environment.json`, `docs/api-contract.md` | ✅ |
| 8 | **WebSockets (real-time)** | `server/server.js` (Socket.IO + JWT auth), `client/src/hooks/useSocket.js`, `SwapsContext.jsx`, `NotificationBell.jsx` | ✅ |
| 9 | **CI/CD — GitHub Actions + Vercel/Render** | `.github/workflows/ci.yml`, `.github/workflows/deploy.yml` | ✅ |
| 10 | **Docker + DevOps** | `client/Dockerfile`, `server/Dockerfile`, `docker-compose.yml` | ✅ |

---

## Environment Variables

All variables go in `server/.env` (copy from `server/.env.example`):

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: 5001) |
| `MONGODB_URI` | **Yes** | MongoDB Atlas connection string |
| `JWT_SECRET` | **Yes** | JWT signing secret (min 32 chars) |
| `JWT_EXPIRES_IN` | No | Token expiry (default: `1d`) |
| `CLIENT_URL` | Yes (prod) | Frontend origin for CORS (e.g. `https://your-app.vercel.app`) |
| `NODE_ENV` | No | `development` / `production` / `test` |

---

## Scripts

```bash
# Client
cd client
npm run dev        # Vite dev server with HMR
npm run build      # Production build → dist/
npm run lint       # ESLint
npm run lint:fix   # ESLint auto-fix
npm run format     # Prettier
npm test           # Vitest unit tests

# Server
cd server
npm run dev        # nodemon (hot reload)
npm start          # node server.js (production)
npm run lint       # ESLint
npm run format     # Prettier
npm test           # Jest + Supertest integration tests

# Postman/Newman (from repo root)
newman run docs/postman/SwapSkill.postman_collection.json \
  -e docs/postman/SwapSkill.postman_environment.json \
  --env-var "baseUrl=http://localhost:5001"
```

---

## Seeded Demo Accounts

The server auto-seeds the database on first run (when it's empty):

| Name | Email | Password | Skills |
|---|---|---|---|
| Demo Member | `demo@example.com` | `password123` | — |
| Aarav | `aarav@example.com` | `password123` | Guitar fundamentals |
| Meera | `meera@example.com` | `password123` | React & Tailwind basics |
| Kenji | `kenji@example.com` | `password123` | Conversational Japanese |
| Priya | `priya@example.com` | `password123` | Yoga & breathwork |
| … | … | `password123` | … |

---

## How Real-Time Works (Experiment 8)

1. On login, `AppContext` stores the JWT in localStorage (see trade-off note below).
2. `SwapsContext` calls `useSocket(user.token)` — a custom hook that opens a `socket.io-client` connection with `auth: { token }`.
3. On the server, Socket.IO's `io.use()` middleware verifies the JWT and calls `socket.join(userId)` so each user has a private room.
4. When User A sends a swap proposal (`POST /api/swaps`), the `swapRequestController` emits `swap:new` to User B's room.
5. `SwapsContext` listens for `swap:new` and pushes the new notification into React state — User B's `NotificationBell` badge updates in `<1s` with no page refresh.
6. When User B accepts/declines, `swap:updated` fires to User A's room and credits are updated server-side.

---

## Security Notes

### JWT in localStorage (documented trade-off)
The JWT is stored in `localStorage` via the `useLocalStorage` custom hook. This means it is readable by any JavaScript running on the same origin. For a course project this is an acceptable trade-off. In a production application the upgrade path is:
- Issue the JWT as an `httpOnly`, `Secure`, `SameSite=Lax` cookie from the server
- Replace `Authorization: Bearer <token>` headers with `credentials: 'include'` fetch options
- Remove `useLocalStorage` from the auth flow entirely

### CORS
In production, `cors()` is configured to allow only the `CLIENT_URL` origin. In development it accepts `localhost:5173` and `localhost:3000`.

### Rate limiting
- Global: 100 req / 10 min per IP
- Auth routes (`/api/auth/login`, `/api/auth/register`): 20 req / 15 min per IP

---

## CI/CD

Every push/PR to `main` runs:
1. **Client job**: `npm run lint` + `npm run build`
2. **Server job**: `npm run lint` + `npm test` + `newman run` (Postman collection)

On merge to `main`:
- Frontend auto-deploys to **Vercel**
- Backend auto-deploys to **Render** via deploy hook

Required GitHub repository secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `RENDER_DEPLOY_HOOK`.

---

## Project Structure

```
swapskill/
├── .github/workflows/      # CI (ci.yml) + CD (deploy.yml)
├── client/                 # Vite + React frontend
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── src/
│   │   ├── context/        # AppContext, SkillsContext, SwapsContext
│   │   ├── hooks/          # useDebouncedValue, useLocalStorage, useModal, useSocket
│   │   ├── components/     # 15 React components
│   │   └── tests/          # Vitest tests
│   └── package.json
├── server/                 # Express + Mongoose + Socket.IO API
│   ├── Dockerfile
│   ├── config/             # DB connection + seeder
│   ├── controllers/        # auth, skill, user, swapRequest
│   ├── middleware/         # auth, error, validate
│   ├── models/             # User, Skill, SwapRequest
│   ├── routes/             # auth, skill, user, swap
│   ├── utils/              # ApiError
│   ├── validators/         # Zod schemas
│   ├── tests/              # Jest + Supertest integration tests
│   └── package.json
├── docs/
│   ├── api-contract.md
│   └── postman/
├── docker-compose.yml
└── README.md
```
