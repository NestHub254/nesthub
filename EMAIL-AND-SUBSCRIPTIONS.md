# Email recovery and proposed subscriptions

## Current release
Management can edit tenant name, email and phone under Tenants -> Edit account. The server checks property ownership/manager assignment. Email changes revoke tenant sessions and existing reset requests; they do not change unit or financial history.

Account recovery uses the registered email, a random 256-bit link token and six-digit OTP for tenants, owners, managers and maintenance staff. Only hashes are stored. Requests expire after 15 minutes and lock after five wrong OTPs. A newer request invalidates earlier requests; successful reset consumes all outstanding requests and revokes existing sessions atomically. Reset forms require matching passwords of at least eight characters. IP/email request limits protect the public endpoints. The response does not disclose whether an email belongs to an account. Management does not receive a user's password or recovery token.

Brevo is connected as of 2026-10-08 using the verified sender markkyalo226@gmail.com. Configuration is encrypted in Supabase Vault under nesthub_brevo_api_key and nesthub_reset_email_from. A fixed service-role-only RPC reads these settings; anonymous and authenticated client roles cannot execute it. Edge environment settings still take precedence when present. API key expires 2027-10-08 (and after 90 days of inactivity). SMS is not offered by the reset form.

## Free MVP email activation
1. Create a Brevo Free account and verify the sender mailbox. Free plan currently allows 300 emails/day. A free mailbox can be used for an MVP with Brevo's compliant sender rewriting; a custom authenticated domain is preferable later.
2. Enable transactional sending and generate an API key in Brevo. The service may require account review.
3. In Supabase project wmwzrhreqmjsmksptzaj -> Edge Functions -> Secrets, set BREVO_API_KEY and RESET_EMAIL_FROM (the verified sender email). Never put the key in VITE variables, frontend code, Git, or chat.
4. Request a reset for a controlled test tenant and confirm the message arrives. Test its link and OTP, then confirm login. API acceptance alone is not inbox delivery verification.
5. Turn off Brevo click tracking for recovery mail. Link tokens are URL fragments and never intentionally included in application request logs. Monitor provider rejection/bounce logs; do not log reset tokens or OTPs.

Provider: https://www.brevo.com/products/transactional-email/
API: https://developers.brevo.com/docs/send-a-transactional-email

## Proposed packaging (not enforced or charged yet)
| Plan | Proposed KES/month | Limits and capabilities |
| --- | ---: | --- |
| Basic | 1,500 | 1 property / 10 units, tenant accounts, manual payments, repairs, in-app messages |
| Standard | 2,500 | Up to 5 properties / unlimited units, managers and maintenance staff, expenses and reports |
| Enterprise | 5,000 | Unlimited properties / units; portfolio reporting available, custom roles still planned |

Tenants and staff inherit their owner's subscription; they do not purchase separate plans. Password recovery and access to existing balances must never depend on an active paid plan. Provider charges for SMS and payments are separate from subscription prices.

Implementation should add an owner subscription record with plan, billing status, paid-through date and grace period, plus a central server entitlement resolver. Enforce property/unit limits transactionally when records are created and permissions on API actions; hiding buttons alone is insufficient. Count all retained units so archiving cannot evade limits. Downgrades should stop additions above the new limit without deleting existing data. Expired workspaces retain read access and recovery. Plan changes come only from verified, idempotent billing webhooks or a protected platform administrator—not an owner-controlled request field. Choose and connect a billing provider before enabling paid checkout.

The landing page marks these as proposed packages and avoids unsupported claims about STK push, cards, push notifications, automatic email receipts, customer counts and uptime guarantees. Private repair photos and portfolio reports are now implemented.

Reset emails use portal-specific links and logos with Arial typography. This does not change the inbox avatar: the current Gmail sender is rewritten through Brevo. A verified sender domain and compatible mailbox branding such as BIMI are needed for a reliable brand-avatar setup; no domain or certificate has been purchased.

## Validation
`node scripts/verify-recovery.mjs seed` creates disposable fixtures and a private seed SQL file. Apply the seed using privileged database tooling, then `node scripts/verify-recovery.mjs verify`. It checks editing isolation, OTP lockout, expiration, confirmation matching, single-use, session revocation and new-password login. Remove only those fixtures afterwards. No emails are sent by this regression test; delivery must be tested separately after configuration.

## Delivery verified — 2026-10-08
Brevo logs confirmed Sent and Delivered for the live tenant reset email at 09:34 Africa/Nairobi to markkyalo@gmail.com. Brevo rewrites the verified Gmail sender to its compliant brevosend.com address. The tenant password was not changed during this delivery test. Existing reset verification tests cover code matching, expiry, reuse and session invalidation.

The branded version was also confirmed Delivered at 10:16 Africa/Nairobi to the tenant's current email on 8 October 2026. This verification did not change the tenant's password.
