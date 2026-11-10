# Cloud SQL staging (not provisioned yet)

## Planned instance

| Field | Value |
|---|---|
| Engine | PostgreSQL 16 |
| Edition | Enterprise |
| Region | `africa-south1` (Johannesburg) |
| Tier (staging) | `db-f1-micro` or `db-custom-1-3840` (1 vCPU / 3.75 GiB) — confirm cost before create |
| Storage | 20 GB SSD, autoscale on |
| Backups | Automated daily, PITR on |
| Database | `nesthub_staging` |
| Extensions | `pgcrypto` (required by Flyway `V1__init.sql`) |
| Network | Private IP preferred (VPC + Cloud SQL Auth Proxy / Direct VPC egress from Cloud Run). Public IP only if temporarily required for bootstrap, with authorized networks locked down. |
| Isolation | Separate from any future production instance and from partner NestHub production |

## Provisioning gate

Do **not** create this instance until:

1. GCP project ID is selected and billing is confirmed by the user
2. Estimated monthly cost is accepted (see `infra/COST_ESTIMATE.md`)
3. Required APIs are explicitly approved for enablement (`sqladmin.googleapis.com`, `run.googleapis.com`, `secretmanager.googleapis.com`, `artifactregistry.googleapis.com`)

## After create (checklist)

1. Create DB user dedicated to staging (not shared with production)
2. `CREATE EXTENSION IF NOT EXISTS pgcrypto;`
3. Store JDBC URL / user / password in Secret Manager
4. Point Cloud Run staging at those secrets
5. Let Flyway apply `V1` then `V2` on first boot
6. Never import partner customer data
