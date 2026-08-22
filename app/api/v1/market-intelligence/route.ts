import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const symbol = String(body.symbol || "").toUpperCase()
  if (!symbol) return NextResponse.json({ error: "symbol is required" }, { status: 400 })

  const baseUrl = req.nextUrl.origin
  const stateResponse = await fetch(`${baseUrl}/api/v1/market-state?symbol=${encodeURIComponent(symbol)}`, { cache: "no-store" })
  const state = await stateResponse.json()
  if (!stateResponse.ok) return NextResponse.json(state, { status: stateResponse.status })

  return NextResponse.json({
    symbol,
    question: body.question || null,
    marketState: state,
    interpretation: null,
    status: "quant_state_first",
    message: "Market intelligence will interpret deterministic market state; no unsupported AI conclusion is generated yet.",
    timestamp: Date.now(),
  })
}
