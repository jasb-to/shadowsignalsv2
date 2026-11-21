import { timingSafeEqual } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"

import { decide } from "@/lib/intelligence/decision-engine"
import { runCalibratedA3Pipeline } from "@/lib/intelligence/engine-pipeline"
import { persistForecast } from "@/lib/intelligence/forecast-store"
import { runCrossAsset } from "@/lib/intelligence/cross-asset"
import { runDerivativesEngine } from "@/lib/intelligence/derivatives-engine"
import { runDivergenceEngine } from "@/lib/intelligence/divergence-engine"
import { runCycleEngine } from "@/lib/intelligence/cycle-engine"
import { buildFlowSnapshot } from "@/lib/intelligence/flows"
import { detectRegimeTransition } from "@/lib/intelligence/regime-transition"
import { numeric } from "@/lib/utils"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const clamp = (value: number) =>
  Math.max(0, Math.min(100, Math.round(value)))

const n = numeric

function isTrustedInternalCall(request: NextRequest): boolean {
  const expected = process.env.A3_INTERNAL_ROUTE_SECRET
  const supplied = request.headers.get("x-a3-internal-call")

  if (!expected || !supplied) return false

  const expectedBuffer = Buffer.from(expected)
  const suppliedBuffer = Buffer.from(supplied)

  return (
    expectedBuffer.length === suppliedBuffer.length &&
    timingSafeEqual(expectedBuffer, suppliedBuffer)
  )
}

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol")?.trim().toUpperCase()

  if (!symbol) {
    return NextResponse.json(
      { error: "Symbol is required" },
      { status: 400 }
    )
  }

  try {
    const analysisUrl = new URL("/api/comprehensive-analysis", request.url)
    analysisUrl.searchParams.set("symbol", symbol)
    analysisUrl.searchParams.set("interval", "1h")

    const cycleUrl = new URL("/api/market-cycle", request.url)
    const crossAssetUrl = new URL("/api/v1/cross-asset", request.url)

    const [analysisResponse, cycleResponse, crossAssetResponse] =
      await Promise.all([
        fetch(analysisUrl, { cache: "no-store" }),
        fetch(cycleUrl, { cache: "no-store" }),
        fetch(crossAssetUrl, { cache: "no-store" }),
      ])

    const [analysis, cycleData, crossData] = await Promise.all([
      analysisResponse.json(),
      cycleResponse.ok ? cycleResponse.json() : Promise.resolve({}),
      crossAssetResponse.ok ? crossAssetResponse.json() : Promise.resolve({}),
    ])

    if (!analysisResponse.ok) {
      return NextResponse.json(analysis, {
        status: analysisResponse.status,
      })
    }

    const price = n(analysis.currentPrice)

    if (price === null || price <= 0) {
      return NextResponse.json(
        { error: "Market price unavailable" },
        { status: 503 }
      )
    }

    const change = n(analysis.change24h)
    const rsi = n(analysis.technicalIndicators?.rsi)
    const btcDominance =
      n(cycleData.altseason?.btcDominance) ??
      n(crossData.inputs?.btcDominance)
    const ethBtc = n(cycleData.altseason?.ethBtcRatio)

    const tactical = clamp(n(analysis.signalStrength) ?? 50)

    const trend = String(analysis.marketState?.trend ?? "").toLowerCase()
    const macd = String(analysis.indicators?.macd ?? "").toLowerCase()

    const strategic = clamp(
      50 +
        (trend.includes("up") || trend.includes("bull")
          ? 20
          : trend.includes("down") || trend.includes("bear")
            ? -20
            : 0) +
        (macd.includes("bull") ? 10 : macd.includes("bear") ? -10 : 0)
    )

    const derivatives = runDerivativesEngine({
      fundingRate: n(analysis.derivatives?.fundingRate),
      openInterestChangePct: n(analysis.derivatives?.openInterestChangePct),
      longShortRatio: n(analysis.derivatives?.longShortRatio),
      liquidationsUsd: n(analysis.derivatives?.liquidationsUsd),
      priceChangePct: change,
    })

    const rawCross = crossData.crossAsset ?? runCrossAsset({
      btcReturn: n(crossData.inputs?.btcReturn),
      ethReturn: n(crossData.inputs?.ethReturn),
      btcDominance: n(crossData.inputs?.btcDominance),
      ethBtcReturn: n(crossData.inputs?.ethBtcReturn),
      goldReturn: n(crossData.inputs?.goldReturn),
      dxyReturn: n(crossData.inputs?.dxyReturn),
      spxReturn: n(crossData.inputs?.spxReturn),
      nasdaqReturn: n(crossData.inputs?.nasdaqReturn),
    })
    const cross = rawCross.regime === "unavailable" ? null : rawCross

    const btcPrice = n(cycleData.bullMarket?.currentPrice)
    const currentAth = n(cycleData.bullMarket?.ath)
    const currentDrawdown = n(cycleData.bullMarket?.drawdownPct)

    // The strategic cycle is BTC-led; do not compare an altcoin price
    // against Bitcoin's ATH.
    const cycle = runCycleEngine({
      price: btcPrice,
      ath: currentAth,
      drawdownPct: currentDrawdown,
      rsi: symbol === "BTC" ? rsi : null,
      btcDominance,
      ethBtc,
    })

    const divergence = runDivergenceEngine({
      priceChangePct: change,
      volumeChangePct: n(analysis.volumeChangePct),
      momentumChange: n(analysis.momentumChange),
      fundingRate: n(analysis.derivatives?.fundingRate),
      openInterestChangePct: n(analysis.derivatives?.openInterestChangePct),
      breadthChange: n(crossData.breadthChangePct),
    })

    const volume =
      n(analysis.volume24h) ?? n(analysis.volume)
    const previousVolume =
      n(analysis.previousVolume24h) ?? n(analysis.previousVolume)

    const suppliedFlow = analysis.flow
    const flow =
      suppliedFlow &&
      n(suppliedFlow.volumeChangePct) !== null
        ? suppliedFlow
        : volume !== null &&
            previousVolume !== null &&
            change !== null
          ? buildFlowSnapshot(symbol, volume, previousVolume, change)
          : {
              symbol,
              volume24h: volume,
              volumeChangePct: null,
              priceChangePct: change,
              volumePriceDivergence: "neutral" as const,
              source: "unavailable",
              timestamp: Date.now(),
            }

    const flowScore = clamp(
      50 +
        (flow.volumePriceDivergence === "bullish"
          ? 20
          : flow.volumePriceDivergence === "bearish"
            ? -20
            : 0) +
        (flow.volumeChangePct !== null
          ? Math.max(-15, Math.min(15, flow.volumeChangePct / 4))
          : 0)
    )

    const market = {
      ...analysis.marketState,
      symbol,
      price,
      indicators: {
        rsi,
        macd: n(analysis.marketState?.indicators?.macd),
        macdSignal: n(analysis.marketState?.indicators?.macdSignal),
        ema8: n(analysis.marketState?.indicators?.ema8),
        ema21: n(analysis.marketState?.indicators?.ema21),
        stochasticRsi: n(analysis.marketState?.indicators?.stochasticRsi),
        atr: n(analysis.marketState?.indicators?.atr),
        volatility: n(analysis.marketState?.indicators?.volatility),
      },
    }

    const cycleScore = cycle.score
    const breadth = clamp(n(crossData.breadthScore) ?? 50)
    const risk = clamp(65 - (n(cycleData.bullMarket?.topRiskScore) ?? 0))

    const transition = detectRegimeTransition({
      regime: cycle.phase,
      priceChangePct: change,
      volumeChangePct: n(flow.volumeChangePct),
      rsi,
      btcDominance,
      ethBtc,
      cycleScore,
    })

    const pipeline = await runCalibratedA3Pipeline(
      market,
      {
        derivatives: analysis.derivatives || null,
        derivativesResult: derivatives,
        flow,
        historical: analysis.historical || null,
        crossAsset: cross,
        breadthScore: breadth,
        cycleScore,
        strategicScore: strategic,
        flowScore,
        transitionScore: transition.score,
        cycle,
        divergence,
        transition,
      },
      "1d"
    )

    const decision = decide({
      tacticalScore: tactical,
      strategicScore: strategic,
      cycleScore,
      breadthScore: breadth,
      riskScore: risk,
    })

    await persistForecast(pipeline.forecast, price).catch((error) =>
      console.error("Forecast persistence failed", error)
    )

    const payload = {
      symbol,
      price,
      change24h: change,
      thesis: decision.thesis,
      score: pipeline.intelligence.score,
      confidence: pipeline.intelligence.confidence,
      signal: pipeline.intelligence.signal,
      drivers: pipeline.intelligence.evidence,
      regime: pipeline.intelligence.regime,
      cycle: {
        phase: cycle.phase,
        ath: currentAth,
        athDate: cycleData.bullMarket?.athDate ?? null,
        drawdownPct: currentDrawdown,
        priorTop: cycleData.bullMarket?.priorTop ?? null,
        nextTop: cycleData.bullMarket?.estimatedTop ?? null,
        bottomWindow: cycleData.bearMarket?.bottomWindow ?? null,
        bottomProbability: cycle.bottomProbability,
        topProbability: cycle.topProbability,
      },
      transition,
      flow: {
        volume24h: flow.volume24h,
        volumeChangePct: flow.volumeChangePct,
        volumePriceDivergence: flow.volumePriceDivergence,
        score: flowScore,
      },
      market: {
        rsi,
        trend: analysis.marketState?.trend ?? null,
        macd: analysis.indicators?.macd ?? null,
        support: n(analysis.technicalIndicators?.support),
        resistance: n(analysis.technicalIndicators?.resistance),
        bullTopRisk: n(cycleData.bullMarket?.topRiskScore),
        breadthScore: breadth,
        derivativesRisk: derivatives.leverageRisk,
        crowding: derivatives.crowding,
        crossAssetRegime: cross?.regime ?? "unavailable",
      },
      dataQuality: {
        marketTimeframes: analysis.multiTimeframeQuality ?? null,
        crossAsset: crossData.dataQuality ?? null,
        pipeline: pipeline.intelligence.dataQuality,
      },
      engine: {
        score: pipeline.intelligence.score,
        confidence: pipeline.intelligence.confidence,
        rawConfidence: pipeline.forecast.engineConfidence,
        calibrationSampleSize: pipeline.forecast.calibrationSampleSize,
        scenario: pipeline.forecast.scenario,
      },
      source: analysis.source || "a3-engine",
      generatedAt: new Date().toISOString(),
    }

    if (isTrustedInternalCall(request)) {
      return NextResponse.json(payload, {
        headers: { "Cache-Control": "no-store" },
      })
    }

    // Public dashboard summary. Paid API consumers use /api/v1/intelligence.
    return NextResponse.json(
      {
        symbol: payload.symbol,
        price: payload.price,
        thesis: payload.thesis,
        score: payload.score,
        confidence: payload.confidence,
        signal: payload.signal,
        drivers: payload.drivers,
        regime: payload.regime,
        cycle: {
          phase: payload.cycle.phase,
          priorTop: payload.cycle.priorTop,
          nextTop: payload.cycle.nextTop,
        },
        market: {
          rsi: payload.market.rsi,
          trend: payload.market.trend,
          support: payload.market.support,
          resistance: payload.market.resistance,
        },
        generatedAt: payload.generatedAt,
      },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch (error) {
    console.error("Intelligence API error:", error)

    return NextResponse.json(
      { error: "Unable to generate intelligence" },
      { status: 500 }
    )
  }
}
