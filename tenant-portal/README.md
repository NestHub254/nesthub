# NestHub — Tenant Portal

## Run it

```bash
npm install
npm run dev
```

Then log in with any email/password once your backend is up — or see "Backend status" below for what's real vs. mocked right now.

## What's wired up

**Auth pages** (`/login`, `/forgot-password`)
- Email + password login, calling `/api/auth/login`.
- Google / Apple / GitHub buttons on Login — **UI only**. No OAuth app is registered yet, so clicking shows a "not connected yet" note instead of pretending to sign you in.
- Forgot Password now has an Email / Mobile number toggle. Both submit to backend endpoints that **don't exist yet**:
  - `/api/auth/forgot-password` (email reset link)
  - `/api/auth/forgot-password/sms` (SMS reset code — would need Africa's Talking or similar wired server-side)

**Tenant Dashboard** (`/app/*`) — fully interactive, running on mock data (`src/data/mockData.js` + `src/data/mockStore.jsx`) so you can click through the whole experience before Supabase is connected:
- **Overview** — greeting banner, rent/tickets/notifications summary, pinned announcement.
- **Rent & Payments** — simulated M-Pesa STK push (2.2s "awaiting PIN" delay) and card payment, plus payment history.
- **Maintenance** — raise a ticket (category, description, optional photo), see status as a stepper (Raised → In progress → Awaiting parts → Done → Closed), confirm-and-close once marked done.
- **Community** — pinned management announcements + a tenant notice board you can post to.
- **Notifications** — unified feed (tickets, payments, announcements), mark one or all as read.
- **Profile** — lease details, editable contact info (validated), document list.

Mock state persists in `localStorage` under `nesthub_mock_store_v1` so it survives a refresh — clear it any time to reset the demo data.

## What still needs a backend

Nothing in the dashboard reads or writes to Supabase yet — it's all local mock state. Per the blueprint, the real backend needs:
- Supabase schema for `tenants`, `payments`, `tickets`, `announcements`, `notices`, `notifications`
- Row Level Security so each tenant only sees their own unit's data
- M-Pesa Daraja integration for the real STK push (sandbox first)
- An SMS provider (Africa's Talking is the natural fit for Kenya) for the mobile reset flow
- OAuth apps registered with Google, Apple, and GitHub if social login is wanted for real

`src/data/mockStore.jsx` is the single seam to replace — its functions (`payRent`, `createTicket`, `closeTicket`, `postNotice`, etc.) are named for what they'll do once they call real endpoints instead of `setTimeout`/`localStorage`.

## Note on session storage

`src/api/client.js` now stores the session in `sessionStorage` instead of `localStorage` (previously used) — this is a small hardening step, not a full fix. It limits exposure but doesn't stop XSS from reading the token; the real fix is an httpOnly cookie issued by the backend, which the frontend can't do alone.
