# A³ Markets API access and operations

## Routes

- \`GET /api/intelligence?symbol=BTC\`: public dashboard summary used by the terminal UI.
- \`GET /api/v1/intelligence?symbol=BTC\`: complete customer API response. Requires \`Authorization: Bearer a3_live_...\`.
- \`GET /api/v1/cross-asset\`: source-aware cross-asset snapshot.
- \`POST /api/webhooks/stripe\`: Stripe subscription provisioning.

The public dashboard summary is deliberately separate from the paid API so the existing browser dashboard does not need a customer secret.

## Production smoke-test configuration

The GitHub Actions workflow runs its live trust checks only when the repository variable
`A3_PRODUCTION_BASE_URL` is set to the exact HTTPS origin of the A³ deployment.
Do not point it at the CX Switch project or assume a Vercel domain alias without
checking which project owns it.

For the optional authenticated check, add a GitHub Actions repository secret named
`A3_TEST_API_KEY` containing a dedicated Free or Pro test key. The secret is never
printed by the workflow. Without that secret, the workflow still checks that the
metered route rejects requests without an API key, and reports the authenticated
check as skipped.

Until the correct Vercel project and domain are linked, leave
`A3_PRODUCTION_BASE_URL` unset. The workflow reports the production checks as
skipped rather than failing against an assumed hostname or falsely claiming that
production has been verified.

## Required server environment

Set these variables in the Vercel project for Preview and Production:

- \`SUPABASE_URL\` (or the existing \`NEXT_PUBLIC_SUPABASE_URL\`)
- \`SUPABASE_SERVICE_ROLE_KEY\`
- \`A3_API_KEY_PEPPER\`
- \`A3_API_KEY_ENCRYPTION_KEY\`
- \`A3_INTERNAL_ROUTE_SECRET\`
- \`STRIPE_SECRET_KEY\`
- \`STRIPE_WEBHOOK_SECRET\`
- \`STRIPE_PRO_PRICE_ID\`
- \`RESEND_API_KEY\`
- \`A3_API_FROM_EMAIL\`

Generate independent application secrets. Do not reuse one value for multiple variables:

\`\`\`bash
openssl rand -hex 32
openssl rand -base64 32
openssl rand -hex 32
\`\`\`

Use the three outputs for \`A3_API_KEY_PEPPER\`, \`A3_API_KEY_ENCRYPTION_KEY\` and \`A3_INTERNAL_ROUTE_SECRET\`, respectively. The encryption key must decode from base64 to exactly 32 bytes.

## Database

Apply \`supabase/migrations/20261121_api_keys_metering.sql\` to the A³ Supabase project. It creates the API key table, the row-locked quota-consumption function, and idempotent key-provisioning/delivery functions. The \`api_keys\` table is not accessible to \`anon\` or \`authenticated\`; application access is through the server-only service role.

Do not point the A³ environment at the CX Switch Supabase project.

## Free beta keys

After the migration and server environment are configured, issue a Free key from a trusted developer terminal:

\`\`\`bash
node --experimental-strip-types scripts/create-api-key.ts beta@example.com free
\`\`\`

A Pro key can be manually issued with the \`pro\` tier argument for internal testing. The script prints the raw key once; the database stores only its HMAC hash. Do not paste live keys into source control or chat.

## Stripe

Configure the Stripe webhook URL as:

\`\`\`
https://YOUR-CONFIRMED-PRODUCTION-DOMAIN/api/webhooks/stripe
\`\`\`

Subscribe to:

- \`checkout.session.completed\`
- \`checkout.session.async_payment_succeeded\`
- \`customer.subscription.updated\`
- \`customer.subscription.deleted\`

The Checkout flow must create a subscription session for the configured \`STRIPE_PRO_PRICE_ID\`. For an authenticated Supabase customer, set the signed-in user's UUID in Checkout Session metadata as \`user_id\`; the webhook checks that the account exists and that its email matches the Stripe customer email before associating the key.

The webhook sends the raw API key using Resend. It stores an encrypted copy only until successful delivery, then clears that copy. Resend idempotency protects retries of the same delivery.

## Smoke tests

\`\`\`bash
# Public market-cycle data; ath and drawdownPct may be null if the provider fails.
BASE_URL="https://YOUR-CONFIRMED-PRODUCTION-DOMAIN"
curl -sS "$BASE_URL/api/market-cycle" | jq

# Distinct candle intervals; compare each timeframe's price and RSI.
curl -sS "$BASE_URL/api/comprehensive-analysis?symbol=BTC" \
  | jq '.multiTimeframe'

# A customer API request without a key must fail with 401.
curl -i "$BASE_URL/api/v1/intelligence?symbol=BTC"

# A test Free or Pro key should succeed and return quota headers.
curl -i -H "Authorization: Bearer a3_live_YOUR_TEST_KEY" \
  "$BASE_URL/api/v1/intelligence?symbol=BTC"
\`\`\`

Run \`pnpm test\`, \`pnpm exec tsc --noEmit\`, and \`pnpm build\` before promoting the feature branch.
