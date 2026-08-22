import { NextRequest, NextResponse } from "next/server"
import { buildMarketState, recordMarketState, type OHLCVBar } from "@/lib/market-state"

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.toUpperCase()
  const interval = req.nextUrl.searchParams.get("interval") || "1h"
  if (!symbol) return NextResponse.json({ error: "symbol is required" }, { status: 400 })

  const historyUrl = new URL("/api/market-history", req.url)
  historyUrl.searchParams.set("symbol", symbol)
  historyUrl.searchParams.set("interval", interval)
  const response = await fetch(historyUrl, { cache: "no-store" })
  const data = await response.json()
  if (!response.ok || !Array.isArray(data.bars)) return NextResponse.json(data, { status: response.status || 503 })

  const bars = data.bars as OHLCVBar[]
  const latest = bars.at(-1)
  const first24 = bars.at(-25)
  const change24h = latest && first24 ? ((latest.close - first24.close) / first24.close) * 100 : 0
  const volume24h = bars.slice(-24).reduce((sum, bar) => sum + bar.volume, 0)
  const state = buildMarketState(symbol, bars, change24h, volume24h)
  recordMarketState(state)
  return NextResponse.json({ ...state, interval, source: data.source })
}
