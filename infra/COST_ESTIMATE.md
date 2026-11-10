# Estimated monthly infrastructure cost (staging)

Estimates in **USD**, list prices as of audit date, region **africa-south1** where available. Confirm in the [Google Cloud Pricing Calculator](https://cloud.google.com/products/calculator) before approving spend. Cloudflare Workers Assets for static staging is typically within free/low Workers usage for low traffic.

## Recommended staging shape

| Component | Spec | Rough monthly |
|---|---|---|
| Cloud SQL PostgreSQL | Enterprise, **1 vCPU**, **3.75 GiB** RAM, **20 GB** SSD, single-zone (no HA) | **~$45–70** |
| Cloud Run | 1 vCPU / 512 MiB, min 0, max 3, low staging traffic (mostly idle) | **~$0–15** (often near $0 with scale-to-zero + free tier) |
| Artifact Registry | Small Java image storage | **<$2** |
| Secret Manager | ~4 secrets, low access | **<$1** |
| Cloudflare Workers Assets | staging frontend + optional tenant staging | **~$0** at low traffic |
| **Total staging (ballpark)** | | **~$50–90 / month** |

### Cheaper / costlier variants

- **Shared-core / `db-f1-micro`-class** (if still offered in region): can be lower, but may be tight for Spring Boot + Flyway cold starts — verify availability in `africa-south1`.
- **HA Cloud SQL**: roughly **2×** compute cost — not recommended for staging.
- **Always-on Cloud Run min instances = 1**: adds roughly tens of USD/month; keep **min = 0** for staging.

## Cloud SQL unit anchors (Enterprise, africa-south1 listed with Americas/EMEA-class pricing in public docs)

- vCPU ≈ **$0.0413 / hour** → ~**$30 / vCPU-month** (730 h)
- Memory ≈ **$0.007 / GiB-hour** → ~**$5.1 / GiB-month**
- SSD storage ≈ **$0.17 / GB-month** → 20 GB ≈ **$3.40**

## Cloud Run unit anchors (Tier 1 includes africa-south1)

- Request-based: ~**$0.0864 / vCPU-hour**, ~**$0.009 / GiB-hour**, ~**$0.40 / million requests**
- Free tier applies across projects on a billing account

## Approval required before

- Enabling billable GCP APIs
- Creating Cloud SQL instance
- Creating Artifact Registry / Cloud Run service that incurs spend
- Attaching custom domains that expose staging publicly
