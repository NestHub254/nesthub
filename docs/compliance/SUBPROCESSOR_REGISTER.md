# NestHub technology-partner subprocessor register

**Status:** DRAFT — SIONA-maintained for NestHub hosting / privacy support  
**Last updated:** 10 November 2026

| Provider | Purpose | Personal data involved | Notes |
|---|---|---|---|
| Google Cloud / Firebase Hosting | Static website hosting, TLS, CDN edge | IP / request metadata; published site content | Project `siona-nesthub-staging-2026` currently serves public domain |
| Cloudflare (DNS for sionaglobal.com zone) | DNS for `nesthub.sionaglobal.com` | DNS query metadata | DNS changes out of scope for routine deploys |
| Formspree | Public demo/contact form endpoint configured in NestHub frontend | Name, email, phone, message fields | NestHub must confirm continued approval |
| GitHub (NestHub254/nesthub) | Source control | Contributor identities in commits | Partner org owns repository |

Add Cloud Run, Cloud SQL, email providers, payment processors only when actually provisioned / contracted.
