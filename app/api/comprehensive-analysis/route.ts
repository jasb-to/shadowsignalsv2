import { type NextRequest, NextResponse } from "next/server"
import {
  buildMarketState,
  normaliseMarketTimeframe,
  type MarketTimeframe,
  type OHLCVBar,
} from "@/lib/market-state"

const TIMEFRAME_LIMITS: Record<MarketTimeframe, number> = {
  "1h": 200,
  "4h": 200,
  "1d": 200,
  "7d": 104,
  "1m": 60,
}

async function persistState(
  state: ReturnType<typeof buildMarketState>,
  timeframe: string
): Promise<boolean> {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) return false

  try {
    const response = await fetch(url.replace(/\/$/, "") + "/rest/v1/market_states", {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: "Bearer " + key,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        symbol: state.symbol,
        timeframe,
        captured_at: new Date(state.timestamp).toISOString(),
        price: state.price,
        change_24h: state.change24h,
        trend: state.trend,
        regime: state.regime,
        momentum: state.momentum,
        volatility: state.volatility,
        signal: state.signal,
        confidence: state.confidence,
        indicators: state.indicators,
        support_resistance: state.supportResistance,
        evidence: state.evidence,
        invalidation: state.invalidation,
        source: "market-state-engine",
      }),
      cache: "no-store",
    })

    return response.ok
  } catch {
    return false
  }
}

async function fetchBars(
  requestUrl: string,
  symbol: string,
  timeframe: MarketTimeframe
): Promise<{ bars: OHLCVBar[]; source: string }> {
  const url = new URL("/api/market-history", requestUrl)
  url.searchParams.set("symbol", symbol)
  url.searchParams.set("interval", timeframe)
  url.searchParams.set("limit", String(TIMEFRAME_LIMITS[timeframe]))

  const response = await fetch(url, { cache: "no-store" })
  const data = await response.json()

  if (!response.ok || !Array.isArray(data.bars)) {
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "Market history unavailable for " + timeframe
    )
  }

  if (data.bars.length < 30) {
    throw new Error("Insufficient bars for " + timeframe)
  }

  return {
    bars: data.bars as OHLCVBar[],
    source: typeof data.source === "string" ? data.source : "unknown",
  }
}

function changeForBars(
  bars: OHLCVBar[],
  timeframe: MarketTimeframe
): number {
  const lookback =
    timeframe === "1h"
      ? 24
      : timeframe === "4h"
        ? 6
        : 1

  if (timeframe === "7d" || timeframe === "1m") return 0

  const previous = bars.at(-(lookback + 1)) ?? bars[0]
  const latest = bars.at(-1)!

  return previous.close > 0
    ? ((latest.close - previous.close) / previous.close) * 100
    : 0
}

function volumeForBars(
  bars: OHLCVBar[],
  timeframe: MarketTimeframe
): number {
  const count =
    timeframe === "1h"
      ? 24
      : timeframe === "4h"
        ? 6
        : 1

  if (timeframe === "7d" || timeframe === "1m") return 0

  return bars.slice(-count).reduce((sum, bar) => sum + bar.volume, 0)
}

function timeframeSnapshot(
  symbol: string,
  timeframe: MarketTimeframe,
  bars: OHLCVBar[],
  source: string
) {
  const state = buildMarketState(
    symbol,
    bars,
    changeForBars(bars, timeframe),
    volumeForBars(bars, timeframe),
    timeframe
  )

  return {
    available: true,
    timeframe,
    price: state.price,
    rsi: state.indicators.rsi,
    signal: state.signal,
    confidence: state.confidence,
    volatility: state.indicators.volatility,
    trend: state.trend,
    regime: state.regime,
    // The candle timestamp is the actual completed observation time;
    // state.timestamp is only the time this API calculation ran.
    lastCandleTimestamp: bars.at(-1)?.timestamp ?? null,
    timestamp: state.timestamp,
    source,
    barCount: bars.length,
  }
}

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const rawSymbol = req.nextUrl.searchParams.get("symbol")
  if (!rawSymbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
  }

  const symbol = rawSymbol.trim().toUpperCase()
  const requestedInterval = normaliseMarketTimeframe(
    req.nextUrl.searchParams.get("interval") || "1h"
  )

  try {
    // Each timeframe is fetched independently; no candle series is reused
    // to manufacture a different timeframe signal.
    const timeframeResults = await Promise.all(
      (Object.keys(TIMEFRAME_LIMITS) as MarketTimeframe[]).map(
        async (timeframe) => {
          try {
            const result = await fetchBars(req.url, symbol, timeframe)
            return {
              timeframe,
              value: timeframeSnapshot(
                symbol,
                timeframe,
                result.bars,
                result.source
              ),
              bars: result.bars,
              source: result.source,
            }
          } catch (error) {
            return {
              timeframe,
              value: {
                available: false,
                timeframe,
                error:
                  error instanceof Error
                    ? error.message
                    : "Timeframe data unavailable",
              },
              bars: null,
              source: "unavailable",
            }
          }
        }
      )
    )

    const selected = timeframeResults.find(
      (result) => result.timeframe === requestedInterval
    )

    if (!selected?.bars || selected.bars.length < 30) {
      return NextResponse.json(
        { error: "Requested timeframe market data unavailable", symbol, timeframe: requestedInterval },
        { status: 503 }
      )
    }

    const bars = selected.bars
    const change24h = changeForBars(bars, requestedInterval)
    const volume24h = volumeForBars(bars, requestedInterval)

    const state = buildMarketState(
      symbol,
      bars,
      change24h,
      volume24h,
      requestedInterval
    )

    const persisted = await persistState(state, requestedInterval)

    const multiTimeframe = Object.fromEntries(
      timeframeResults.map((result) => [result.timeframe, result.value])
    )

    const availableTimeframes = timeframeResults.filter(
      (result) => result.bars !== null
    ).length

    return NextResponse.json({
      symbol: state.symbol,
      currentPrice: state.price,
      change24h: state.change24h,
      aiRecommendation: state.signal,
      signalStrength: state.confidence,
      indicators: {
        rsi: {
          value: state.indicators.rsi,
          signal:
            state.indicators.rsi === null
              ? "Unavailable"
              : state.indicators.rsi < 40
                ? "Oversold"
                : state.indicators.rsi > 60
                  ? "Overbought"
                  : "Neutral",
        },
        trend: state.trend,
        macd:
          state.indicators.macd === null ||
          state.indicators.macdSignal === null
            ? "Unavailable"
            : state.indicators.macd > state.indicators.macdSignal
              ? "Bullish"
              : "Bearish",
      },
      technicalIndicators: {
        ...state.indicators,
        support: state.supportResistance.support1,
        resistance: state.supportResistance.resistance1,
      },
      supportResistance: state.supportResistance,
      marketInsight:
        "Market regime: " +
        state.regime.replaceAll("_", " ") +
        ". " +
        state.evidence.join(". ") +
        ". Invalidation: " +
        state.invalidation +
        ".",
      multiTimeframe,
      multiTimeframeQuality: {
        available: availableTimeframes,
        total: timeframeResults.length,
      },
      marketState: state,
      persistence: { enabled: persisted },
      source: selected.source,
      timeframes: {
        "1-4h": {
          signal: state.signal,
          confidence: Math.max(0, state.confidence - 5),
          momentumScore: Math.round(state.momentum),
          support: state.supportResistance.support1,
          resistance: state.supportResistance.resistance1,
          alignedIndicators: state.evidence,
        },
        "4-24h": {
          signal: state.signal,
          confidence: state.confidence,
          momentumScore: Math.round(state.momentum),
          support: state.supportResistance.support1,
          resistance: state.supportResistance.resistance1,
          alignedIndicators: state.evidence,
        },
      },
    })
  } catch (error) {
    console.error("Comprehensive analysis error:", error)

    return NextResponse.json(
      { error: "Failed to generate comprehensive analysis" },
      { status: 500 }
    )
  }
}
