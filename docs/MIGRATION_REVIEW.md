# NestHub migration review — SIONA → partner primary repo

**Prepared:** 10 November 2026  
**Branch:** `siona/hosting-seo-migration`  
**Tip commit:** see `git rev-parse HEAD` on this branch (includes infra + SEO/privacy commits)  
**PR:** https://github.com/NestHub254/nesthub/pull/1  
**Status:** Partner-approved legal pages finalized; static-release config added. Proceeding to merge and static Hosting deploy under SIONA authorization.

## 1. Source workspaces (logical)

| Workspace | Role |
|---|---|
| Private SIONA clone / backup | Historical SIONA working copy and offline backup of SEO/privacy drafts |
| Partner clone | Primary working copy for NestHub254/nesthub |

Absolute local filesystem paths are intentionally omitted from this public document.

## 2. Partner repository remotes

| Remote | Repository |
|---|---|
| `origin` | NestHub254/nesthub |
| `siona-backup` | Siona-Technologies/siona-nesthub |

Partner `origin/main` baseline at branch creation: `d758e75b75a86d6530cee76fbee2fafcbd596a2f`.

## 3. History action

Partner main had not advanced beyond the shared baseline.  
Created `siona/hosting-seo-migration` from `origin/main`, then **fast-forward-only** merge of `siona-backup/infra/siona-cloud-deployment` (4 commits).

Conflicts during FF: **none**.

Included infrastructure commits:

1. `16279e5` — Cloud Run / Cloudflare staging scaffolding  
2. `65efb7b` — Firebase Hosting + asia-south1 staging plan  
3. `a0a9e13` — Path B same-origin API routing  
4. `6cff675` — staging project wiring  

Subsequent SEO/privacy commit(s) follow on the same branch.

## 4. SEO / privacy transfer

Included on this branch:

- Firebase security / robots headers  
- Frontend SEO metadata + partnership footer  
- Privacy + data-deletion published static pages (partner-approved)  
- robots.txt / sitemap.xml  
- Sanitized docs under `docs/`  
- Sanitized `infra/GCP_PROJECT_STATUS.md`  
- `firebase.static-release.json` (static-only Hosting; no Cloud Run rewrites)  

## 5. Files excluded for public-repo security

Kept only in private SIONA backup / private clone:

- Internal QA screenshots  
- Personal operator account identifiers previously present in GCP status notes  
- Raw billing-account enumeration wording  
- Internal `PRIVACY_PARTNER_CONFIRMATIONS.md` (removed from public repo; offline private copy retained)  

Secret pattern scan on the public migration contents: **0 credential hits** (see pre-merge cleanup).

`.env.example` and frontend/tenant env examples contain placeholders only.

## 6. Build / validation

| Check | Result |
|---|---|
| Main frontend build | Pass (re-run at pre-merge cleanup) |
| Tenant portal build | Pass |
| Backend `mvn -DskipTests package` | Pass |
| `node infra/scripts/test-api-base-url.mjs` | Pass |
| Firebase JSON validation | Pass |
| Dist robots/sitemap/privacy/data-deletion | Pass (real files) |
| Tenant noindex meta + robots.txt | Pass |

## 7. Stopped before

- Merge to partner `main`  
- Firebase deploy / DNS / GCP provisioning  
- Archive or deletion of private SIONA repo  

## 8. Production audit (read-only)

| Item | Finding |
|---|---|
| Live public URL | `https://nesthub.sionaglobal.com/` → CNAME `siona-nesthub-staging-2026.web.app` |
| Firebase project serving the domain | `siona-nesthub-staging-2026` |
| Custom domain state | `HOST_ACTIVE` / `OWNERSHIP_ACTIVE` / `CERT_ACTIVE` |
| Live release (pre-merge check baseline) | `1794319988678000` (version `b7460b73c8024597`, static SPA rewrites only) |
| GitHub Actions deploy | None observed on NestHub254/nesthub or Siona-Technologies/siona-nesthub |
| Cloud Build / Cloud Run / Cloud SQL / Secret Manager | Not provisioned for this project path |
| Billing on staging project | Disabled |
| Deployment source | Manual Firebase Hosting upload — **not** Git-linked CI |
| `.firebaserc` in this branch | Staging project only — **must not** be treated as a separate production Firebase project |

**Implication:** Retiring the private Siona-Technologies/siona-nesthub GitHub repo does not by itself take down Hosting. Archive only after NestHub254/nesthub is confirmed as the operational source of truth for future deploys, with explicit approval.
