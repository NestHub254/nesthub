# SIONA SEO implementation report — NestHub

**Branch:** `infra/siona-cloud-deployment`  
**Canonical domain:** `https://nesthub.sionaglobal.com/`  
**Date:** 10 November 2026

## Completed by SIONA

1. Title + meta description aligned to Kenya property-management software intent
2. Canonical URL on marketing homepage shell
3. Open Graph + Twitter card metadata using NestHub `icon.svg`
4. Organization / WebSite / SoftwareApplication JSON-LD (no invented ratings, counts, or awards)
5. `robots.txt` + `sitemap.xml` as real static files in `frontend/public`
6. Public static pages: `/privacy/`, `/data-deletion/`
7. Footer partnership attribution to SIONA + live Privacy / Data Deletion links (removed dead Terms `#` link)
8. Image alt-text / dimension hints on landing hero images
9. Private-route `noindex` via Firebase headers and SPA `useRobotsMeta` for `/login`, `/register`, `/app`
10. Tenant portal noindex (`meta robots`, site-wide `X-Robots-Tag`, `robots.txt` Disallow `/`)

## Hosting notes

- API rewrites preserved in `firebase.json` and `firebase.production.json`
- Security headers added without a restrictive CSP
- Static SEO files must be present in `frontend/dist` after build so they are not SPA-fallback HTML

## Marketing claims flagged (not substantiated in repo)

Do not put these into structured data until NestHub evidences them:

- 250+ properties
- 15K+ tenants
- 99.9% uptime
- 98% occupancy decorative metric
- KES 4.8M revenue card
- Live M-Pesa STK / card collection with automatic receipts

Landing copy was left in place as NestHub marketing content; SIONA flagged it for partner confirmation rather than rewriting NestHub’s commercial narrative.

## Partner-owned / outstanding

- Google Search Console verification token + actual ownership proof
- DNS Connected status for `nesthub.sionaglobal.com` (separate infra track)
- NestHub approval of privacy / deletion copy
- Optional PNG Open Graph image if NestHub wants richer social previews than SVG
- Terms of Service (not authored by SIONA)
