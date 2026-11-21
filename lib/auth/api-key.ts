import { createHmac } from "node:crypto"
import { NextResponse } from "next/server"

interface QuotaRow {
  valid: boolean
  allowed: boolean
  tier: "free" | "pro" | null
  requests_used_today: number
  daily_limit: number
  reset_at: string | null
  user_id: string | null
}

export interface ApiKeyAccess {
  response: NextResponse | null
  tier?: "free" | "pro"
  limit?: number
  remaining?: number
}

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error("Missing environment variable: " + name)
  return value
}

function getSupabaseConfig() {
  const url =
    process.env.SUPABASE_URL?.trim() ||
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL")
  const serviceKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY")

  return {
    url: url.replace(/\/$/, ""),
    serviceKey,
  }
}

export function hashApiKey(apiKey: string): string {
  return createHmac("sha256", requiredEnv("A3_API_KEY_PEPPER"))
    .update(apiKey)
    .digest("hex")
}

export async function authorizeApiKey(
  request: Request
): Promise<ApiKeyAccess> {
  const authorization = request.headers.get("authorization")
  const match = authorization?.match(
    /^Bearer (a3_live_[A-Za-z0-9_-]{43})$/
  )

  if (!match) {
    return {
      response: NextResponse.json(
        { error: "A valid Bearer API key is required" },
        {
          status: 401,
          headers: {
            "WWW-Authenticate": 'Bearer realm="A3 Markets API"',
          },
        }
      ),
    }
  }

  try {
    const { url, serviceKey } = getSupabaseConfig()
    const response = await fetch(
      url + "/rest/v1/rpc/consume_api_key",
      {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: "Bearer " + serviceKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          p_key_hash: hashApiKey(match[1]),
        }),
        cache: "no-store",
      }
    )

    if (!response.ok) {
      throw new Error("Quota RPC failed: " + response.status)
    }

    const rows = (await response.json()) as QuotaRow[]
    const row = rows[0]

    if (!row || row.valid !== true) {
      return {
        response: NextResponse.json(
          { error: "Invalid or revoked API key" },
          { status: 401 }
        ),
      }
    }

    if (row.allowed !== true) {
      const resetAt = row.reset_at
        ? new Date(row.reset_at).getTime()
        : Date.now() + 86400000

      const retryAfter = Math.max(
        1,
        Math.ceil((resetAt - Date.now()) / 1000)
      )

      return {
        response: NextResponse.json(
          {
            error: "Daily API request limit exceeded",
            tier: row.tier,
            limit: row.daily_limit,
            used: row.requests_used_today,
            resetAt: row.reset_at,
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(retryAfter),
              "X-RateLimit-Limit": String(row.daily_limit),
              "X-RateLimit-Remaining": "0",
            },
          }
        ),
      }
    }

    return {
      response: null,
      tier: row.tier ?? undefined,
      limit: row.daily_limit,
      remaining: Math.max(
        0,
        row.daily_limit - row.requests_used_today
      ),
    }
  } catch (error) {
    console.error(
      "API key authorisation failed:",
      error instanceof Error ? error.message : "unknown error"
    )

    return {
      response: NextResponse.json(
        { error: "API authorisation temporarily unavailable" },
        { status: 503 }
      ),
    }
  }
}
