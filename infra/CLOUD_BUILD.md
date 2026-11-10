# Cloud Build feasibility (Path B)

## Verdict

**Local Docker Desktop is not required** for NestHub image builds if Google Cloud Build is used after the dedicated project exists.

`backend/Dockerfile` is a standard multi-stage Maven → JRE image and is compatible with `gcr.io/cloud-builders/docker` in Cloud Build (`cloudbuild.yaml`).

## Required (after project + approval)

| Item | Notes |
|---|---|
| APIs | `cloudbuild.googleapis.com`, `artifactregistry.googleapis.com` (+ `run` to deploy) |
| IAM | Cloud Build service account: Artifact Registry Writer; Cloud Run Admin if deploying from build |
| Repo | Artifact Registry Docker repo e.g. `nesthub` in `asia-south1` |
| Billing | Cloud Build is billable; free tier includes limited daily build-minutes |

## Estimated cost (preliminary, not live-verified)

- Typical NestHub backend image build: a few minutes of e2-medium-class build VM time → often **<$0.50–$2 per build** after free tier.
- Storage: Artifact Registry for 1–2 images → usually **<$1–3 / month** at staging scale.
- Do not treat this as a quote; confirm in Pricing Calculator after project exists.

## Commands (deferred — do not execute without project + approval)

```bash
# Create Artifact Registry repo (approval required)
gcloud artifacts repositories create nesthub \
  --repository-format=docker \
  --location=asia-south1

# Submit build from repository root (config builds backend/Dockerfile with backend context)
gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions=_REGION=asia-south1,_REPO=nesthub,_IMAGE=backend,_TAG=staging \
  .
```

