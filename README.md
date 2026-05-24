# FormCraft — Dynamic Form Builder

A Typeform-style dynamic form builder with conditional logic, multi-step
filling, admin analytics, and CSV export. Delivered as a **fully decoupled
two-process architecture** so the UI and API can scale, deploy, and evolve
independently.

```
dynamic-form-builder/
├── frontend/   Next.js 15 App Router — UI only, hits the API via HTTP
├── backend/    Express + mysql2 + JWT — REST API on port 4000
├── shared/     Pure TS types + validator + logic engine (no runtime deps)
└── package.json (root)   `npm run dev` boots both with concurrently
```

## Stack

| Layer      | Tech                                                             |
| ---------- | ---------------------------------------------------------------- |
| Frontend   | Next.js 15 (App Router), React 18, Tailwind v4, Zustand, sonner  |
| Backend    | Express 4, mysql2, JWT (`jsonwebtoken`), bcryptjs                 |
| Database   | MySQL / MariaDB (e.g. XAMPP on `localhost:3306`)                  |
| Shared     | Plain TypeScript (types, validator, logic engine) — runtime-free |

The shared folder is consumed through `@shared/*` path aliases on both
sides, so both the Express validator and the React filler agree on what a
"valid answer" means — one source of truth, two runtimes.

---

## Quick start

```bash
# from the repo root
npm install                # installs concurrently
npm run install:all        # installs backend + frontend deps
npm run dev                # boots both: API @ :4000, UI @ :3000
```

Start **MySQL** in XAMPP (or your SQL server), create the database and tables
(see `backend/schema.sql` or your phpMyAdmin script), set `DB_*` in
`backend/.env`, then start the stack. On first boot against an **empty**
database the API auto-seeds two accounts plus a sample form:

- Admin: `admin@example.com` / `admin123`
- User:  `user@example.com`  / `user123`

Visit http://localhost:3000 and sign in.

---

## Architecture at a glance

```
┌────────────────┐    HTTP / JSON     ┌─────────────────────┐
│  frontend/     │ ─────────────────▶ │  backend/           │
│  Next.js UI    │  Authorization:    │  Express API        │
│  (port 3000)   │  Bearer <JWT>      │  (port 4000)        │
│                │ ◀───────────────── │                     │
│  fetch()       │    JSON responses  │  ↕ MySQL pool       │
│  lib/api.ts    │                    │  ↕ JWT middleware   │
└────────┬───────┘                    └─────────┬───────────┘
         │                                      │
         ▼                                      ▼
   @shared/types                           @shared/types
   @shared/validator                       @shared/validator
   @shared/logicEngine                     @shared/logicEngine
```

- **No tight coupling.** Frontend imports nothing server-only (no mysql2,
  no bcryptjs, no jose). Backend imports nothing UI-only.
- **Shared = pure.** Only types + pure-function utilities live there; no
  framework code leaks in either direction.
- **Auth is stateless.** Backend issues a signed JWT at login/register;
  frontend stores it in `localStorage` and sends it on every request.

---

## Environment variables

### `backend/.env`

| Variable         | Default                     | Purpose                                      |
| ---------------- | --------------------------- | -------------------------------------------- |
| `PORT`           | `4000`                      | Express listen port                          |
| `DB_HOST`        | `127.0.0.1`                 | MySQL host                                   |
| `DB_PORT`        | `3306`                      | MySQL port                                   |
| `DB_USER`        | `root`                      | MySQL user                                   |
| `DB_PASSWORD`    | *(empty)*                   | MySQL password                               |
| `DB_NAME`        | `dynamic_form_builder`      | Database name                                |
| `JWT_SECRET`     | `dev-secret-change-me`      | HS256 signing key                            |
| `JWT_EXPIRES_IN` | `7d`                        | Token lifetime (zeit/ms)                     |
| `ADMIN_EMAILS`   | `admin@example.com`         | Comma list promoted to `admin` at signup     |
| `CORS_ORIGIN`    | `http://localhost:3000,http://127.0.0.1:3000` | Comma list of allowed frontend origins       |

### `frontend/.env.local`

| Variable                   | Default                   | Purpose                           |
| -------------------------- | ------------------------- | --------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:4000`   | Where `lib/api.ts` sends requests |

---

## Scripts

### Root

| Command                | What it does                                    |
| ---------------------- | ----------------------------------------------- |
| `npm run install:all`  | Install deps in both `backend/` and `frontend/` |
| `npm run dev`          | Run both servers with colored output            |
| `npm run dev:backend`  | Run only the API                                |
| `npm run dev:frontend` | Run only the UI                                 |
| `npm run build`        | Build backend (tsc) + frontend (next build)     |
| `npm run start`        | Start built backend + frontend                  |
| `npm run typecheck`    | `tsc --noEmit` on both                          |

### `backend/`

| Command            | What it does                                   |
| ------------------ | ---------------------------------------------- |
| `npm run dev`      | ts-node-dev with watch + respawn               |
| `npm run build`    | `tsc` → `dist/`                                |
| `npm start`        | `node dist/server.js`                          |
| `npm run typecheck`| `tsc --noEmit`                                 |

### `frontend/`

| Command             | What it does                 |
| ------------------- | ---------------------------- |
| `npm run dev`       | `next dev` on port 3000      |
| `npm run build`     | `next build`                 |
| `npm start`         | `next start`                 |
| `npm run lint`      | `next lint`                  |
| `npm run typecheck` | `tsc --noEmit`               |

---

## API surface (backend)

All paths prefixed with `/api`. Auth is sent via `Authorization: Bearer <jwt>`.

| Method | Path                        | Who    | Purpose                                    |
| ------ | --------------------------- | ------ | ------------------------------------------ |
| POST   | `/auth/register`            | public | Create a user (role decided server-side)   |
| POST   | `/auth/login`               | public | Exchange credentials for a JWT             |
| GET    | `/auth/me`                  | any    | Echo the decoded JWT (nullable)            |
| GET    | `/forms`                    | user   | List published forms (user) / own (admin)  |
| POST   | `/forms`                    | admin  | Create a form                              |
| GET    | `/forms/:id`                | any    | Fetch a form (drafts admin-only)           |
| PUT    | `/forms/:id`                | admin  | Update a form (owner only)                 |
| DELETE | `/forms/:id`                | admin  | Delete a form (owner only)                 |
| GET    | `/forms/:id/responses`      | admin  | List submitted responses                   |
| GET    | `/forms/:id/export`         | admin  | CSV export                                 |
| GET/POST | `/forms/:id/next`          | any    | Logic-driven next question                 |
| POST   | `/responses`                | any    | Save draft or submit                       |
| GET    | `/responses/draft`          | any    | Resume a draft                             |
| GET    | `/health`                   | public | `{ status: 'ok', uptime }`                 |

---

## Adding a new endpoint

1. Add a controller function in `backend/src/controllers/<area>Controller.ts`.
2. Wire it in `backend/src/routes/<area>.ts`.
3. Register the router in `backend/src/app.ts`.
4. Add a typed wrapper in `frontend/lib/api.ts`.
5. Add/update any shared types in `shared/types.ts`.

That's it — no tight coupling means the two sides evolve on their own clocks.

---

## Production notes

- **MySQL**: use a managed instance or your host’s MySQL/MariaDB; set `DB_*`
  in `backend/.env` and run migrations / `backend/schema.sql` on deploy.
- **Rotate `JWT_SECRET`** (any long random string).
- **CORS**: set `CORS_ORIGIN` to your deployed frontend origin(s).
- The frontend can deploy to anything that serves Next.js (Vercel, Node,
  self-hosted) — it only needs `NEXT_PUBLIC_API_BASE_URL` pointed at the
  backend.
- The backend is a stateless Node process — horizontally scalable behind
  any load balancer.
