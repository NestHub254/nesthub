# Path B — Firebase Hosting same-origin API

## Architecture

```
Browser
  └─ Firebase Hosting (static SPA: frontend/ or tenant-portal/)
       ├─ /assets/*, index.html, sw.js  → Hosting CDN
       └─ /api/**                      → Cloud Run rewrite (asia-south1)
            └─ Spring Boot (nesthub-api-staging | nesthub-api)
                 └─ Cloud SQL PostgreSQL
```

Cloudflare is **DNS only** (later). No Cloudflare Workers hosting.

## Proposed Cloud Run service IDs

| Environment | Service ID | Firebase config |
|---|---|---|
| Staging | `nesthub-api-staging` | `firebase.json` |
| Production | `nesthub-api` | `firebase.production.json` |

Region: **`asia-south1`** (Firebase Hosting → Cloud Run rewrites supported).

## Frontend API URL rules

| `VITE_API_URL` | Result |
|---|---|
| missing / empty / `/` | Relative same-origin (`/api/...`) — Path B default |
| `https://….run.app` | Absolute Cloud Run / custom API origin |
| `https://….run.app/api` | Trailing `/api` stripped to avoid `/api/api/...` |
| `http://localhost:8080` | Local Vite only (via `.env.local`, not production builds) |

Implementation: `frontend/src/api/baseUrl.js` and `tenant-portal/src/api/baseUrl.js` (identical).

## Local verification

```bash
# Unit tests for URL resolution
node infra/scripts/test-api-base-url.mjs

# Path B production-mode builds (empty VITE_API_URL)
cd frontend && npm ci && npm run build -- --mode production
cd tenant-portal && npm ci && npm run build -- --mode production

# Audit bundles for accidental localhost
rg -n "localhost:8080" frontend/dist tenant-portal/dist && echo FAIL || echo OK

# Firebase config syntax
npx firebase-tools experiments:list >/dev/null  # CLI present
node -e "JSON.parse(require('fs').readFileSync('firebase.json','utf8')); JSON.parse(require('fs').readFileSync('firebase.production.json','utf8')); console.log('firebase JSON OK')"
```

## Backend notes (Path B)

- Controllers already mount under `/api/...` — matches Hosting rewrite `/api/**`.
- Health: `GET /api/health` (permitAll).
- CORS remains localhost-oriented for local Vite; same-origin Hosting traffic does not need cross-origin CORS.
- Secrets stay in Secret Manager at deploy time — never in Git.
- Dockerfile + `cloudbuild.yaml` support remote image builds (no local Docker required).

## Staging vs production

| | Staging | Production |
|---|---|---|
| Hosting config | `firebase.json` | `firebase.production.json` |
| Cloud Run | `nesthub-api-staging` | `nesthub-api` |
| SPA build | `VITE_API_URL=` (empty) | `VITE_API_URL=` (empty) |
| Domain | Firebase default `*.web.app` first | `nesthub.sionaglobal.com` only after staging pass |

## Deploy procedure (after project ID + approvals — do not run yet)

1. Enable APIs, create Artifact Registry, Cloud SQL, secrets, Cloud Run.
2. `gcloud builds submit` using `cloudbuild.yaml` (from repo root with backend context as documented).
3. Deploy Cloud Run with Secret Manager env bindings.
4. `firebase use <project>` / update `.firebaserc` targets.
5. Build SPAs with empty `VITE_API_URL`, then `firebase deploy --only hosting` (staging config first).
6. Test `/api/health`, register, login, property create.
7. DNS cutover only after acceptance.

## Rollback

1. Firebase Hosting: `firebase hosting:rollback` (or redeploy previous Hosting version).
2. Cloud Run: route traffic to previous revision (`gcloud run services update-traffic`).
3. Keep prior Artifact Registry image tags; do not delete until stable.
4. Database: restore from Cloud SQL backup only with explicit approval (destructive).

## Outstanding GCP provisioning

- Dedicated NestHub project ID (user-created)
- Billing / trial confirmation
- API enablement, budgets, Cloud SQL, Cloud Run, Artifact Registry, Secret Manager, Firebase Blaze
