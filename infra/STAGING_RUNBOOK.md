# SIONA NestHub — low-cost GCP staging runbook

## Architecture (approved direction)

| Layer | Service |
|---|---|
| Frontend + tenant SPA | **Firebase Hosting** (not Cloudflare Workers) |
| API | **Cloud Run** (Spring Boot Java 17 container) |
| DB | **Cloud SQL PostgreSQL** + Flyway |
| Images | **Artifact Registry** |
| Secrets | **Secret Manager** |
| DNS | **Cloudflare DNS only** (no app hosting on Cloudflare) |

Recommended compute/DB region: **`asia-south1`** (see `REGION_COMPARISON.md`).

## Safe sequence (stop at each approval gate)

1. Local toolchain OK (JDK 17, Maven, Node, Firebase CLI). Docker still required for image build.
2. `gcloud auth login` + select/create **dedicated SIONA staging project** (user supplies IDs).
3. Confirm trial/billing; set budget alerts $5/$10/$20/$50.
4. **Approve** enabling APIs: `run`, `sqladmin`, `secretmanager`, `artifactregistry`, `firebase`, `firebasehosting` (Blaze required for Cloud Run rewrites).
5. Build frontends + backend JAR/image.
6. **Approve** Cloud SQL staging create (smallest suitable, no HA, storage cap).
7. Store DB/JWT secrets in Secret Manager (never commit).
8. **Approve** Cloud Run staging deploy (`min=0`, `max=3`, request-based).
9. Wire `.firebaserc` project/site IDs; `firebase deploy --only hosting` to **preview / default Hosting URL only**.
10. Test health, Flyway, register/login, property create — test data only.
11. Only after pass: approve custom domain / Cloudflare DNS for `nesthub.sionaglobal.com`.

## Frontend API wiring

**Preferred (same-origin):** Firebase Hosting rewrite `/api/**` → Cloud Run (`firebase.json`). Build with:

```bash
VITE_API_URL=   # empty / relative — browser calls /api on the Hosting origin
```

Or set `VITE_API_URL=""` explicitly at build time.

**Fallback:** `VITE_API_URL=https://SERVICE-XXXX.asia-south1.run.app` — requires CORS env change approval.

## Docker image (after Docker Desktop installed)

```bash
docker build -t asia-south1-docker.pkg.dev/PROJECT/nesthub/backend:staging -f backend/Dockerfile backend
```

## Remotes / branch

- Branch: `infra/siona-cloud-deployment`
- Push: `origin` only (`Siona-Technologies/siona-nesthub`)
- Never push `upstream` (`NestHub254/nesthub`)
- Do not merge to `main` in this phase
- Do not touch `siona-property`
