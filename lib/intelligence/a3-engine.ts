import type {
  MarketState,
  MarketRegime,
  MarketSignal,
} from "@/lib/market-state/types"

export type ScenarioName = "bull" | "base" | "bear"

export interface A3Scenario {
  name: ScenarioName
  probability: number
  trigger: string
  thesis: string
}

export interface A3Factor {
  name: string
  score: number
  weight: number
  contribution: number
  state: "bullish" | "bearish" | "neutral"
  available: boolean
}

export interface A3EngineResult {
  score: number
  confidence: number
  signal: MarketSignal
  regime: MarketRegime
  factors: A3Factor[]
  confluence: number
  scenarios: A3Scenario[]
  risk: "low" | "medium" | "high"
  invalidation: string
  thesis: string
  dataQuality: number
  regimeTransition: "strengthening" | "weakening" | "stable"
  marketStructure: "breakout" | "breakdown" | "range"
}

const clamp = (n: number, min = -100, max = 100) =>
  Math.max(min, Math.min(max, n))

const state = (n: number): A3Factor["state"] =>
  n > 10 ? "bullish" : n < -10 ? "bearish" : "neutral"

export function momentumFromRsi(rsi: number | null): number {
  if (rsi === null || !Number.isFinite(rsi)) return 0
  return clamp(rsi - 50)
}

const factor = (
  name: string,
  score: number,
  weight: number,
  available: boolean
): A3Factor => {
  const safeScore = available ? clamp(score) : 0
  return {
    name,
    score: safeScore,
    weight,
    contribution: safeScore * weight,
    state: state(safeScore),
    available,
  }
}

/** Floors then distributes remaining percentage points by largest remainder. */
function wholePercentages(values: number[]): number[] {
  const total = values.reduce((sum, value) => sum + value, 0) || 1
  const exact = values.map((value) => (value / total) * 100)
  const result = exact.map(Math.floor)
  let remaining = 100 - result.reduce((sum, value) => sum + value, 0)

  const order = exact
    .map((value, index) => ({
      index,
      fraction: value - result[index],
    }))
    .sort((a, b) => b.fraction - a.fraction)

  for (let i = 0; i < remaining; i++) {
    result[order[i].index] += 1
  }

  return result
}

export function runA3Engine(m: MarketState): A3EngineResult {
  const rsiValue =
    m.indicators.rsi !== null && Number.isFinite(m.indicators.rsi)
      ? m.indicators.rsi
      : null

  const emaAvailable =
    m.indicators.ema8 !== null &&
    m.indicators.ema21 !== null &&
    Number.isFinite(m.indicators.ema8) &&
    Number.isFinite(m.indicators.ema21)

  const macdAvailable =
    m.indicators.macd !== null &&
    m.indicators.macdSignal !== null &&
    Number.isFinite(m.indicators.macd) &&
    Number.isFinite(m.indicators.macdSignal)

  const rsiAvailable = rsiValue !== null

  const volatilityValue =
    m.indicators.volatility !== null &&
    Number.isFinite(m.indicators.volatility)
      ? m.indicators.volatility
      : Number.isFinite(m.volatility) && m.volatility > 0
        ? m.volatility
        : null

  const volatilityAvailable = volatilityValue !== null

  const emaScore =
    emaAvailable && m.indicators.ema8! > m.indicators.ema21! ? 35 : -35

  const trendScore =
    m.trend === "Trending Up"
      ? 45
      : m.trend === "Trending Down"
        ? -45
        : 0

  const macdScore =
    macdAvailable && m.indicators.macd! > m.indicators.macdSignal!
      ? 35
      : -35

  const rsiScore =
    rsiValue === null
      ? 0
      : rsiValue < 30
        ? 20
        : rsiValue < 45
          ? 8
          : rsiValue > 75
            ? -20
            : rsiValue > 60
              ? 12
              : 0

  const momentum = momentumFromRsi(rsiValue)

  const volatilityScore =
    volatilityValue === null
      ? 0
      : volatilityValue >= 75
        ? -15
        : volatilityValue >= 45
          ? -8
          : volatilityValue < 20
            ? 5
            : 0

  const regimeScore =
    m.regime === "bullish_expansion"
      ? 35
      : m.regime === "bearish_expansion"
        ? -35
        : m.regime === "accumulation"
          ? 20
          : m.regime === "distribution"
            ? -20
            : 0

  const trendAvailable = m.trend !== "Sideways" || emaAvailable
  const regimeAvailable = emaAvailable && rsiAvailable

  const factors = [
    factor("Trend", trendScore, 0.18, trendAvailable),
    factor("EMA structure", emaScore, 0.14, emaAvailable),
    factor("Momentum", momentum, 0.14, rsiAvailable),
    factor("MACD", macdScore, 0.13, macdAvailable),
    factor("RSI", rsiScore, 0.09, rsiAvailable),
    factor("Volatility", volatilityScore, 0.06, volatilityAvailable),
    factor("Market regime", regimeScore, 0.16, regimeAvailable),
  ]

  // A neutral but observed reading is still available evidence.
  const availableFactors = factors.filter((item) => item.available)
  const activeWeight = availableFactors.reduce(
    (sum, item) => sum + item.weight,
    0
  )

  const score = Math.round(
    clamp(
      activeWeight > 0
        ? factors.reduce((sum, item) => sum + item.contribution, 0) /
            activeWeight
        : 0
    )
  )

  const signal: MarketSignal =
    score >= 35 ? "Buy" : score <= -35 ? "Sell" : "Hold"

  const directional = availableFactors.filter((item) => item.score !== 0)
  const aligned = directional.filter(
    (item) => item.state === state(score)
  ).length

  const confluence = directional.length
    ? Math.round((aligned / directional.length) * 100)
    : 0

  const dataQuality = Math.round(Math.min(100, (activeWeight / 0.9) * 100))

  const price = Number.isFinite(m.price) ? m.price : null
  const support = m.supportResistance.support1
  const resistance = m.supportResistance.resistance1

  const breakout =
    price !== null && support !== null && resistance !== null && price > resistance
  const breakdown =
    price !== null && support !== null && price < support

  const structure: A3EngineResult["marketStructure"] = breakout
    ? "breakout"
    : breakdown
      ? "breakdown"
      : "range"

  const transition: A3EngineResult["regimeTransition"] =
    score > 20 && m.regime !== "bullish_expansion"
      ? "strengthening"
      : score < -20 && m.regime !== "bearish_expansion"
        ? "weakening"
        : "stable"

  const confidence = Math.round(
    Math.max(
      40,
      Math.min(
        94,
        48 +
          Math.abs(score) * 0.3 +
          (confluence / 100) * 15 -
          (100 - dataQuality) * 0.08
      )
    )
  )

  const risk: A3EngineResult["risk"] =
    volatilityValue === null
      ? "medium"
      : volatilityValue >= 75
        ? "high"
        : volatilityValue >= 45
          ? "medium"
          : "low"

  const bull = Math.max(
    8,
    35 +
      Math.max(score, 0) * 0.45 +
      Math.max(confluence - 50, 0) * 0.15 +
      (breakout ? 10 : 0)
  )

  const bear = Math.max(
    8,
    35 +
      Math.max(-score, 0) * 0.45 +
      Math.max(confluence - 50, 0) * 0.15 +
      (breakdown ? 10 : 0)
  )

  const [bullProbability, baseProbability, bearProbability] =
    wholePercentages([bull, 35, bear])

  const scenarios: A3Scenario[] = [
    {
      name: "bull",
      probability: bullProbability,
      trigger:
        resistance !== null
          ? "Sustained close above " + resistance
          : "Confirmed structural breakout",
      thesis: "Trend and momentum extend with buyers retaining control.",
    },
    {
      name: "base",
      probability: baseProbability,
      trigger: "Price remains inside the current structure",
      thesis: "The market consolidates while conflicting evidence resolves.",
    },
    {
      name: "bear",
      probability: bearProbability,
      trigger:
        support !== null
          ? "Decisive close below " + support
          : "Confirmed structural breakdown",
      thesis:
        "Loss of structure increases downside pressure and weakens the bullish case.",
    },
  ]

  const invalidation =
    support !== null
      ? "Bullish thesis weakens on a decisive close below " + support + "."
      : "Bullish thesis weakens on confirmed structural support failure."

  const thesis =
    signal === "Buy"
      ? m.symbol +
        " has a positive A³ state: directional evidence currently outweighs opposing factors."
      : signal === "Sell"
        ? m.symbol +
          " has a negative A³ state: downside evidence currently outweighs bullish factors."
        : m.symbol +
          " is mixed: evidence is not sufficiently aligned for a strong directional thesis."

  return {
    score,
    confidence,
    signal,
    regime: m.regime,
    factors,
    confluence,
    scenarios,
    risk,
    invalidation,
    thesis,
    dataQuality,
    regimeTransition: transition,
    marketStructure: structure,
  }
}
