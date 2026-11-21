import { NextRequest, NextResponse } from "next/server"
import { authorizeApiKey } from "@/lib/auth/api-key"
import { GET as getPublicIntelligence } from "@/app/api/intelligence/route"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const access = await authorizeApiKey(request)

  if (access.response) return access.response

  const internalSecret = process.env.A3_INTERNAL_ROUTE_SECRET
  if (!internalSecret) {
    return NextResponse.json(
      { error: "Internal API configuration unavailable" },
      { status: 503 }
    )
  }

  const headers = new Headers(request.headers)
  headers.set("x-a3-internal-call", internalSecret)

  const internalRequest = new NextRequest(request.url, {
    method: "GET",
    headers,
  })

  const upstream = await getPublicIntelligence(internalRequest)
  const responseHeaders = new Headers(upstream.headers)

  responseHeaders.set("Cache-Control", "no-store")

  if (access.limit !== undefined) {
    responseHeaders.set("X-RateLimit-Limit", String(access.limit))
    responseHeaders.set(
      "X-RateLimit-Remaining",
      String(access.remaining ?? 0)
    )
  }

  if (access.tier) {
    responseHeaders.set("X-RateLimit-Tier", access.tier)
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  })
}
