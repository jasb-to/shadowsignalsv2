import { type NextRequest, NextResponse } from "next/server"
import { buildMarketState, type OHLCVBar } from "@/lib/market-state"

async function persistState(state: ReturnType<typeof buildMarketState>, timeframe: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return false
  try { const r = await fetch(`${url}/rest/v1/market_states`, { method: "POST", headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify({ symbol: state.symbol, timeframe, captured_at: new Date(state.timestamp).toISOString(), price: state.price, change_24h: state.change24h, trend: state.trend, regime: state.regime, momentum: state.momentum, volatility: state.volatility, signal: state.signal, confidence: state.confidence, indicators: state.indicators, support_resistance: state.supportResistance, evidence: state.evidence, invalidation: state.invalidation, source: "market-state-engine" }), cache: "no-store" }); return r.ok } catch { return false }
}

export async function GET(req: NextRequest) {
  try {
    const symbol = req.nextUrl.searchParams.get("symbol")?.toUpperCase(); const interval = req.nextUrl.searchParams.get("interval") || "1h"
    if (!symbol) return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
    const historyUrl = new URL("/api/market-history", req.url); historyUrl.searchParams.set("symbol", symbol); historyUrl.searchParams.set("interval", interval); historyUrl.searchParams.set("days", "7")
    const response = await fetch(historyUrl, { cache: "no-store" }); const data = await response.json()
    if (!response.ok || !Array.isArray(data.bars)) return NextResponse.json(data, { status: response.status || 503 })
    const bars = data.bars as OHLCVBar[]; if (bars.length < 30) return NextResponse.json({ error: `Insufficient historical market data (${bars.length} bars)` }, { status: 503 })
    const latest = bars.at(-1)!; const first24 = bars.at(-25) ?? bars[0]; const change24h = ((latest.close - first24.close) / first24.close) * 100; const volume24h = bars.slice(-24).reduce((sum, bar) => sum + bar.volume, 0)
    const state = buildMarketState(symbol, bars, change24h, volume24h); const persisted = await persistState(state, interval); const confidence = state.confidence; const momentum = Math.round(state.momentum); const indicators = state.evidence
    return NextResponse.json({ symbol: state.symbol, currentPrice: state.price, change24h: state.change24h, aiRecommendation: state.signal, signalStrength: confidence, indicators: { rsi: { value: state.indicators.rsi, signal: state.indicators.rsi === null ? "Unavailable" : state.indicators.rsi < 40 ? "Oversold" : state.indicators.rsi > 60 ? "Overbought" : "Neutral" }, trend: state.trend, macd: state.indicators.macd === null || state.indicators.macdSignal === null ? "Unavailable" : state.indicators.macd > state.indicators.macdSignal ? "Bullish" : "Bearish" }, technicalIndicators: { ...state.indicators, support: state.supportResistance.support1, resistance: state.supportResistance.resistance1 }, supportResistance: state.supportResistance, marketInsight: `Market regime: ${state.regime.replaceAll("_", " ")}. ${state.evidence.join(". ")}. Invalidation: ${state.invalidation}.`, multiTimeframe: { "1h": { signal: state.signal, confidence: Math.max(0, confidence - 5) }, "4h": { signal: state.signal, confidence }, "1d": { signal: state.signal, confidence }, "7d": { signal: state.signal, confidence }, "1m": { signal: state.signal, confidence: Math.max(0, confidence - 10) } }, marketState: state, persistence: { enabled: persisted }, source: data.source, timeframes: { "1-4h": { signal: state.signal, confidence: Math.max(0, confidence - 5), momentumScore: momentum, support: state.supportResistance.support1, resistance: state.supportResistance.resistance1, alignedIndicators: indicators }, "4-24h": { signal: state.signal, confidence, momentumScore: momentum, support: state.supportResistance.support1, resistance: state.supportResistance.resistance1, alignedIndicators: indicators } } })
  } catch (error) { console.error("Comprehensive analysis error:", error); return NextResponse.json({ error: "Failed to generate comprehensive analysis" }, { status: 500 }) }
}
