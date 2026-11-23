# NestHub presentation walkthrough

Updated 12 November 2026. Production: https://nesthub.sionaglobal.com and https://nesthub-tenants.vercel.app.

## Suggested demonstration

1. Open the landing page and its role tabs. Use the Tenant portal button to show the separate resident PWA.
2. Sign in as the owner. Home shows occupancy, money received, unpaid bills and work needing attention. The top-right theme selector applies across the owner workspace. Both portals use Arial.
3. Open **Units & homes → Add unit / room**. Register a rentable space, its type, floor and monthly rent. Vacant units appear automatically in **Tenants → Move a tenant in**. Tenant creation and unit assignment save together.
4. Open a tenant card. Check their contact details, lease dates, tenancy history and payments. **Edit account** changes their name, email or phone; changing the email revokes old sessions and reset links.
5. In **Money & bills**, set payment instructions. The tenant pays externally through M-Pesa or bank transfer and submits their reference. The owner checks the actual transaction and confirms or rejects it. Confirmation updates balances and creates a printable receipt. Management can also record cash or a move-in payment.
6. Add a water/electricity bill for a tenant. Record the supplier invoice separately under expenses, approve it, and mark it paid. This keeps tenant charges and property costs distinct.
7. The tenant reports a repair. Management assigns it to a staff account; staff update progress. Open **Add a repair photo** on the ticket for before/after evidence. Up to five private photos per repair; uploaders and management can remove their permitted photos.
8. Show apartment group messages, announcements, a private tenant conversation and private team chat. Residents cannot see team chat; maintenance staff cannot see tenant finances.
9. Open **Reports**. Choose a month and either one property or the entire portfolio. Show cash result, deposits, occupancy, billed-versus-collected rent, unpaid bills and property comparison. Export CSV or print/save PDF.
10. In the tenant portal, show last confirmed payment, next unpaid bill, receipts, repair progress, messages and their assigned home. Password recovery emails contain a secure link plus a six-digit code; the tenant supplies that code and matching new passwords.

## What is live and what is still a provider setup

| Capability | Current behavior |
| --- | --- |
| Property/tenant/staff workspaces | Live, role and property scoped |
| M-Pesa and bank payments | External payment + reference + management confirmation; no STK prompt or automatic reconciliation |
| Receipts | Downloadable HTML receipt with print/save PDF; not automatically emailed |
| Reports | Monthly property and portfolio reports, CSV, print/save PDF; excludes statutory accounting adjustments |
| Repairs | Assignment, progress notes, private images, resident updates |
| Communication | In-app group, announcements, private tenant conversations and staff chat; refreshes every 30 seconds |
| Email | Brevo tenant password recovery; link + OTP, expiry, attempt limits, single use and session revocation |
| Email branding | Logo inside the reset email. Inbox sender avatar requires sender-domain/provider branding; it is not controlled by the email HTML |
| Subscriptions | Proposed packages shown publicly. MVP access remains unmetered; billing and plan limits are not active |
| PWA | Installable on supported browsers. Online access is required for live records and actions |
| Monthly rent | Generated idempotently by an active daily scheduler at 00:05 Africa/Nairobi; opening or refreshing the workspace also checks bills. Full month from move-in; no proration |
| SMS / WhatsApp / push | Not connected; in-app notices are available |

## Verification

The deployed API was checked for rent/deposit idempotency, atomic tenant/unit onboarding, cross-owner isolation, partial payments and overpayment prevention, approval permissions, expense lifecycle, repair assignment/completion, private staff chat isolation, photo upload/signed access/removal, and tenant updates. Disposable API fixtures and photos were removed after testing. Both production builds passed and Deno type checking passed. Browser checks cover owner reports, tenant directory, form validation and mobile tenant rendering. Existing customer records were preserved.

If an installed PWA shows the old design, close/reopen it or reload again after the update downloads. Do not clear browser data unless necessary, because that signs you out.
