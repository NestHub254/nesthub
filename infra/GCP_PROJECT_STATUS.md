# GCP staging project status

Updated after automated setup (no paid resources provisioned).

| Field | Value |
|---|---|
| Project name | SIONA NestHub Staging |
| Project ID | `siona-nesthub-staging-2026` |
| Project number | `8657091897` |
| Active gcloud project | `siona-nesthub-staging-2026` |
| Owner | `njajisamson@gmail.com` (`roles/owner`) |
| Billing | **Not linked** — `gcloud billing accounts list` returned **0** accounts |
| Trial credits | **Unknown / unavailable** until a billing account exists |
| Region plan | `asia-south1` |

## Firebase Hosting sites (created; **not deployed**)

| Site | URL |
|---|---|
| `siona-nesthub-staging-2026` (default / main) | https://siona-nesthub-staging-2026.web.app |
| `siona-nesthub-staging-tenant` | https://siona-nesthub-staging-tenant.web.app |

## APIs enabled (without billing)

- cloudresourcemanager.googleapis.com
- serviceusage.googleapis.com
- iam.googleapis.com (+ iamcredentials)
- firebase.googleapis.com
- firebasehosting.googleapis.com
- sqladmin.googleapis.com

## APIs blocked until billing is linked

- run.googleapis.com
- cloudbuild.googleapis.com
- artifactregistry.googleapis.com
- secretmanager.googleapis.com

## Budget

Prepared file: `infra/budget/staging-budget.yaml` ($50 budget with 10/20/40/100% ≈ $5/$10/$20/$50 alerts).  
**Not applied** — no billing account.

## Hard stop

Do not create Cloud SQL, Cloud Run, Artifact Registry images, Secret Manager secrets, or Firebase Hosting deploys until billing is available and explicitly approved.
