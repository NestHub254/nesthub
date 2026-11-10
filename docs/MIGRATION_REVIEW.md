# NestHub migration review — SIONA → partner primary repo

**Prepared:** 10 November 2026  
**Working copy:** `C:\Users\njaji\Projects\nesthub-partner`  
**Branch:** `siona/hosting-seo-migration`  
**HEAD (committed infra):** `6cff6752b8145dece69df5e0c0c01fe5bec3c5b7`  
**Status:** Validated locally. **Not committed beyond the fast-forwarded infra commits. Not pushed.**

## 1. Original SIONA workspace

| Item | Value |
|---|---|
| Path | `C:\Users\njaji\Projects\siona-nesthub` |
| Branch | `infra/siona-cloud-deployment` |
| HEAD | `6cff6752b8145dece69df5e0c0c01fe5bec3c5b7` |
| Remotes | `origin` → Siona-Technologies/siona-nesthub; `upstream` → NestHub254/nesthub (`no_push`) |
| Local state | Preserved with SEO/privacy working-tree changes still present |

External backup:  
`C:\Users\njaji\Projects\_migration-backups\siona-nesthub-hosting-seo-2026-11-10`

## 2. New partner workspace

| Item | Value |
|---|---|
| Path | `C:\Users\njaji\Projects\nesthub-partner` |
| Branch | `siona/hosting-seo-migration` |
| Remotes | `origin` → NestHub254/nesthub; `siona-backup` → Siona-Technologies/siona-nesthub |
| Partner `origin/main` | `d758e75b75a86d6530cee76fbee2fafcbd596a2f` (MATCH expected) |
| SIONA infra tip | `6cff675…` (MATCH expected) |

## 3. History action

Partner main had not advanced beyond the shared baseline.  
Created `siona/hosting-seo-migration` from `origin/main`, then **fast-forward-only** merge of `siona-backup/infra/siona-cloud-deployment` (4 commits).

Conflicts during FF: **none**.

## 4. Local SEO/privacy transfer

Applied SIONA working-tree patch + copied untracked SEO/privacy files.  
Additional working-tree changes (uncommitted):

- Firebase security / robots headers
- Frontend SEO metadata + partnership footer
- Privacy + data-deletion static pages
- robots/sitemap
- Sanitized docs under `docs/`
- Sanitized `infra/GCP_PROJECT_STATUS.md`

## 5. Files excluded for public-repo security

Kept only in private SIONA backup / private clone:

- `docs/screenshots/*` (internal QA screenshots)
- Personal owner email previously in GCP status notes
- GCP project number previously in GCP status notes
- Raw billing-account enumeration wording

Secret pattern scan on partner working tree: **0 hits**.

`.env.example` and frontend/tenant env examples contain placeholders only.

## 6. Build / validation

| Check | Result |
|---|---|
| Main frontend build | Pass |
| Tenant portal build | Pass |
| Backend `mvn -DskipTests package` | Pass |
| `node infra/scripts/test-api-base-url.mjs` | Pass |
| Firebase JSON validation | Pass |
| Dist robots/sitemap/privacy/data-deletion | Pass (real files) |
| Tenant noindex meta + robots.txt | Pass |

## 7. Stopped before

- Commit of SEO/privacy working tree
- Push to partner remote
- Merge to partner `main`
- Firebase deploy / DNS / GCP provisioning
- Deletion of private SIONA repo or old clone


## 8. Production audit (read-only, consolidation)

| Item | Finding |
|---|---|
| Live public URL | `https://nesthub.sionaglobal.com/` → CNAME `siona-nesthub-staging-2026.web.app` |
| Firebase project serving the domain | `siona-nesthub-staging-2026` |
| Custom domain state | `HOST_ACTIVE` / `OWNERSHIP_ACTIVE` / `CERT_ACTIVE` |
| Live release | `1794319988678000` (version `b7460b73c8024597`, static SPA rewrites only) |
| GitHub Actions deploy | None on NestHub254/nesthub or Siona-Technologies/siona-nesthub |
| Cloud Build triggers | API not enabled / none |
| Cloud Run / Cloud SQL / Secret Manager | Not provisioned (APIs disabled / empty) |
| Billing on staging project | Disabled |
| Deployment source | Manual Firebase Hosting upload to staging project — **not** Git-linked CI |
| `.firebaserc` in this branch | Staging project only — **must not** be treated as a separate production Firebase project |

**Implication:** Retiring the private Siona-Technologies/siona-nesthub GitHub repo does not by itself take down Hosting, because production is not CI-deployed from that repo. Archive only after NestHub254/nesthub is confirmed as the operational source of truth and any future deploy process is pointed there.
