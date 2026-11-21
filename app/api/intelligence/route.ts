import { timingSafeEqual } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"

import { decide } from "@/lib/intelligence/decision-engine"
import { runCalibratedA3Pipeline } from "@/lib/intelligence/engine-pipeline"
import { persistForecast } from "@/lib/intelligence/forecast-store"
import { runCrossAsset } from "@/lib/intelligence/cross-asset"
import { runDerivativesEngine } from "@/lib/intelligence/derivatives-engine"
import { runDivergenceEngine } from "@/lib/intelligence/divergence-engine"
import { runCycleEngine } from "@/lib/intelligence/cycle-engine"
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
    const derivativesUrl = new URL("/api/v1/derivatives", request.url)
    const flowUrl = new URL("/api/v1/flows", request.url)
    derivativesUrl.searchParams.set("symbol", symbol)
    flowUrl.searchParams.set("symbol", symbol)

    const [
      analysisResponse,
      cycleResponse,
      crossAssetResponse,
      derivativesResponse,
      flowResponse,
    ] = await Promise.all([
      fetch(analysisUrl, { cache: "no-store" }),
      fetch(cycleUrl, { cache: "no-store" }),
      fetch(crossAssetUrl, { cache: "no-store" }),
      fetch(derivativesUrl, { cache: "no-store" }),
      fetch(flowUrl, { cache: "no-store" }),
    ])

    const [
      analysis,
      cycleData,
      crossData,
      derivativesData,
      flowData,
    ] = await Promise.all([
      analysisResponse.json(),
      cycleResponse.ok ? cycleResponse.json() : Promise.resolve({}),
      crossAssetResponse.ok ? crossAssetResponse.json() : Promise.resolve({}),
      derivativesResponse.ok ? derivativesResponse.json() : Promise.resolve(null),
      flowResponse.ok ? flowResponse.json() : Promise.resolve(null),
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

    const rawDerivativesSnapshot =
      derivativesData && derivativesData.source !== "unavailable"
        ? derivativesData
        : null

    const fundingRate = n(rawDerivativesSnapshot?.fundingRate)
    const openInterestChangePct = n(rawDerivativesSnapshot?.openInterestChangePct)
    const longShortRatio = n(rawDerivativesSnapshot?.longShortRatio)

    const derivativesAvailable = [
      fundingRate,
      openInterestChangePct,
      longShortRatio,
    ].some((value) => value !== null)

    // An absolute open-interest value alone is not used by the score engine.
    const derivativesSnapshot = derivativesAvailable
      ? rawDerivativesSnapshot
      : null

    const derivativesResult = runDerivativesEngine({
      fundingRate,
      openInterestChangePct,
      longShortRatio,
      // No exact rolling 24h liquidation total is supplied.
      liquidationsUsd: null,
      priceChangePct: change,
    })

    const derivatives = derivativesAvailable ? derivativesResult : null

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

    const volumeChangePct = n(flowData?.volumeChangePct)
    const flow =
      flowData && flowData.source !== "unavailable"
        ? flowData
        : null

    const divergenceInputs = {
      priceChangePct: change,
      volumeChangePct,
      momentumChange: n(analysis.momentumChange),
      fundingRate,
      openInterestChangePct,
      breadthChange: n(crossData.breadthChangePct),
    }

    const hasDivergenceInputs =
      (change !== null && (
        volumeChangePct !== null ||
        divergenceInputs.momentumChange !== null ||
        divergenceInputs.breadthChange !== null
      )) ||
      (fundingRate !== null && openInterestChangePct !== null)

    const divergence = hasDivergenceInputs
      ? runDivergenceEngine(divergenceInputs)
      : null

    const flowVolumeChange = n(flow?.volumeChangePct)
    const flowScore =
      flow && flowVolumeChange !== null
        ? clamp(
            50 +
              (flow.volumePriceDivergence === "bullish"
                ? 20
                : flow.volumePriceDivergence === "bearish"
                  ? -20
                  : 0) +
              Math.max(-15, Math.min(15, flowVolumeChange / 4))
          )
        : null

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

    const cycleAvailable =
      (btcPrice !== null && currentAth !== null) ||
      (symbol === "BTC" && rsi !== null) ||
      btcDominance !== null ||
      ethBtc !== null

    const cycleScore = cycleAvailable ? cycle.score : null
    const breadth = n(crossData.breadthScore)
    const topRisk = n(cycleData.bullMarket?.topRiskScore)
    const risk = topRisk === null ? 50 : clamp(100 - topRisk)

    // A transition only makes sense when there is an observed cycle regime.
    const transition = cycleAvailable
      ? detectRegimeTransition({
          regime: cycle.phase,
          priceChangePct: change,
          volumeChangePct: flowVolumeChange,
          rsi: symbol === "BTC" ? rsi : null,
          btcDominance,
          ethBtc,
          cycleScore,
        })
      : null

    const pipeline = await runCalibratedA3Pipeline(
      market,
      {
        derivatives: derivativesSnapshot,
        derivativesResult: derivatives,
        flow,
        historical: analysis.historical || null,
        crossAsset: cross,
        breadthScore: breadth,
        cycleScore,
        strategicScore: strategic,
        flowScore,
        transitionScore: transition?.score ?? null,
        cycle: cycleAvailable ? cycle : null,
        divergence,
        transition,
      },
      "1d"
    )

    const decision = decide({
      tacticalScore: tactical,
      strategicScore: strategic,
      cycleScore: cycleScore ?? 50,
      breadthScore: breadth ?? 50,
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
        available: cycleAvailable,
        phase: cycleAvailable ? cycle.phase : null,
        ath: currentAth,
        athDate: cycleData.bullMarket?.athDate ?? null,
        drawdownPct: currentDrawdown,
        priorTop: cycleData.bullMarket?.priorTop ?? null,
        nextTop: cycleData.bullMarket?.estimatedTop ?? null,
        bottomWindow: cycleData.bearMarket?.bottomWindow ?? null,
        bottomProbability: cycleAvailable ? cycle.bottomProbability : null,
        topProbability: cycleAvailable ? cycle.topProbability : null,
      },
      transition,
      flow: {
        volume24h: n(flow?.volume24h),
        volumeChangePct: flowVolumeChange,
        volumePriceDivergence: flow?.volumePriceDivergence ?? null,
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
        derivativesRisk: derivatives?.leverageRisk ?? "unknown",
        crowding: derivatives?.crowding ?? "unknown",
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
