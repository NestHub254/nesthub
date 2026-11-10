# SIONA NestHub — staging runbook (preparation)

## Architecture

| Layer | Target |
|---|---|
| Main frontend | Cloudflare Workers Assets → `staging-nesthub.sionaglobal.com` |
| Tenant portal | Cloudflare Workers Assets (optional staging worker) |
| API | Google Cloud Run → `staging-api.nesthub.sionaglobal.com` (DNS later) |
| DB | Google Cloud SQL PostgreSQL 16, `africa-south1` |

Production hostnames (`nesthub.sionaglobal.com`, `api.nesthub.sionaglobal.com`) must not be changed in this phase.

## Local toolchain

- JDK 17, Maven 3.9+, Node 20+, Docker Desktop (for image builds), gcloud, Wrangler 4.15x
- Cloudflare: use SIONA account already authenticated via Wrangler
- GCP: run `gcloud auth login` and `gcloud config set project PROJECT_ID` (user must supply project)

## Required application change (approval gate)

`application.yml` currently hardcodes CORS to localhost. Staging browsers on `https://staging-nesthub.sionaglobal.com` will be blocked until CORS is env-driven, e.g.:

```yaml
app:
  cors:
    allowed-origins: ${NESTHUB_CORS_ORIGINS:http://localhost:5173,http://localhost:5174}
```

**Do not apply until explicitly approved.** No business controllers/entities/frontend UX changes are required for deployability beyond this config.

## Build commands (safe / local)

```bash
# Backend (from backend/)
mvn -B -DskipTests package

# Frontends with staging API URL
cd frontend && VITE_API_URL=https://staging-api.nesthub.sionaglobal.com npm run build
cd tenant-portal && VITE_API_URL=https://staging-api.nesthub.sionaglobal.com npm run build

# Container image (requires Docker)
docker build -t nesthub-backend:staging -f backend/Dockerfile backend
```

## Cloudflare staging deploy (after approval to expose)

```bash
cd frontend
npx wrangler deploy -c wrangler.staging.jsonc
# Then attach custom domain in dashboard or uncomment routes — do not touch production Workers
```

## GCP staging (after cost + project approval)

1. Enable APIs: `run`, `sqladmin`, `secretmanager`, `artifactregistry`, `cloudbuild` (only if approved)
2. Create Cloud SQL per `infra/cloud-sql/staging.md`
3. Create secrets; never echo values
4. Build/push image to Artifact Registry
5. Deploy Cloud Run per `infra/cloud-run/service.staging.yaml`
6. Map `staging-api.nesthub.sionaglobal.com` (Cloudflare DNS → Cloud Run) only when approved

## Acceptance tests (after staging is live)

1. `GET /api/health` → `{ status: ok }`
2. Flyway tables present (`flyway_schema_history`, `users`, `properties`, …)
3. Owner register + login
4. Create property + list `/api/properties/mine`
5. Non-owner cannot create property
6. Frontend calls staging API successfully (CORS)
7. Tenant portal builds/loads (dashboard still largely mock — do not claim production-ready)

## Remotes

- Push only to `origin` (`Siona-Technologies/siona-nesthub`)
- Never push to `upstream` (`NestHub254/nesthub`)
- Work on `infra/siona-cloud-deployment` — do not merge to `main` in this phase
