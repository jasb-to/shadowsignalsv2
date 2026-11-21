export type DivergenceDirection = "bullish" | "bearish" | "neutral"

export interface DivergenceInput {
  priceChangePct: number | null
  volumeChangePct?: number | null
  momentumChange?: number | null
  fundingRate?: number | null
  openInterestChangePct?: number | null
  breadthChange?: number | null
}

export interface DivergenceResult {
  direction: DivergenceDirection
  score: number
  signals: string[]
}

export function runDivergenceEngine(i: DivergenceInput): DivergenceResult {
  let score = 0
  const signals: string[] = []
  const priceChange = i.priceChangePct

  // These comparisons need a real price-change observation.
  if (priceChange !== null) {
    if (i.volumeChangePct != null && i.volumeChangePct > 15 && priceChange < 0) {
      score -= 20
      signals.push("selling volume divergence")
    }

    if (i.volumeChangePct != null && i.volumeChangePct > 15 && priceChange > 0) {
      score += 20
      signals.push("confirming buying volume")
    }

    if (i.momentumChange != null && priceChange < 0 && i.momentumChange > 0) {
      score += 18
      signals.push("bullish momentum divergence")
    }

    if (i.momentumChange != null && priceChange > 0 && i.momentumChange < 0) {
      score -= 18
      signals.push("bearish momentum divergence")
    }

    if (i.breadthChange != null && priceChange > 0 && i.breadthChange < 0) {
      score -= 15
      signals.push("price rising while breadth weakens")
    }

    if (i.breadthChange != null && priceChange < 0 && i.breadthChange > 0) {
      score += 15
      signals.push("price falling while breadth improves")
    }
  }

  if (
    i.openInterestChangePct != null &&
    i.fundingRate != null &&
    i.openInterestChangePct > 10 &&
    i.fundingRate > 0.001
  ) {
    score -= 12
    signals.push("leveraged long crowding")
  }

  if (
    i.openInterestChangePct != null &&
    i.fundingRate != null &&
    i.openInterestChangePct > 10 &&
    i.fundingRate < 0
  ) {
    score += 12
    signals.push("short build with negative funding")
  }

  score = Math.max(-100, Math.min(100, score))

  return {
    direction: score > 12 ? "bullish" : score < -12 ? "bearish" : "neutral",
    score,
    signals,
  }
}
