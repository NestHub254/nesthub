# NestHub

NestHub connects rental properties, residents, bills, repairs and building communication through a property workspace and a separate tenant portal.

## Production

- Property workspace: [nesthub.sionaglobal.com](https://nesthub.sionaglobal.com)
- Tenant portal: [nesthub-tenants.vercel.app](https://nesthub-tenants.vercel.app)
- API and database: Supabase Edge Function and Postgres

See [DEPLOYMENT.md](DEPLOYMENT.md) for hosting and authentication details, and [IMPLEMENTATION-STATUS.md](IMPLEMENTATION-STATUS.md) for what is complete and what remains.

## Current connected workflows

- Owners create properties, units, tenant accounts and staff accounts. Tenant move-in connects the resident, unit, rent, deposit and tenancy dates.
- Owners, property managers and maintenance staff receive role-scoped workspaces. Tenant and staff records are checked by the hosted API; clients do not connect directly to protected database tables.
- Rent generation runs idempotently on a daily schedule at 00:05 Africa/Nairobi. Rent is charged for the full month; proration is not implemented.
- Tenants submit M-Pesa or bank references for management review. Confirmed payments update balances and produce downloadable receipts. NestHub does not collect money or automatically reconcile bank/M-Pesa transactions.
- Repairs support assignment, progress, private photos and tenant review. Deposit settlements support owner proposals and tenant responses; refunds remain external.
- Property communications support in-app channels and configured email delivery. SMS requires provider setup.

## Not live yet

Automatic M-Pesa/STK or card collection, bank reconciliation, SMS delivery, paid subscription billing and plan enforcement are not active. Other remaining work includes a complete immutable accounting ledger, broader role invitations/offboarding and recovery, lease/signature document handling, and fuller operational audit and release controls. See the implementation tracker for the full backlog.

## Project layout

```text
frontend/       Property and owner PWA (React + Vite)
tenant-portal/  Separate tenant PWA (React + Vite)
supabase/       Production Edge Function and database migrations
backend/        Spring Boot API for local or alternative hosting; not the production API
scripts/        Workspace synchronization and manual hosted workflow verification
```

## Local development

Run each frontend in its own terminal:

```bash
cd frontend
npm install
npm run dev
```

```bash
cd tenant-portal
npm install
npm run dev
```

Set `VITE_API_URL` to the API URL and `VITE_TENANT_PORTAL_URL` in the property app environment. Use the Supabase Edge Function for production. The Spring Boot service is available for local or alternative hosting with its own configured database and credentials.

## Key project notes

- [Property workspace guide](PROPERTY-WORKSPACE.md)
- [Tenant and property workflow status](IMPLEMENTATION-STATUS.md)
- [Deployment and auth](DEPLOYMENT.md)
- [Email and subscriptions](EMAIL-AND-SUBSCRIPTIONS.md)
- [Property and payment workflows](COMMUNITY-AND-PAYMENTS.md)
