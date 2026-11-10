# Security and hosting report — NestHub (SIONA)

**Configs reviewed:** `firebase.json`, `firebase.production.json`  
**Sites:** main (`frontend/dist`), tenant (`tenant-portal/dist`)

## Headers added (both targets)

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: SAMEORIGIN`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

## Indexing headers

- Main: `X-Robots-Tag: noindex, nofollow` on `/login`, `/register`, `/app`, `/app/**`
- Tenant: `X-Robots-Tag: noindex, nofollow` on `**`

## Cache

- `/assets/**` immutable long-cache (main)
- `/sw.js` no-cache
- `/robots.txt`, `/sitemap.xml` short public cache
- `/icon.svg` one-day cache

## Preserved

- `/api/**` Cloud Run rewrites (staging service id in `firebase.json`, production service id in `firebase.production.json`)
- SPA fallback rewrite to `/index.html` after static file resolution

## Explicitly not done

- No Content-Security-Policy (would need NestHub compatibility testing for inline scripts/styles and third-party form/images)
- No DNS changes
- No Cloud Run / SQL / billing provisioning
- No tenant portal UX redesign

## Favicon

- `/icon.svg` remains the NestHub brand favicon and social image reference
