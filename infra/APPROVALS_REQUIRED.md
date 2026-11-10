# Approvals required (stop here)

## 1. Google Cloud login + project

```bash
gcloud auth login
gcloud auth application-default login
gcloud projects list
gcloud config set project <SIONA_STAGING_PROJECT_ID>
```

Confirm: billing account, **$300 / 90-day trial** status, Blaze readiness for Firebase.

## 2. Billing safeguards

- Budget alerts at **$5, $10, $20, $50** (alerts ≠ caps)
- Confirm no accidental upgrade beyond trial without notice

## 3. Enable APIs (billable / paid path)

Approve enabling only: Cloud Run, Cloud SQL Admin, Secret Manager, Artifact Registry, Firebase / Firebase Hosting (and IAM as needed).

## 4. Staging Cloud SQL

- Region: **`asia-south1`**
- Smallest suitable Enterprise config, **no HA**, storage autogrowth **capped**
- Estimated **~$20–70/mo** dominant cost — see `COST_ESTIMATE.md`
- Not the short Cloud SQL free-trial SKU for any future production use

## 5. Staging Cloud Run + Firebase Hosting

- Deploy public staging Hosting + Cloud Run (generated URLs only)
- No production DNS / `nesthub.sionaglobal.com` yet

## 6. Small deployability code changes (approve one path)

**Path A — Cross-origin (Cloud Run URL in `VITE_API_URL`):**

```yaml
# application.yml
allowed-origins: ${NESTHUB_CORS_ORIGINS:http://localhost:5173,http://localhost:5174}
```

**Path B — Same-origin Firebase `/api` rewrites:** allow empty API base in both SPA clients:

```js
// frontend/src/api/client.js and tenant-portal/src/api/client.js
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';
// and ensure empty string is preserved (do not use `||`)
```

Approve before applying. No business controllers/entities/UI redesign.

## 7. Local admin

- Install **Docker Desktop** (UAC) to build/push images

## 8. Production (later)

Dedicated-core Cloud SQL, backups, PITR, deletion protection, private networking — separate approval. No HA without approval.
