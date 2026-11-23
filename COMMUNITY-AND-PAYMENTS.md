# Tenant checkout and communications

Release: 8 October 2026. Shared UI remains in frontend/src/pages/operations and is copied to the tenant app with `node scripts/sync-operations.mjs`.

## Payment checkout

Tenant: My money > Pay now > M-Pesa or Bank transfer > amount > external payment instructions > transaction reference/date > review > Submit for confirmation.

This is a checkout interface backed by the existing manual-verification payment workflow, not a live money-collection gateway. The user explicitly chose management confirmation while APIs are unavailable. Submissions stay Pending. The acknowledgement says it is not proof of payment; only confirmed payments reduce balances and create final receipts. Cash remains a management-recorded payment method. No PIN, bank login or card credential is collected.

For a future live gateway, create a server-owned payment intent with amount, currency, bill and tenant. Use provider idempotency keys, authenticated callbacks, amount/currency/reference checks and replay protection. Confirm only on verified provider settlement, not a browser redirect. Keep the manual path for externally paid references. No live payment adapter or callback is enabled in this release.

## Tenant community

Community is tenant-only and scoped to an active tenancy in the current property. Each resident can save an optional photo and bio, see neighbours, post messages and delete their own posts. The latest 100 posts are displayed. Existing tenant-authored group messages are migrated into community history. Previous account notices, payment confirmations and repair updates remain in the read-only Account updates tab.

Emails, phones, payment records, raw avatar paths and other-property members are not returned by the community API. Images use a private Storage bucket and 15-minute signed links. Browser uploads are resized to a 512px JPEG, stripping image metadata. Deleting/replacing a photo removes the old object; an already issued signed URL may remain usable until its expiry/cache clears.

## Management communications

Owner, receptionist and maintenance/grounds staff can use Communications for registered tenant contacts in their own property. This explicitly expands grounds staff communication access without giving them financial access. Choose everyone or specific tenants, Email/SMS/Both, subject and message, then review contacts and send. Emails are individual, without exposing a recipient list. Replies go to the property owner's email. Staff keep an internal Team chat.

Recipient selection is checked server-side; destinations come from stored tenant records, never arbitrary caller addresses. If a contact or property assignment changes before dispatch, that delivery is skipped. Message preparation is idempotent by actor/request ID. Rows are atomically claimed in batches of five. Provider timeouts become Unknown and are not automatically retried. Queued rows can be resumed from history. Leaving the page pauses further batches; there is no background delivery worker yet.

Statuses: Queued, Sending, Accepted, Sandbox, Failed, Unavailable, Unknown, Skipped. Accepted means accepted by the provider, not confirmed delivery. There is no delivery webhook integration yet. Check the provider's logs for final delivery/bounce status. A new message is required after correcting a failed/unavailable destination; do not blindly resend Unknown outcomes.

## Email and SMS setup

Email uses the existing encrypted Brevo credentials and verified sender. Normal property notices are live, subject to Brevo account quotas. No plan upgrade or credits purchase is performed.

SMS adapter: Africa's Talking. Default mode is disabled. Free sandbox messages go to a simulator, not handsets. Real SMS requires a provider account, approved sender as applicable and credits; it is not advertised as free production delivery.

Set server-only environment variables or these fixed Supabase Vault secrets:

| Environment variable | Vault name | Purpose |
| --- | --- | --- |
| BREVO_API_KEY | nesthub_brevo_api_key | Existing email provider key |
| RESET_EMAIL_FROM | nesthub_reset_email_from | Existing verified sender |
| AT_API_KEY | nesthub_at_api_key | Africa's Talking key |
| AT_USERNAME | nesthub_at_username | Provider username (`sandbox` for testing) |
| AT_SENDER | nesthub_at_sender | Approved sender, if required |
| AT_MODE | nesthub_at_mode | `disabled`, `sandbox`, or `live` |

Secrets must never be stored in frontend/VITE variables. Without SMS configuration, the UI states Provider setup required and the history records Unavailable; it never claims delivery to a phone.

Official references: https://developers.brevo.com/reference/send-transac-email and https://help.africastalking.com/en/articles/1170660-how-do-i-get-started-on-the-africa-s-talking-sandbox . SMS request format follows the official Africa's Talking Node SDK.

## Validation

`scripts/verify-community.mjs` creates disposable fixtures, tests membership/privacy, avatar upload/removal, authorship, property isolation, communication permissions, recipient scope, request idempotency, missing phone handling, disabled SMS and pending-to-confirmed payments. Credentials are written only to an ignored local test file for browser checks. Remove those exact fixture accounts/properties and uploaded images afterwards. Never reset real customer accounts.

Security advisors report only the intentional INFO that RLS tables have no public policies: browser roles are denied, and the session-authenticated Edge API authorizes service-role access.

The previous PDF handbook describes the earlier release. Its communication sections need updating before presenting this release.
