import { buildA3Intelligence } from "../lib/intelligence/a3-orchestrator"

const market = {
  symbol: "BTC/USD",
  price: 100000,
  change24h: 1,
  trend: "bullish",
  indicators: { rsi: 58, macd: 120, macdSignal: 90 },
} as any

const result = buildA3Intelligence(market, {
  breadthScore: 62,
  cycleScore: 58,
  strategicScore: 60,
  flowScore: 65,
  transitionScore: 55,
})

const failures: string[] = []
if (!Number.isFinite(result.score)) failures.push("score is not finite")
if (!Number.isFinite(result.confidence)) failures.push("confidence is not finite")
if (!Number.isFinite(result.confluence)) failures.push("confluence is not finite")
if (result.signal === "Buy" && result.score < 35) failures.push("buy signal threshold violated")
if (result.signal === "Sell" && result.score > -35) failures.push("sell signal threshold violated")
if (result.dataQuality.completeness < 0 || result.dataQuality.completeness > 100) failures.push("data quality out of bounds")
if (result.calibratedConfidence.raw < 0 || result.calibratedConfidence.raw > 100) failures.push("raw confidence out of bounds")
if (result.calibratedConfidence.calibrated < 0 || result.calibratedConfidence.calibrated > 100) failures.push("calibrated confidence out of bounds")
if (!Array.isArray(result.evidence) || result.evidence.length === 0) failures.push("engine produced no evidence")

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures, result }, null, 2))
  process.exit(1)
}

console.log(JSON.stringify({
  ok: true,
  signal: result.signal,
  score: result.score,
  confidence: result.confidence,
  confluence: result.confluence,
  completeness: result.dataQuality.completeness,
  evidenceCount: result.evidence.length,
}, null, 2))
