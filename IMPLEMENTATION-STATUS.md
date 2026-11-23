# Specification implementation tracker

Source: NestHub_Developer_Specification.pdf (8 October 2026). Started 23 October 2026.

This is an incremental implementation, not a claim that all 25 modules are finished. Existing customer records must be preserved. Payment and messaging provider dependencies must never be represented as live integrations before verification.

## Current delivery: rental workflow controls and billing corrections

- Daily idempotent rent generation at 00:05 Africa/Nairobi through pg_cron, with per-property run history. Existing full-month billing terms remain unchanged.
- Repairs: Before/After evidence labels, upload hash, retained photos, completion submission, tenant acceptance/dispute, independent owner verification or explicit owner override.
- Existing Completed repairs remain historical; they are not backfilled as verified.
- Deposit settlement after recorded move-out inspection: owner proposal, tenant acceptance/dispute, revised proposals, external refund reference. Does not initiate a refund or decide disputed deductions automatically.
- Cash disabled by default; owner can enable it, but the submitter cannot confirm their own cash record.
- Financial insert/update audit plus repair, cash-policy, move-out and deposit before/after events. Workflow audit rows are append-only at the service-role grant level; a full platform audit requirement remains.
- Append-only credit notes correct non-deposit bills without editing payment history. The tenant sees each note and the updated balance; billing reports and future payment limits include credits. Pending payments must be resolved before issuing a credit. Deposit changes remain in the deposit-settlement workflow.

## Custom property-domain release

- Production property UI: `https://nesthub.sionaglobal.com` (updated through Firebase Hosting on 23 November 2026).
- The custom domain CNAME resolves to Firebase Hosting project `siona-nesthub-staging-2026`; the Vercel project is a separate deployment and does not serve that hostname.
- Supabase `nesthub-api` version 20 allows the custom origin, restricts rent generation to owner/manager sessions, supports hashed email recovery for all account roles, and serves the credit-note workflow. The custom-origin browser preflight returned HTTP 204 with the matching `Access-Control-Allow-Origin` header; the function health endpoint returned HTTP 200. The credit-note table, service-only RPC and payment-limit trigger are live; a read-only check confirmed authenticated users cannot invoke the RPC directly.
- The property frontend was rebuilt with `VITE_API_URL` set to the production Supabase Edge Function for this build only (the local `.env` still points to localhost), then deployed to Firebase Hosting site `siona-nesthub-staging-2026`. Live verification on 23 November returned HTTP 200 for `/`, `/privacy.html`, `/terms.html` and `/app/home`; the served JS bundle is `index-B73IlIuA.js` and stylesheet is `index-jMQvNDkI.css`. Both the production API URL and phone-width dashboard-card rules are present in the live assets. The tenant Hosting site was not deployed.
- The mobile landing header and floating dashboard illustration received responsive fixes before the 23 November release. The live page was reloaded and confirmed to render the current property landing page; earlier 390px inspection identified illustration overflow that the final CSS rules address.
- Firebase CLI is active as `njajisamson@gmail.com`; the project is `siona-nesthub-staging-2026`. The custom domain is connected to its default property Hosting site. The repository targets `frontend/dist` with SPA rewrites and hashed asset caching.
- Google OAuth's authorized JavaScript origins still need confirmation for the custom domain; this is configured outside the repository.
- The current property build includes email recovery: a 256-bit link token and six-digit OTP are hashed, expire after 15 minutes, lock after five wrong codes, and revoke all sessions on success. The API supports all account roles. New account creation and reset require at least eight characters; existing shorter passwords still work for sign-in.

## Remaining foundation work (dependencies first)

1. Organizations, memberships and scoped role permissions; invitation, offboarding and MFA.
2. Immutable accounting ledger, payment receipts independent of invoice allocations, unallocated credits, reversals and financial invariant tests. Property-bill credit notes now exist; preserve and reconcile historical balances during ledger migration.
3. Proration, configurable billing terms, opening balances/imports, late fees and disputes that suspend penalties.
4. Background delivery worker/outbox, scheduled notices/digests, provider delivery callbacks, preferences and multilingual templates.
5. Lease and inspection documents, versioned signatures, full move-out requests and attached inspection evidence. Current deposit evidence is a written reference, not a dedicated inspection attachment vault.
6. PDF/Excel reporting, historical snapshots and document verification. A monthly tenant statement CSV now carries forward the opening balance and lists bills, confirmed payments, credit notes, and non-balancing pending/rejected references.
7. Subscription catalogue and central server entitlements, usage, checkout, billing lifecycle; final pricing needs reconciliation with the specification.
8. Backups/restore rehearsal, monitoring, offline action queue, accessibility/load testing, CI and staged release controls.

## Subsequent modules

- Meter registry/readings/tariffs and utility recovery.
- Staff tasks/shifts/attendance, spending rules and delegated approvals.
- Vendors, quotes, preventive maintenance and procurement.
- Visitors, parcels, parking and incidents.
- Listings, leads, viewing and application workflows.
- Community moderation, amenities and estate administration.
- Portfolio branches/agency ownership, commercial leases and short-stay.
- Tax/compliance tools after verified requirements, integrations/public API, platform admin.
- AI/IoT/native wrappers only after the reliable operational foundation.

## External setup still outstanding

Live M-Pesa/bank payment credentials and approved provider configuration; live SMS account/sender/credits. No external message or financial transfer is authorized merely by running a regression test.
