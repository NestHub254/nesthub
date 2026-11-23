> Updated workflow controls: see IMPLEMENTATION-STATUS.md. Daily scheduled rent, verified repairs, deposit settlements and cash controls were added on 23 October 2026. Earlier sections below describe the previous release.

# Connected property workspace

Production: https://nesthub.sionaglobal.com/app/home
Tenant PWA: https://nesthub-tenants.vercel.app

The workspace now follows connected workflows rather than the earlier generic record pages. Owner navigation: Home, Units & homes, Tenants, Money & bills, Repairs, Messages, My team, Reports. Tenant navigation: Home, My money, My repairs, Messages, My home.

## Start and move-in
1. Add a property using the top-right Property button.
2. Open Units & homes and register a unit / room with its monthly rent.
3. Choose Move a tenant in. Create their account, select the vacant unit, and enter rent, deposit and tenancy dates.
4. Share their credentials securely; they sign into the separate tenant portal.

Account creation and unit assignment are atomic. Occupied units cannot be booked twice. Ending an assignment preserves history and releases the unit.

## Money
Rent and deposit bills are generated idempotently by an active daily scheduler at 00:05 Africa/Nairobi. Opening or refreshing the management workspace also checks bills as a recovery path; tenant and maintenance sessions cannot trigger billing. Each scheduled property run is recorded. Rent is billed as a full month from the move-in month; proration is not implemented. Add water/electricity/other tenant bills separately from building expenses.

Owners and managers can issue append-only credit notes against rent and other non-deposit bills. A reason is required; notes reduce the tenant's balance and billed reports, appear in the tenant portal and audit stream, and do not alter payment records or send refunds. Pending payments must be reviewed first. Deposit adjustments stay in the move-out settlement flow. The database serializes payment and credit changes and prevents payments exceeding the adjusted bill.

Set payment instructions for your M-Pesa and bank details. Tenants make the payment externally and submit the reference against a bill. Management checks its actual account before confirming or rejecting. Pending submissions do not count as income; pending plus confirmed amounts cannot exceed a bill. Confirmed payments produce downloadable text receipts. No STK push, bank API, or automatic reconciliation is connected.

Expenses follow Pending -> Approved -> Paid, with owner approval. Reports distinguish confirmed operating cash movement from billed operating results; refundable deposits are separate. Owners and managers can export a monthly tenant statement CSV with the opening balance and dated bills, confirmed payments, credit notes and non-balancing pending/rejected payment references. Reports exclude unrecorded costs, tax and depreciation and are not statutory accounts.

## Communication and work
Apartment group, announcements and private resident conversations stay inside NestHub and refresh every 30 seconds. Rent reminders are in-app messages; SMS and WhatsApp delivery are not connected. Residents report repairs; management assigns staff and staff update their own jobs. Residents see repair progress and updates. Maintenance users cannot access rent or payment records.

## Verification and maintenance
`node scripts/sync-operations.mjs` copies shared UI into the separate tenant app before builds.
`node scripts/verify-operations.mjs` exercises hosted workflows using disposable fixtures. It writes `.operations-test-ids.json`; delete only those fixture accounts and their properties afterwards. Do not reset real accounts as part of testing.

Validated 2026-10-07: production builds, Deno type check, hosted onboarding, idempotent bills, partial M-Pesa/bank payments, overpayment denial, owner isolation, payment approval permissions, expense lifecycle, announcement permissions and assigned repair updates.
