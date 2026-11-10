# Cloud SQL staging (not provisioned — approval required)

| Field | Value |
|---|---|
| Engine | PostgreSQL 16 |
| Edition | Enterprise |
| Region | **`asia-south1`** (aligned with Cloud Run + Firebase Hosting rewrites) |
| Tier | Smallest suitable for staging (shared-core if available; else 1 vCPU / limited RAM) |
| Storage | 10–20 GB SSD, **autogrowth capped** |
| HA | **No** |
| Backups | Automated on |
| DB name | `nesthub_staging` |
| Extensions | `pgcrypto` |
| Network | Prefer private IP + Cloud SQL connector from Cloud Run |
| Isolation | Separate from production and partner NestHub |

Do not create until cost + project + API enablement are approved.
