# NestHub — fresh start

Two independent projects, talking over plain HTTP + JWT. No shared Node
server, no localStorage-as-a-database, no `.bat` launcher.

```
nesthub/
├── backend/    Spring Boot API (Java 17, Maven)
└── frontend/   React + Vite PWA
```

## What's working right now

- Real user accounts in Postgres (bcrypt-hashed passwords, not plaintext).
- `POST /api/auth/register` and `POST /api/auth/login` return a real JWT.
- The JWT is required on every other endpoint (`SecurityConfig` enforces this).
- Frontend has working Landing / Login / Register screens wired to the real
  backend, plus one placeholder dashboard per role (tenant/owner/manager/maintenance).
- The React build is a PWA out of the box (`vite-plugin-pwa`) — installable
  on a phone home screen with no extra work.

## What's intentionally NOT built yet (next phases)

- Properties / units / leases / tickets / payments endpoints — the DB tables
  exist (`V1__init.sql`), but there are no controllers for them yet. That's
  Phase 2–4 from the original roadmap.
- Role-based route protection beyond "any valid token" (e.g. only `manager`
  hitting manager endpoints) — add `@PreAuthorize` once real endpoints exist.
- M-Pesa/Stripe payments.

## Running it locally

**Backend**
```
cd backend
# needs a Postgres instance - point DB_URL/DB_USER/DB_PASSWORD at it
mvn spring-boot:run
```

**Frontend**
```
cd frontend
npm install
npm run dev
```
Create `frontend/.env` with `VITE_API_URL=http://localhost:8080`.

## Free hosting plan (no card required)

| Piece | Where | Free tier notes |
|---|---|---|
| Postgres | Supabase (used as a plain DB, not its Auth) | 500MB, generous for this |
| Backend | Render free Web Service | Sleeps after ~15 min idle; cold start on next request |
| Frontend | Vercel | Static build, no sleep, unlimited deploys |

Environment variables to set wherever the backend runs: `DB_URL`, `DB_USER`,
`DB_PASSWORD`, `JWT_SECRET` (generate a real random 32+ byte value — never
reuse the dev default in `application.yml`), `ALLOWED_ORIGINS` (your deployed
frontend URL).

## Next step

Build the `properties` / `units` / `leases` endpoints in the backend, then
wire `TenantHome.jsx` to show real rent status — that's Phase 2 from the
original blueprint.
