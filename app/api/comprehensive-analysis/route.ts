import { type NextRequest, NextResponse } from "next/server"
import { buildMarketState, type OHLCVBar } from "@/lib/market-state"

export async function GET(req: NextRequest) {
  try {
    const symbol = req.nextUrl.searchParams.get("symbol")?.toUpperCase()
    const interval = req.nextUrl.searchParams.get("interval") || "1h"
    if (!symbol) return NextResponse.json({ error: "Symbol is required" }, { status: 400 })

    const historyUrl = new URL("/api/market-history", req.url)
    historyUrl.searchParams.set("symbol", symbol)
    historyUrl.searchParams.set("interval", interval)
    historyUrl.searchParams.set("days", "7")
    const response = await fetch(historyUrl, { cache: "no-store" })
    const data = await response.json()
    if (!response.ok || !Array.isArray(data.bars)) return NextResponse.json(data, { status: response.status || 503 })

    const bars = data.bars as OHLCVBar[]
    if (bars.length < 30) return NextResponse.json({ error: "Insufficient historical market data" }, { status: 503 })

    const latest = bars.at(-1)!
    const first24 = bars.at(-25) ?? bars[0]
    const change24h = ((latest.close - first24.close) / first24.close) * 100
    const volume24h = bars.slice(-24).reduce((sum, bar) => sum + bar.volume, 0)
    const state = buildMarketState(symbol, bars, change24h, volume24h)

    const confidence = state.confidence
    const timeframeSignal = state.signal
    const momentum = Math.round(state.momentum)
    const indicators = state.evidence

    return NextResponse.json({
      symbol: state.symbol,
      currentPrice: state.price,
      change24h: state.change24h,
      timeframes: {
        "1-4h": {
          signal: timeframeSignal,
          confidence: Math.max(0, confidence - 5),
          momentumScore: momentum,
          support: state.supportResistance.support1,
          resistance: state.supportResistance.resistance1,
          alignedIndicators: indicators,
          conflictingSignals: [],
          summary: `${timeframeSignal} signal based on deterministic market state. ${state.regime.replaceAll("_", " ")}.`,
        },
        "4-24h": {
          signal: timeframeSignal,
          confidence,
          momentumScore: momentum,
          support: state.supportResistance.support1,
          resistance: state.supportResistance.resistance1,
          alignedIndicators: indicators,
          conflictingSignals: [],
          summary: `${state.trend} with ${state.momentum.toFixed(0)} momentum and ${state.volatility.toFixed(1)}% annualised volatility.`,
        },
      },
      aiRecommendation: state.signal,
      signalStrength: confidence,
      indicators: {
        rsi: { value: state.indicators.rsi, signal: state.indicators.rsi === null ? "Unavailable" : state.indicators.rsi < 40 ? "Oversold" : state.indicators.rsi > 60 ? "Overbought" : "Neutral" },
        trend: state.trend,
        macd: state.indicators.macd === null || state.indicators.macdSignal === null ? "Unavailable" : state.indicators.macd > state.indicators.macdSignal ? "Bullish" : "Bearish",
      },
      technicalIndicators: {
        rsi: state.indicators.rsi,
        stochasticRsi: state.indicators.stochasticRsi,
        support: state.supportResistance.support1,
        resistance: state.supportResistance.resistance1,
        ema8: state.indicators.ema8,
        ema21: state.indicators.ema21,
        macd: state.indicators.macd,
        macdSignal: state.indicators.macdSignal,
        atr: state.indicators.atr,
        volatility: state.indicators.volatility,
      },
      supportResistance: state.supportResistance,
      marketInsight: `Market regime: ${state.regime.replaceAll("_", " ")}. ${state.evidence.join(". ")}. Invalidation: ${state.invalidation}.`,
      multiTimeframe: {
        "1h": { signal: state.signal, confidence: Math.max(0, confidence - 5) },
        "4h": { signal: state.signal, confidence },
        "1d": { signal: state.signal, confidence },
        "7d": { signal: state.signal, confidence },
        "1m": { signal: state.signal, confidence: Math.max(0, confidence - 10) },
      },
      marketState: state,
      source: data.source,
    })
  } catch (error) {
    console.error("Comprehensive analysis error:", error)
    return NextResponse.json({ error: "Failed to generate comprehensive analysis" }, { status: 500 })
  }
}
