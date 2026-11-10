# Region comparison: asia-south1 vs africa-south1

| Criterion | asia-south1 (Mumbai) | africa-south1 (Johannesburg) |
|---|---|---|
| Cloud Run price tier | Tier 1 | Tier 1 |
| Cloud SQL PostgreSQL | Available | Available |
| Firebase Hosting → Cloud Run **rewrites** | **Supported** | **Not listed / not supported** |
| Recommended Hosting colocation | Closer to `asia-east1` Hosting origins than Africa | Farther from documented Hosting/Cloud Run rewrite colocation set |
| Latency for East Africa (Kenya) users | Higher to Mumbai API/DB (~80–180 ms ballpark) | Lower to Johannesburg API/DB |
| Network egress | Prefer same-region Cloud Run ↔ Cloud SQL (private IP / connector) to avoid cross-region DB traffic | Same |
| Trial / free-tier applicability | Same billing account free tier rules | Same |

## Recommendation for lowest sustainable cost + simplest Firebase integration

**Prefer `asia-south1` for Cloud Run + Cloud SQL.**

Reasons:

1. Firebase Hosting can rewrite `/api/**` to Cloud Run in `asia-south1` without a load balancer.
2. Same-region API + Postgres avoids cross-region DB network charges.
3. Same-origin `/api` via Hosting rewrites can avoid browser CORS friction during staging (SPA calls `/api/...` on the Firebase hostname).
4. Both regions are Cloud Run Tier 1 — no pricing-tier penalty for Mumbai vs Johannesburg compute.

Use **direct Cloud Run HTTPS URL** + `VITE_API_URL` only if rewrites are not used. That path **requires** env-driven CORS (see approvals).

Do **not** add Global HTTPS Load Balancer / Cloud CDN solely for custom domain until staging passes and DNS cutover is approved. Cloudflare remains DNS-only.
