# NestHub deployment

- Property/owner PWA: https://nesthub.sionaglobal.com
- Property/owner Vercel alias: https://nesthub-six.vercel.app
- Tenant PWA: https://nesthub-tenants.vercel.app
- Hosted API: https://wmwzrhreqmjsmksptzaj.supabase.co/functions/v1/nesthub-api
- Database: NestHub Supabase project `wmwzrhreqmjsmksptzaj`.

The two React/Vite applications are independent Vercel projects. Set `VITE_API_URL`
on both, `VITE_TENANT_PORTAL_URL` on the property app, and `VITE_GOOGLE_CLIENT_ID`
on both. These are public configuration, not secrets. Rebuild after changes.
The Supabase Edge Function CORS allowlist must include each deployed browser origin.
The property app's production origin is `https://nesthub.sionaglobal.com`; the tenant
app remains at `https://nesthub-tenants.vercel.app` until its own domain is configured.
Google sign-in is used only by the property portal; tenant accounts use email
and password. The API rejects tenant Google requests and tenant identities,
including requests that claim to come from the property portal. Only the property
origins used for Google sign-in need to be listed as authorized JavaScript origins
in the Google OAuth client.

The production API lives in `supabase/functions/nesthub-api`. It provides email
and Google login, owner registration, property creation/listing, and property-scoped
tenant/staff creation/listing. It validates Google ID token signatures, issuer,
audience, expiration and verified email. Unknown Google users may only register
as owners; tenant accounts must be created by an owner or manager first.

Sessions use random bearer tokens; only SHA-256 hashes are stored, with a one-hour
expiry. Every authenticated request looks up the current user and role. Logout
revokes the session. Passwords use bcrypt. Tables are inaccessible to direct
anonymous/authenticated Data API clients: only the server uses the service role,
and the API enforces property ownership and role restrictions. No service key is
sent to either PWA. Auth attempts are limited in 15-minute windows.

`verify_jwt=false` is intentional: public login cannot require a Supabase Auth JWT,
and all data routes require the custom server-side session. Do not remove that
route authentication. The default Supabase service role key is supplied only by
the Edge runtime. `GOOGLE_CLIENT_ID` can override the checked-in public Google audience.

The Spring Boot backend is retained for local/alternative hosting and is not the
production host. It uses JWT sessions rather than Edge API sessions. Configure its
database, JWT secret, Google client ID and `ALLOWED_ORIGINS` before starting it.
Its Flyway migrations create the base schema; the Supabase migration adds hosted
sessions, Google identities and service-only table access to that existing schema.

## Verification

Build each PWA with `npm run build`. Check the Edge function using:

```
deno check --config supabase/functions/nesthub-api/deno.json supabase/functions/nesthub-api/index.ts
```

`scripts/verify-hosted-api.mjs` is a manual integration check. Supply
`NESTHUB_TEST_API` and `NESTHUB_TEST_PASSWORD` in the environment; never commit a
password. The test creates `nesthub-check-tenant@example.invalid`; remove this
temporary user afterward using the database administrator connection.

The mounted tenant dashboard uses the connected operations API. Legacy demo components remain in the repository but are not mounted by the current application.

## Custom domain release — 2026-11-12

`https://nesthub.sionaglobal.com` responds successfully and its DNS CNAME points
to `siona-nesthub-staging-2026.web.app` (Firebase Hosting). The Vercel project
`nesthub` serves `nesthub-six.vercel.app` and does not own the custom domain.
Deploying through Vercel therefore does not publish to the custom domain.

Supabase `nesthub-api` version 20 allows the custom origin, restricts rent
generation to owner/manager sessions, supports password recovery across all
account roles, and serves append-only bill credit notes. Migration
`20261112134117_property_credit_notes.sql` and
`20261112135215_append_only_workflow_events.sql` are applied. Read-only
verification confirmed the credit table and payment-limit trigger exist, service
role can call the credit RPC, authenticated users cannot, and the service role
can read/insert audit events but cannot update, delete or truncate them. The
custom-origin preflight returned
HTTP 204 with the matching `Access-Control-Allow-Origin` header, and the API
health endpoint returned HTTP 200. The current property frontend builds locally,
but has not yet been published to Firebase Hosting. The repository now contains
Firebase Hosting configuration for `frontend/dist`, SPA rewrites and hashed asset
caching. Firebase CLI is signed in as `markkyalo226@gmail.com`, but Firebase
returns HTTP 403 when listing Hosting sites for the target project; grant this
account project access (Firebase Hosting Admin is the narrow role) or sign the
CLI in to an account that already has it. Confirm that
the custom domain is also listed in the Google OAuth client's authorized
JavaScript origins so Google sign-in can work there.

## Property Hosting release — 2026-11-23

The property frontend was rebuilt with the production Supabase Edge Function
URL supplied as a build-time `VITE_API_URL` override (the local `.env` remains
localhost-only) and deployed to the default Hosting site in
`siona-nesthub-staging-2026`. The `nesthub.sionaglobal.com` custom domain is
connected to this site. The separate `siona-nesthub-staging-tenant` site was
not deployed. The live root, privacy notice, service terms and `/app/home` SPA
  route returned HTTP 200; the served bundle includes the production API URL.
  The live JS bundle is `index-B73IlIuA.js` and stylesheet is
  `index-jMQvNDkI.css`. The responsive header and dashboard illustration include
  phone-width layout fixes; the CSS bundle contains the narrowed floating cards
  and corrected offsets. The tenant site was not changed.

## Connected operations release — 2026-10-07
Both production aliases deployed successfully. Supabase nesthub-api version 8 uses custom session authentication. Applied migration 20261006082039_connected_property_operations.sql. Frontend deployments include uncommitted workspace changes based on d758e75. See PROPERTY-WORKSPACE.md for supported workflows and provider limitations.

Tenant contact editing and recovery API version 9 added 2026-10-07. Brevo delivery requires sender/key activation; see EMAIL-AND-SUBSCRIPTIONS.md. Recovery regression tests passed without external email delivery.

2026-10-08: nesthub-api version 10 reads encrypted Brevo settings from Supabase Vault via a service-role-only RPC. Sender verified, initial reset request accepted; delivery verification tracked separately.

Email delivery verified: Brevo reported Delivered at 09:34 Africa/Nairobi on 2026-10-08 for the tenant reset email. No browser Supabase login was needed; encrypted Vault configuration was applied using the authenticated connector.

2026-10-08 presentation release: API version 11 and migration `20261008064839_presentation_workflows.sql` add private staff messages and repair images in a private Storage bucket. Image upload and removal require application-session authorization; signed viewing links expire after 15 minutes. UI adds Arial, portfolio reports, CSV exports, printable receipts, tenant history/search, and last/next payment details. See PRESENTATION-GUIDE.md for supported demonstration flows and limitations.
