# NestHub Privacy Policy (shared draft)

**Status:** DRAFT — pending NestHub partner and legal approval. Not final.  
**Public mirror:** `frontend/public/privacy/index.html` → `https://nesthub.sionaglobal.com/privacy/` (draft page)  
**Last updated:** 10 November 2026

This markdown is the shared working draft only. The public HTML page is the website draft copy. Do not treat either as an approved production policy until NestHub explicitly confirms. Do not invent partner legal identity details beyond what NestHub has already published on the marketing site.

---

## Parties

| Party | Role in this draft | Verified public facts |
|---|---|---|
| NestHub (and its operating partner) | NestHub product operator; primary contact for NestHub users | Site `https://nesthub.sionaglobal.com/`; email `hello@nesthub.app`; phone/WhatsApp `+254 701 388 400` |
| SIONA Technologies Limited | Technology partner (hosting / engineering) | `https://sionaglobal.com`; does not own NestHub brand or partner property data |

Controller / processor designations are **not** assigned in this draft. They must be confirmed commercially before final publication.

## Verified NestHub data categories (from repository)

Present in application entities / auth flows:

- User: full name, email, password hash, role, property association, unit label, phone, created timestamp
- Property: name, address, owner id, created timestamp
- Client session tokens for signed-in users
- Public demo/contact form fields (name, email, phone, property name, message) via Formspree endpoint configured in `Landing.jsx`

Schema also defines leases, payments, tickets, announcements, and staff messages. Those are **product design**, not asserted here as live production processing unless NestHub confirms production enablement.

## SIONA technology-provider processing (finalisable by SIONA)

SIONA may process:

- Hosting request/security logs and diagnostics for NestHub web surfaces it operates
- Deployment and infrastructure metadata
- Limited support correspondence related to NestHub infrastructure

SIONA does not use NestHub customer data for SIONA marketing.

## User rights and contacts

- NestHub product requests: `hello@nesthub.app`
- Deletion instructions: `/data-deletion/`
- Technology-partner context: https://sionaglobal.com

Retention periods, DPO details, supervisory authority wording, and production hosting regions remain subject to partner confirmation (`docs/PRIVACY_PARTNER_CONFIRMATIONS.md`).
