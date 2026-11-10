# Approvals required before continuing

## A. Application config change (deployability)

CORS is hardcoded to localhost in `backend/src/main/resources/application.yml`. Staging frontends cannot call the API until this becomes env-driven:

```yaml
allowed-origins: ${NESTHUB_CORS_ORIGINS:http://localhost:5173,http://localhost:5174}
```

**Approve this one-line change?** (No business controller/entity/UI redesign.)

## B. Google Cloud

1. Run: `gcloud auth login` then `gcloud config set project <PROJECT_ID>`
2. Confirm GCP project ID and billing account (do not invent)
3. Approve enabling: `run`, `sqladmin`, `secretmanager`, `artifactregistry` (and optional `cloudbuild`)
4. Approve Cloud SQL staging create in `africa-south1` at ~**$50–90/month** (see `COST_ESTIMATE.md`)
5. Approve Cloud Run staging service + Secret Manager secrets

## C. Cloudflare / DNS

1. Approve deploy of Workers Assets workers:
   - `siona-nesthub-frontend-staging`
   - `siona-nesthub-tenant-staging` (optional)
2. Approve DNS for `staging-nesthub.sionaglobal.com` and `staging-api.nesthub.sionaglobal.com`
3. Do **not** touch production domains or the existing SIONA Property Worker

## D. Local admin

- Docker Desktop install needs administrator approval (winget may prompt UAC)
