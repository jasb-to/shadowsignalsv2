import { NextRequest, NextResponse } from "next/server"
import { buildMarketState } from "@/lib/market-state"

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.toUpperCase()
  if (!symbol) return NextResponse.json({ error: "symbol is required" }, { status: 400 })

  // V1 endpoint: currently builds from the latest market-data response.
  // Historical OHLCV ingestion will be wired here next; the canonical response shape is stable.
  const response = await fetch(new URL(`/api/market-data?symbol=${encodeURIComponent(symbol)}`, req.url), { cache: "no-store" })
  const data = await response.json()
  if (!response.ok || typeof data.price !== "number") return NextResponse.json({ error: "Market data unavailable" }, { status: 503 })

  // Until OHLCV history is connected, return a transparent availability response rather than inventing indicators.
  return NextResponse.json({
    symbol,
    price: data.price,
    change24h: data.change24h ?? 0,
    volume24h: data.volume24h ?? 0,
    stateEngine: "ready",
    indicators: "requires_ohlcv_history",
    source: data.source,
    timestamp: Date.now(),
  })
}
