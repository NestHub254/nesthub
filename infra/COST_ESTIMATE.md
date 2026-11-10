# Preliminary infrastructure cost review (Path B)

**Not live-verified** — dedicated NestHub project / billing link not configured yet. Distinguishes estimates from measured spend.

## Components

| Service | Role | Free / trial notes | Staging estimate | Production lean estimate |
|---|---|---|---|---|
| Firebase Hosting | Static SPAs + `/api` rewrites | Spark limited; **Blaze** needed for Cloud Run rewrites | ~$0–5 | ~$0–15 |
| Cloud Run | Spring Boot API | Request-based free tier (account-level) | ~$0–10 with min=0 | ~$5–40 |
| Cloud Build | Remote Docker builds | Limited free build-minutes/day | cents–$ few per build | same |
| Artifact Registry | Images | Low storage | <$3 | <$5 |
| Secret Manager | DB/JWT secrets | Low access volume | <$1 | <$2 |
| Cloud SQL PostgreSQL | System of record | No useful always-free prod DB | **~$20–70** (dominant) | **~$50–120** dedicated-core |
| Logging / Monitoring | Ops | Free allotments then billable | usually small at staging | monitor growth |
| **Total** | | $300 / 90-day trial may cover early staging | **~$20–70/mo** | **~$60–180/mo** |

## Cost risks

- Cloud SQL left running 24/7 (largest fixed cost)
- Cloud Run min instances > 0
- Uncapped SQL storage autogrowth
- HA without approval (~2× DB)
- High Cloud Build frequency without cache

## Controls (after project exists)

Budget alerts at $5 / $10 / $20 / $50 (alerts ≠ hard caps). Cloud Run min=0, max≤3 for staging. Cap SQL storage autogrowth.
