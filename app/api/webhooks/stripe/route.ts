import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto"
import { NextResponse } from "next/server"
import { hashApiKey } from "@/lib/auth/api-key"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type StripeEvent = {
  id: string
  type: string
  data: { object: Record<string, unknown> }
}

type DeliveryClaim = {
  delivery_state: "claimed" | "delivered" | "busy" | "missing"
  id: string | null
  customer_email: string | null
  key_ciphertext: string | null
  key_iv: string | null
  key_auth_tag: string | null
}

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error("Missing environment variable: " + name)
  return value
}

function supabaseConfig() {
  const baseUrl =
    process.env.SUPABASE_URL?.trim() ||
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL")

  return {
    url: baseUrl.replace(/\/$/, ""),
    serviceKey: requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
  }
}

function supabaseHeaders(prefer?: string): HeadersInit {
  const { serviceKey } = supabaseConfig()

  return {
    apikey: serviceKey,
    Authorization: "Bearer " + serviceKey,
    "Content-Type": "application/json",
    ...(prefer ? { Prefer: prefer } : {}),
  }
}

function verifyStripeSignature(
  body: string,
  signatureHeader: string,
  secret: string
): boolean {
  const parts = signatureHeader.split(",")
  const timestampPart = parts.find((part) => part.startsWith("t="))
  const signatures = parts
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3))

  if (!timestampPart || signatures.length === 0) return false

  const timestamp = Number(timestampPart.slice(2))
  if (!Number.isFinite(timestamp)) return false

  // Reject replayed webhook payloads outside Stripe's five-minute window.
  if (Math.abs(Date.now() / 1000 - timestamp) > 300) return false

  const expected = createHmac("sha256", secret)
    .update(String(timestamp) + "." + body, "utf8")
    .digest()

  return signatures.some((signature) => {
    if (!/^[0-9a-f]{64}$/i.test(signature)) return false

    const supplied = Buffer.from(signature, "hex")
    return (
      supplied.length === expected.length &&
      timingSafeEqual(supplied, expected)
    )
  })
}

async function stripeGet(path: string): Promise<any> {
  const secret = requiredEnv("STRIPE_SECRET_KEY")

  const response = await fetch("https://api.stripe.com" + path, {
    headers: {
      Authorization: "Bearer " + secret,
    },
    cache: "no-store",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      "Stripe API request failed: " +
        response.status +
        " " +
        String(data?.error?.message ?? "")
    )
  }

  return data
}

function getEncryptionKey(): Buffer {
  const key = Buffer.from(
    requiredEnv("A3_API_KEY_ENCRYPTION_KEY"),
    "base64"
  )

  if (key.length !== 32) {
    throw new Error("A3_API_KEY_ENCRYPTION_KEY must decode to 32 bytes")
  }

  return key
}

function encryptApiKey(apiKey: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv)

  const ciphertext = Buffer.concat([
    cipher.update(apiKey, "utf8"),
    cipher.final(),
  ])

  return {
    key_ciphertext: ciphertext.toString("base64"),
    key_iv: iv.toString("base64"),
    key_auth_tag: cipher.getAuthTag().toString("base64"),
  }
}

function decryptApiKey(
  ciphertext: string,
  iv: string,
  authTag: string
): string {
  const decipher = createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(iv, "base64")
  )

  decipher.setAuthTag(Buffer.from(authTag, "base64"))

  return Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64")),
    decipher.final(),
  ]).toString("utf8")
}

async function resolveUserId(
  candidate: unknown,
  email: string
): Promise<string | null> {
  if (
    typeof candidate !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(candidate)
  ) {
    return null
  }

  const { url, serviceKey } = supabaseConfig()
  const response = await fetch(
    url + "/auth/v1/admin/users/" + encodeURIComponent(candidate),
    {
      headers: {
        apikey: serviceKey,
        Authorization: "Bearer " + serviceKey,
      },
      cache: "no-store",
    }
  )

  if (!response.ok) return null

  const user = await response.json()

  return typeof user.email === "string" &&
    user.email.toLowerCase() === email.toLowerCase()
    ? candidate
    : null
}

async function updateSubscriptionTier(
  subscriptionId: string,
  active: boolean
) {
  const { url } = supabaseConfig()
  const response = await fetch(
    url +
      "/rest/v1/api_keys?stripe_subscription_id=eq." +
      encodeURIComponent(subscriptionId),
    {
      method: "PATCH",
      headers: supabaseHeaders(),
      body: JSON.stringify({ tier: active ? "pro" : "free" }),
    }
  )

  if (!response.ok) {
    throw new Error("Subscription tier update failed: " + response.status)
  }
}

async function sendApiKeyEmail(email: string, apiKey: string, sessionId: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + requiredEnv("RESEND_API_KEY"),
      "Content-Type": "application/json",
      "Idempotency-Key": "a3-api-key-" + sessionId,
    },
    body: JSON.stringify({
      from: requiredEnv("A3_API_FROM_EMAIL"),
      to: [email],
      subject: "Your A³ Markets API key",
      text: [
        "Your A³ Markets Pro API key is ready.",
        "",
        apiKey,
        "",
        "Keep this key private. It will not be shown again.",
        "Use it in the Authorization header:",
        "Authorization: Bearer YOUR_API_KEY",
      ].join("\n"),
    }),
  })

  if (!response.ok) {
    throw new Error("API key email delivery failed: " + response.status)
  }
}

async function processCheckout(session: Record<string, any>) {
  if (
    session.mode !== "subscription" ||
    session.status !== "complete" ||
    !["paid", "no_payment_required"].includes(session.payment_status)
  ) {
    return
  }

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id

  if (typeof subscriptionId !== "string") {
    throw new Error("Checkout Session has no subscription")
  }

  const subscription = await stripeGet(
    "/v1/subscriptions/" + encodeURIComponent(subscriptionId)
  )

  if (!["active", "trialing"].includes(subscription.status)) {
    return
  }

  const proPriceId = requiredEnv("STRIPE_PRO_PRICE_ID")
  const lineItems = await stripeGet(
    "/v1/checkout/sessions/" +
      encodeURIComponent(String(session.id)) +
      "/line_items?limit=100"
  )

  const hasProPrice = Array.isArray(lineItems.data) &&
    lineItems.data.some(
      (item: any) => item.price?.id === proPriceId
    )

  if (!hasProPrice) return

  const email =
    session.customer_details?.email ??
    session.customer_email

  if (typeof email !== "string" || !email.includes("@")) {
    throw new Error("Checkout Session has no valid customer email")
  }

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id ?? null

  const userId = await resolveUserId(
    session.metadata?.user_id ?? session.client_reference_id,
    email
  )

  const { url } = supabaseConfig()
  const rawApiKey =
    "a3_live_" + randomBytes(32).toString("base64url")
  const encrypted = encryptApiKey(rawApiKey)

  const provisionResponse = await fetch(
    url + "/rest/v1/rpc/provision_api_key_for_checkout",
    {
      method: "POST",
      headers: supabaseHeaders(),
      body: JSON.stringify({
        p_user_id: userId,
        p_customer_email: email,
        p_key_hash: hashApiKey(rawApiKey),
        p_tier: "pro",
        p_stripe_customer_id: customerId,
        p_stripe_subscription_id: subscriptionId,
        p_stripe_checkout_session_id: session.id,
        p_key_ciphertext: encrypted.key_ciphertext,
        p_key_iv: encrypted.key_iv,
        p_key_auth_tag: encrypted.key_auth_tag,
      }),
      cache: "no-store",
    }
  )

  if (!provisionResponse.ok) {
    throw new Error(
      "API key provisioning failed: " + provisionResponse.status
    )
  }

  const provisioned = await provisionResponse.json()
  if (!Array.isArray(provisioned) || !provisioned[0]) {
    throw new Error("API key provisioning returned no record")
  }

  const claimResponse = await fetch(
    url + "/rest/v1/rpc/claim_api_key_delivery",
    {
      method: "POST",
      headers: supabaseHeaders(),
      body: JSON.stringify({
        p_checkout_session_id: session.id,
      }),
      cache: "no-store",
    }
  )

  if (!claimResponse.ok) {
    throw new Error("API key delivery claim failed: " + claimResponse.status)
  }

  const claims = (await claimResponse.json()) as DeliveryClaim[]
  const claim = claims[0]

  if (!claim) throw new Error("API key delivery claim returned no record")
  if (claim.delivery_state === "delivered") return

  if (claim.delivery_state !== "claimed") {
    throw new Error("API key delivery state: " + claim.delivery_state)
  }

  if (
    !claim.id ||
    !claim.customer_email ||
    !claim.key_ciphertext ||
    !claim.key_iv ||
    !claim.key_auth_tag
  ) {
    throw new Error("API key delivery record is incomplete")
  }

  const key = decryptApiKey(
    claim.key_ciphertext,
    claim.key_iv,
    claim.key_auth_tag
  )

  await sendApiKeyEmail(claim.customer_email, key, String(session.id))

  const markDelivered = await fetch(
    url + "/rest/v1/api_keys?id=eq." + encodeURIComponent(claim.id),
    {
      method: "PATCH",
      headers: supabaseHeaders(),
      body: JSON.stringify({
        key_ciphertext: null,
        key_iv: null,
        key_auth_tag: null,
        key_delivery_claimed_at: null,
        key_delivered_at: new Date().toISOString(),
      }),
      cache: "no-store",
    }
  )

  if (!markDelivered.ok) {
    throw new Error(
      "Could not mark API key delivered: " + markDelivered.status
    )
  }
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature")
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured" },
      { status: 503 }
    )
  }

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 }
    )
  }

  let event: StripeEvent

  try {
    const body = await request.text()

    if (
      !verifyStripeSignature(
        body,
        signature,
        webhookSecret
      )
    ) {
      return NextResponse.json(
        { error: "Invalid Stripe webhook signature" },
        { status: 400 }
      )
    }

    event = JSON.parse(body) as StripeEvent
  } catch (error) {
    console.error(
      "Stripe webhook verification failed:",
      error instanceof Error ? error.message : "unknown error"
    )

    return NextResponse.json(
      { error: "Invalid Stripe webhook" },
      { status: 400 }
    )
  }

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      await processCheckout(event.data.object)
    } else if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object
      const active =
        event.type !== "customer.subscription.deleted" &&
        ["active", "trialing"].includes(String(subscription.status))

      await updateSubscriptionTier(String(subscription.id), active)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error(
      "Stripe webhook processing failed:",
      error instanceof Error ? error.message : "unknown error"
    )

    // Return 5xx so Stripe retries. Provisioning is idempotent per Session.
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}
