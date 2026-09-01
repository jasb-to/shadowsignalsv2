import { runCycleEngine } from "../lib/intelligence/cycle-engine.ts"
import { scoreIntelligence } from "../lib/intelligence/scoring.ts"
import { calibrate, evaluateForecast, directionFromReturn, backtest } from "../lib/intelligence/calibration.ts"
import { calibrateConfidence } from "../lib/intelligence/calibrated-confidence.ts"
import { runA3Pipeline } from "../lib/intelligence/engine-pipeline.ts"
import type { MarketState } from "../lib/market-state/types.ts"

function assert(condition: unknown, message: string) { if (!condition) throw new Error(`FAIL: ${message}`) }
function test(name: string, fn: () => void) { fn(); console.log(`PASS: ${name}`) }

test("cycle engine returns bounded scores", () => {
  const result = runCycleEngine({ price: 100000, ath: 100000, rsi: 50 })
  assert(result.score >= 0 && result.score <= 100, "score must be 0-100")
  assert(result.bottomProbability >= 0 && result.bottomProbability <= 100, "bottom probability must be 0-100")
  assert(result.topProbability >= 0 && result.topProbability <= 100, "top probability must be 0-100")
})

test("deep drawdown produces a materially different state", () => {
  const result = runCycleEngine({ price: 25000, ath: 100000, rsi: 28 })
  assert(result.score < 25, `expected deep-bear score, got ${result.score}`)
  assert(result.phase === "bear_market", `expected bear_market, got ${result.phase}`)
  assert(result.signals.includes("deep ATH drawdown"), "missing deep drawdown signal")
  assert(result.signals.includes("oversold momentum"), "missing oversold signal")
})

test("near highs with strong momentum produces a different state", () => {
  const result = runCycleEngine({ price: 90000, ath: 100000, rsi: 78 })
  assert(result.score > 70, `expected high score, got ${result.score}`)
  assert(result.signals.includes("near cycle highs"), "missing near-highs signal")
  assert(result.signals.includes("extreme momentum"), "missing extreme momentum signal")
})

test("missing optional inputs do not create NaN output", () => {
  const result = runCycleEngine({ price: 60000, ath: 100000 })
  for (const value of [result.score, result.bottomProbability, result.topProbability]) assert(Number.isFinite(value), "output must be finite")
})

test("cycle inputs materially influence the result", () => {
  const neutral = runCycleEngine({ price: 60000, ath: 100000, rsi: 50 })
  const lateCycle = runCycleEngine({ price: 60000, ath: 100000, rsi: 50, monthsFromHalving: 20, btcDominance: 48, ethBtc: 0.065 })
  assert(lateCycle.score > neutral.score, `expected late-cycle evidence to change score (${neutral.score} -> ${lateCycle.score})`)
  assert(lateCycle.signals.length > neutral.signals.length, "expected additional evidence signals")
})

test("bull and bear intelligence states are not identical", () => {
  const bull = scoreIntelligence({ trend: "Trending Up", rsi: 50, macd: 2, macdSignal: 1 })
  const bear = scoreIntelligence({ trend: "Trending Down", rsi: 50, macd: 1, macdSignal: 2 })
  assert(bull.score > 0, `expected positive bull score, got ${bull.score}`)
  assert(bear.score < 0, `expected negative bear score, got ${bear.score}`)
  assert(bull.score !== bear.score, "bull and bear states must differ")
})

test("derivatives positioning changes conviction", () => {
  const normal = scoreIntelligence({ trend: "Trending Up", rsi: 50, macd: 2, macdSignal: 1 })
  const crowdedLongs = scoreIntelligence({ trend: "Trending Up", rsi: 50, macd: 2, macdSignal: 1, fundingRate: 0.002, longShortRatio: 1.4 })
  const crowdedShorts = scoreIntelligence({ trend: "Trending Down", rsi: 50, macd: 1, macdSignal: 2, fundingRate: -0.002, longShortRatio: 0.7 })
  assert(crowdedLongs.score < normal.score, `crowded longs should reduce bullish score (${normal.score} -> ${crowdedLongs.score})`)
  assert(crowdedShorts.score > -40, `crowded shorts should offset bearish score, got ${crowdedShorts.score}`)
})

test("volume-price divergence changes the score", () => {
  const neutral = scoreIntelligence({ trend: "Trending Up", rsi: 50, macd: 2, macdSignal: 1 })
  const bearishDivergence = scoreIntelligence({ trend: "Trending Up", rsi: 50, macd: 2, macdSignal: 1, volumePriceDivergence: "bearish" })
  const bullishDivergence = scoreIntelligence({ trend: "Trending Up", rsi: 50, macd: 2, macdSignal: 1, volumePriceDivergence: "bullish" })
  assert(bearishDivergence.score < neutral.score, "bearish divergence must reduce score")
  assert(bullishDivergence.score > neutral.score, "bullish divergence must increase score")
})

test("missing intelligence evidence does not invent directional conviction", () => {
  const result = scoreIntelligence({ trend: "Neutral", rsi: null, macd: null, macdSignal: null })
  assert(result.score === 0, `expected neutral score with no evidence, got ${result.score}`)
  assert(result.bias === "neutral", `expected neutral bias, got ${result.bias}`)
})

test("confidence rises with evidence but remains bounded", () => {
  const weak = scoreIntelligence({ trend: "Trending Up", rsi: 50, macd: null, macdSignal: null })
  const strong = scoreIntelligence({ trend: "Trending Up", rsi: 30, macd: 2, macdSignal: 1, fundingRate: -0.002, longShortRatio: 0.7, volumePriceDivergence: "bullish" })
  assert(strong.confidence > weak.confidence, `expected stronger evidence to increase confidence (${weak.confidence} -> ${strong.confidence})`)
  assert(strong.confidence <= 95, "confidence must remain <= 95")
})

test("full A3 pipeline integrates engine and contextual evidence", () => {
  const market: MarketState = {
    symbol: "BTC",
    timestamp: 1,
    price: 100000,
    change24h: 2,
    volume24h: 1000000,
    signal: "Hold",
    trend: "Trending Up",
    regime: "bullish_expansion",
    momentum: 20,
    volatility: 4,
    confidence: 70,
    indicators: { rsi: 55, stochasticRsi: 60, ema8: 101000, ema21: 99000, macd: 2, macdSignal: 1, atr: 1000, volatility: 4 },
    supportResistance: { support1: 95000, support2: 90000, resistance1: 105000, resistance2: 110000 },
    evidence: ["trend confirmed"],
    invalidation: "Close below 95000",
  }
  const result = runA3Pipeline(market, { breadthScore: 60, cycleScore: 70, strategicScore: 65, flowScore: 58 })
  assert(Number.isFinite(result.intelligence.score), "pipeline score must be finite")
  assert(result.intelligence.confidence >= 40 && result.intelligence.confidence <= 94, "pipeline confidence must be bounded")
  assert(result.forecast.symbol === "BTC", "forecast must retain symbol")
  assert(["Buy", "Hold", "Sell"].includes(result.forecast.signal), "forecast must contain a valid signal")
  assert(result.intelligence.dataQuality.completeness > 0, "pipeline must report data completeness")
})

test("forecast direction evaluation uses deterministic thresholds", () => {
  assert(directionFromReturn(1.01) === "up", "positive threshold should be up")
  assert(directionFromReturn(-1.01) === "down", "negative threshold should be down")
  assert(directionFromReturn(0.5) === "flat", "small return should be flat")
  const buy = evaluateForecast({ symbol: "BTC", capturedAt: 1, signal: "Buy", confidence: 70, score: 40, horizon: "1d" }, 2)
  const sell = evaluateForecast({ symbol: "BTC", capturedAt: 1, signal: "Sell", confidence: 70, score: -40, horizon: "1d" }, -2)
  assert(buy.correct && sell.correct, "matching directions should resolve correctly")
})

test("historical backtest never uses a price before the forecast horizon", () => {
  const result = backtest(
    [{ timestamp: 1000, price: 100, signal: "Buy", confidence: 70 }],
    1000,
    [{ timestamp: 1500, price: 200 }, { timestamp: 2000, price: 110 }]
  ) as Array<{ targetPrice: number }>
  assert(result.length === 1, "forecast should resolve when target price exists")
  assert(result[0].targetPrice === 110, `backtest used price before target: ${result[0].targetPrice}`)
})

test("calibration bins have stable empirical accuracy", () => {
  const rows = Array.from({ length: 20 }, (_, i) => ({ confidence: i < 10 ? 60 : 65, correct: i < 7, actualReturnPct: i < 10 ? 2 : -2 }))
  const bins = calibrate(rows)
  const bin = bins.find(b => b.range === "60-70%")
  assert(!!bin, "60-70 calibration bin must exist")
  assert(bin!.forecasts === 20, `expected 20 forecasts, got ${bin!.forecasts}`)
  assert(bin!.accuracy === 35, `expected 35% accuracy, got ${bin!.accuracy}`)
})

test("confidence calibration respects bin boundaries and sample threshold", () => {
  const bins = [
    { range: "40-50%", forecasts: 20, accuracy: 45, avgReturnPct: 0 },
    { range: "50-60%", forecasts: 20, accuracy: 70, avgReturnPct: 1 },
    { range: "60-70%", forecasts: 5, accuracy: 100, avgReturnPct: 2 },
    { range: "70-80%", forecasts: 20, accuracy: 90, avgReturnPct: 3 },
  ]
  const at50 = calibrateConfidence(50, bins)
  const at55 = calibrateConfidence(55, bins)
  const lowSample = calibrateConfidence(65, bins)
  assert(at50.sampleSize === 20 && at50.method === "empirical", "50% must belong to the 50-60 bin")
  assert(at55.calibrated > 55, "50-60 bin accuracy should raise 55% confidence")
  assert(lowSample.method === "prior" && lowSample.calibrated === 65, "small samples must retain the prior")
})

console.log("A3 engine behavioural, backtest, calibration and integration tests passed")
