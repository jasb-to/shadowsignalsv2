import { runCycleEngine } from "../lib/intelligence/cycle-engine.ts"
import { scoreIntelligence } from "../lib/intelligence/scoring.ts"

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

console.log("A3 engine behavioural tests passed")
