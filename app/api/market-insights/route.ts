import { type NextRequest, NextResponse } from "next/server"
import { buildMarketState, type OHLCVBar } from "@/lib/market-state"

export async function POST(req: NextRequest) {
  try {
    const { symbol, timeframe } = await req.json()
    if (!symbol) return NextResponse.json({ error: "Symbol is required" }, { status: 400 })

    const historyUrl = new URL("/api/market-history", req.url)
    historyUrl.searchParams.set("symbol", String(symbol).toUpperCase())
    historyUrl.searchParams.set("interval", timeframe === "1d" || timeframe === "daily" ? "1d" : "1h")
    historyUrl.searchParams.set("days", "7")
    const response = await fetch(historyUrl, { cache: "no-store" })
    const data = await response.json()
    if (!response.ok || !Array.isArray(data.bars)) return NextResponse.json(data, { status: response.status || 503 })

    const bars = data.bars as OHLCVBar[]
    if (bars.length < 30) return NextResponse.json({ error: "Insufficient historical market data" }, { status: 503 })
    const latest = bars.at(-1)!
    const first = bars.at(-25) ?? bars[0]
    const state = buildMarketState(String(symbol), bars, ((latest.close - first.close) / first.close) * 100, bars.slice(-24).reduce((s, b) => s + b.volume, 0))

    const insights = [
      `Regime: ${state.regime.replaceAll("_", " ")}.`,
      `Trend: ${state.trend}; momentum: ${state.momentum.toFixed(0)}/100; volatility: ${state.volatility.toFixed(1)}% annualised.`,
      `Evidence: ${state.evidence.join("; ")}.`,
      `Key levels: support ${state.supportResistance.support1?.toFixed(2) ?? "n/a"}, resistance ${state.supportResistance.resistance1?.toFixed(2) ?? "n/a"}.`,
      `Invalidation: ${state.invalidation}.`,
    ].join(" ")

    return NextResponse.json({ symbol: state.symbol, timeframe: timeframe || "daily", insights, marketState: state, timestamp: Date.now(), disclaimer: "This analysis is for educational purposes only. Not financial advice." })
  } catch (error) {
    console.error("Market insights error:", error)
    return NextResponse.json({ error: "Failed to generate market insights" }, { status: 500 })
  }
}
