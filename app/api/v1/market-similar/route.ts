import { NextRequest, NextResponse } from "next/server"
import { buildMarketState } from "../../../../lib/market-state/build-market-state"
import { getSimilarMarketStates } from "../../../../lib/market-state/persistence"
import type { OHLCVBar } from "../../../../lib/market-state/types"

export async function GET(req: NextRequest) {
  try {
    const symbol = req.nextUrl.searchParams.get("symbol")?.toUpperCase()
    if (!symbol) return NextResponse.json({ error: "symbol is required" }, { status: 400 })
    const url = new URL("/api/market-history", req.url)
    url.searchParams.set("symbol", symbol); url.searchParams.set("interval", "1h"); url.searchParams.set("days", "7")
    const response = await fetch(url, { cache: "no-store" }); const data = await response.json()
    if (!response.ok || !Array.isArray(data.bars)) return NextResponse.json(data, { status: response.status || 503 })
    const bars = data.bars as OHLCVBar[]
    if (bars.length < 30) return NextResponse.json({ error: "Insufficient historical market data" }, { status: 503 })
    const latest = bars.at(-1)!; const first = bars.at(-25) ?? bars[0]
    const state = buildMarketState(symbol, bars, ((latest.close - first.close) / first.close) * 100, bars.slice(-24).reduce((s, b) => s + b.volume, 0))
    const matches = await getSimilarMarketStates(state, "1h", 25)
    return NextResponse.json({ symbol, currentState: state, matches, count: matches.length })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Similarity search failed" }, { status: 500 }) }
}
