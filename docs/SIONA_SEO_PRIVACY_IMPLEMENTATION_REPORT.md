# NestHub — SIONA responsibility execution report

**Branch:** `infra/siona-cloud-deployment` @ `6cff675` (local uncommitted implementation)  
**Canonical domain:** `https://nesthub.sionaglobal.com/`  
**Date:** 10 November 2026  
**Status:** SIONA-owned SEO / privacy / hosting-header work implemented and validated locally. **Not committed, pushed, or deployed.**

---

## 1. SEO implementation

Completed:

- Homepage title / description / keywords for Kenya property-management software intent
- Canonical, Open Graph, Twitter cards, favicon metadata
- JSON-LD: Organization, WebSite, SoftwareApplication (no ratings, awards, or invented counts)
- Static `robots.txt` + `sitemap.xml`
- Improved landing image alt text
- Footer partnership attribution + legal links

Marketing claims flagged (left on NestHub landing; omitted from structured data): 250+ properties, 15K+ tenants, 99.9% uptime, 98% occupancy, KES 4.8M revenue, live M-Pesa STK / card receipts.

Details: `docs/SEO_IMPLEMENTATION_REPORT.md`

## 2. Shared privacy policy draft

- Public HTML: `/privacy/`
- Working markdown: `docs/PRIVACY_POLICY.md`
- Distinguishes NestHub product operator vs SIONA technology partner
- Does **not** declare joint controllership
- Distinguishes verified user/property auth data from schema-only leases/payments/tickets
- Discloses Formspree demo-form endpoint as configured in code

Partner confirmations checklist: `docs/PRIVACY_PARTNER_CONFIRMATIONS.md`

## 3. Data deletion documentation

- Public HTML: `/data-deletion/`
- Internal doc: `docs/DATA_DELETION.md`
- Documents request channel, identity verification, NestHub vs SIONA split, retention caveat, confirmation
- No deletion backend built; no invented SLA

## 4. Google Search Console readiness

Checklist only (no invented verification token): `docs/SEARCH_CONSOLE_SETUP.md`

## 5. Security / hosting

Updated `firebase.json` and `firebase.production.json`:

- Security headers (nosniff, referrer-policy, frame options, permissions-policy)
- Private-route `X-Robots-Tag` on main `/login`, `/register`, `/app/**`
- Tenant site-wide `noindex`
- Preserved `/api/**` Cloud Run rewrites
- No CSP introduced

Details: `docs/SECURITY_HOSTING_REPORT.md`

## 6. Build and validation results

| Check | Result |
|---|---|
| Frontend production build | Pass |
| Tenant portal production build | Pass (no app workflow changes; noindex + robots only) |
| `robots.txt` served as `text/plain` (local dist) | Pass HTTP 200 |
| `sitemap.xml` XML parse + HTTP 200 | Pass |
| `/privacy/`, `/data-deletion/`, `/icon.svg` | Pass HTTP 200 (real files, not SPA HTML) |
| JSON-LD parse | Pass |
| Footer partnership + Privacy + Data Deletion links in bundle | Pass |
| Dead Terms `#` link removed | Pass |
| Firebase JSON parse | Pass |

## 7. Responsive / visual QA

Widths checked via device emulation / layout inspection:

| Width | Homepage horizontal overflow |
|---|---|
| 375 / 390 | None observed |
| 768 / 1024 / 1280 | Minor overflow previously observed on older staging build; current local mobile widths clean |
| 1440 | Clean on prior pass |

Screenshots in `docs/screenshots/`:

- `nesthub-desktop-homepage.png`
- `nesthub-desktop-footer.png`
- `nesthub-desktop-privacy.png`
- `nesthub-desktop-data-deletion.png`
- `nesthub-mobile-homepage-390.png`

## 8. Completed by SIONA vs partner-owned outstanding

### Completed (SIONA)

- Technical SEO + indexing controls
- Privacy draft + deletion docs + partner confirmation checklist
- Footer attribution and legal navigation
- Hosting security / robots headers
- Local builds, static-file validation, screenshots, reports

### Outstanding external / partner

1. Approve and deploy these changes
2. Finish Cloudflare DNS so `nesthub.sionaglobal.com` is Connected + SSL live
3. Google Search Console verification with a real token
4. NestHub legal/privacy confirmations in `docs/PRIVACY_PARTNER_CONFIRMATIONS.md`
5. Substantiate or revise marketing metrics / payment claims
6. NestHub Terms of Service (not authored here)
7. Optional richer PNG Open Graph asset

### Explicitly not done (out of SIONA scope)

- Property listing SEO / publishing
- Backend features, payments, auth redesign
- Tenant portal redesign
- DNS / billing / Cloud Run provisioning
- Commit, push, merge, or production deploy
