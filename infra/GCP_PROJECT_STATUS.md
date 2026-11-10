# GCP staging project status

Public summary of the NestHub staging Google Cloud / Firebase wiring.  
Sensitive operator account details remain in SIONA’s private operational records.

| Field | Value |
|---|---|
| Project name | SIONA NestHub Staging |
| Project ID | `siona-nesthub-staging-2026` |
| Active gcloud project | `siona-nesthub-staging-2026` |
| Billing | Not linked at last SIONA check — paid resources were not provisioned |
| Region plan | `asia-south1` |

## Firebase Hosting sites

| Site | URL |
|---|---|
| `siona-nesthub-staging-2026` (default / main) | https://siona-nesthub-staging-2026.web.app |
| `siona-nesthub-staging-tenant` | https://siona-nesthub-staging-tenant.web.app |

## APIs typically required

Enabled without billing in the original setup path:

- cloudresourcemanager.googleapis.com
- serviceusage.googleapis.com
- iam.googleapis.com (+ iamcredentials)
- firebase.googleapis.com
- firebasehosting.googleapis.com
- sqladmin.googleapis.com

Usually blocked until billing is linked:

- run.googleapis.com
- cloudbuild.googleapis.com
- artifactregistry.googleapis.com
- secretmanager.googleapis.com

## Budget

Prepared file: `infra/budget/staging-budget.yaml` ($50 budget with threshold alerts).  
Not applied while billing is unavailable.

## Hard stop

Do not create Cloud SQL, Cloud Run, Artifact Registry images, Secret Manager secrets, or production Firebase changes until billing and NestHub approvals are explicit.
