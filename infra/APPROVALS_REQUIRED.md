# Approvals required (post Path B code)

Path B **code** is implemented locally. Remaining items need your dedicated GCP project and explicit approval:

1. Provide NestHub GCP **project ID** (you create it; do not ask the agent to create it unless approved).
2. Confirm billing / $300 trial; set budget alerts $5/$10/$20/$50.
3. Approve enabling: Cloud Run, Cloud SQL, Secret Manager, Artifact Registry, Cloud Build, Firebase (Blaze for rewrites).
4. Approve creating staging Cloud SQL + Cloud Run `nesthub-api-staging` + Artifact Registry.
5. Approve first Firebase Hosting staging deploy (default `*.web.app` only — no production DNS).
6. Approve Cloud Build image submit.

CORS env change is **not** required for Path B same-origin Hosting. Keep localhost CORS for local Vite.
