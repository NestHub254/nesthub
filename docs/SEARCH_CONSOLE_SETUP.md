# Google Search Console setup checklist (SIONA)

Do **not** invent verification tokens. Complete these steps in the live Google account that should own NestHub Search Console.

## Before verification

1. Deploy the SEO-ready NestHub main hosting build so `/`, `/robots.txt`, `/sitemap.xml`, `/privacy/`, and `/data-deletion/` resolve on `https://nesthub.sionaglobal.com`.
2. Confirm DNS for `nesthub.sionaglobal.com` is Connected on Firebase Hosting with a valid certificate.
3. Confirm tenant hosting remains noindex and is not submitted as the marketing property.

## Recommended property type

- Prefer **URL-prefix** property: `https://nesthub.sionaglobal.com/`
- Optionally also add a **Domain** property for `sionaglobal.com` if SIONA already manages that DNS property centrally (DNS TXT verification). Do not mix tenant portal hosts into the NestHub marketing property.

## Verification methods (choose one)

1. **HTML tag** — Google provides a meta tag; add it to `frontend/index.html` `<head>` only after receiving the real token, then redeploy.
2. **HTML file upload** — upload Google’s file into `frontend/public/` and redeploy.
3. **DNS TXT** — add the TXT record Google provides on `sionaglobal.com` / `nesthub` as instructed (Cloudflare DNS-only). Coordinate with whoever has Zone DNS Edit.

## After verification

1. Submit sitemap: `https://nesthub.sionaglobal.com/sitemap.xml`
2. Inspect URL for `/` and request indexing if needed
3. Confirm `/login`, `/register`, and `/app` are excluded or show noindex in URL inspection
4. Monitor Coverage / Pages for unexpected soft-404 SPA fallbacks on static SEO files
5. Do not submit the tenant portal hostname as a marketing sitemap

## Ownership hygiene

- Keep Search Console access limited to NestHub operators and SIONA technical staff who need it
- Record who completed verification in the deployment runbook after it happens
