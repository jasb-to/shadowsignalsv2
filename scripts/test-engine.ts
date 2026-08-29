import { runCycleEngine } from "../lib/intelligence/cycle-engine.ts"

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(`FAIL: ${message}`)
}

function test(name: string, fn: () => void) {
  fn()
  console.log(`PASS: ${name}`)
}

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
  for (const value of [result.score, result.bottomProbability, result.topProbability]) {
    assert(Number.isFinite(value), "output must be finite")
  }
})

test("cycle inputs materially influence the result", () => {
  const neutral = runCycleEngine({ price: 60000, ath: 100000, rsi: 50 })
  const lateCycle = runCycleEngine({ price: 60000, ath: 100000, rsi: 50, monthsFromHalving: 20, btcDominance: 48, ethBtc: 0.065 })
  assert(lateCycle.score > neutral.score, `expected late-cycle evidence to change score (${neutral.score} -> ${lateCycle.score})`)
  assert(lateCycle.signals.length > neutral.signals.length, "expected additional evidence signals")
})

console.log("A3 engine smoke tests passed")
