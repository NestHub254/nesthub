# Cost estimate — Firebase Hosting + Cloud Run + Cloud SQL

Assumes Google **new-customer $300 / 90-day** trial eligibility (confirm in console after `gcloud auth login`). Billing alerts are **not** hard caps.

Region assumption: **`asia-south1`** (recommended). Cloud Run Tier 1 unit rates also apply in `africa-south1`.

## Free / low-cost anchors (verify in current docs)

| Service | Typical free / low starting point |
|---|---|
| Cloud Run | Monthly free tier (request-based): 2M requests, 360k vCPU-seconds, 180k GiB-seconds (account-level) |
| Firebase Hosting | Free Spark / Blaze: generous static storage + transfer for small sites; Blaze required for Cloud Run rewrites |
| Artifact Registry | Small image storage; low cents–dollars |
| Secret Manager | First secrets/versions often pennies at staging scale |
| Cloud SQL | **No meaningful always-free production DB** — dominant cost |

## Staging (minimal)

| Component | Spec | Rough monthly after free tier |
|---|---|---|
| Cloud SQL | Enterprise **shared-core or 1 vCPU / ~0.6–3.75 GiB**, **10–20 GB** SSD, **no HA**, storage autogrowth **capped**, automated backups on | **~$15–55** (shared-core if available; else ~$45–70 for 1 vCPU/3.75 GiB) |
| Cloud Run | Request-based billing, **min instances = 0**, **max = 3**, 1 vCPU / 512 MiB | **~$0–10** at low traffic |
| Artifact Registry + Secret Manager | Staging only | **<$3** |
| Firebase Hosting | Static SPA (+ optional `/api` rewrite) | **~$0–5** |
| **Staging total** | | **~$20–70 / month** (often covered by $300 trial for weeks–months) |

### Staging controls

- `minScale=0`, request-based billing
- `maxScale=3` (or 2)
- Cloud SQL storage autogrowth **limit** set (e.g. 20–40 GB)
- No HA
- Budget alerts: **$5, $10, $20, $50**

## Production (integrity over micro-savings)

| Component | Spec | Rough monthly |
|---|---|---|
| Cloud SQL | Dedicated-core **1 vCPU / 3.75 GiB** (or 2 vCPU if load requires), **20–50 GB** SSD, **no HA initially**, automated backups + PITR, **deletion protection**, private IP | **~$50–120** |
| Cloud Run | min 0 (or min 1 only if cold-start SLA requires), max 5–10, 1 vCPU / 512–1 GiB | **~$5–40** depending on traffic |
| Firebase Hosting | Production site(s) | **~$0–15** |
| Secrets / registry | | **<$5** |
| **Production total (lean)** | | **~$60–180 / month** |

**Do not** put production financial/property records on an unsupported shared-core tier merely to save money.  
**Do not** use the short Cloud SQL free-trial instance for production.  
Enable HA only with explicit approval (~2× DB compute).

## Budget alerts (not caps)

Create budgets on the billing account with thresholds at **$5 / $10 / $20 / $50**. Alerts notify; they do **not** stop spend unless a separate programmatic control is added.
