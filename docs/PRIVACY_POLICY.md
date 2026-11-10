# NestHub Privacy Policy

**Status:** Published (partner-approved public copy)  
**Public page:** `frontend/public/privacy/index.html` → `https://nesthub.sionaglobal.com/privacy/`  
**Last updated:** 10 November 2026

This markdown mirrors the approved public privacy policy. NestHub remains responsible for NestHub product, customer, and property-related privacy decisions. SIONA Technologies Limited is the technology partner for hosting and related engineering. This policy does not treat the parties as joint controllers.

---

## Parties

| Party | Role | Verified public facts |
|---|---|---|
| NestHub (and its operating partner) | NestHub product operator; primary contact for NestHub users | Site `https://nesthub.sionaglobal.com/`; email `hello@nesthub.app`; phone/WhatsApp `+254 701 388 400` |
| SIONA Technologies Limited | Technology partner (hosting / engineering) | `https://sionaglobal.com`; does not own NestHub brand or partner property data |

## Verified NestHub data categories (from repository)

Present in application entities / auth flows:

- User: full name, email, password hash, role, property association, unit label, phone, created timestamp
- Property: name, address, owner id, created timestamp
- Client session tokens for signed-in users
- Public demo/contact form fields (name, email, phone, property name, message) via Formspree endpoint configured in `Landing.jsx`

Schema also defines leases, payments, tickets, announcements, and staff messages. Those are **product design**, not asserted here as live production processing unless NestHub has enabled the corresponding services.

## SIONA technology-provider processing

SIONA may process:

- Hosting request/security logs and diagnostics for NestHub web surfaces it operates
- Deployment and infrastructure metadata
- Limited support correspondence related to NestHub infrastructure

SIONA does not use NestHub customer data for SIONA marketing.

## User rights and contacts

- NestHub product requests: `hello@nesthub.app`
- Deletion instructions: `/data-deletion/`
- Technology-partner context: https://sionaglobal.com
