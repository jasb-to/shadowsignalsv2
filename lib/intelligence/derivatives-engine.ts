export interface DerivativesInput {
  fundingRate?: number | null
  openInterestChangePct?: number | null
  longShortRatio?: number | null
  liquidationsUsd?: number | null
  priceChangePct?: number | null
}

export interface DerivativesResult {
  score: number
  leverageRisk: "low" | "medium" | "high" | "unknown"
  crowding: "long" | "short" | "balanced" | "unknown"
  signals: string[]
}

export function runDerivativesEngine(
  input: DerivativesInput
): DerivativesResult {
  let score = 0
  const signals: string[] = []

  const funding = input.fundingRate ?? null
  const openInterest = input.openInterestChangePct ?? null
  const longShort = input.longShortRatio ?? null
  const liquidations = input.liquidationsUsd ?? null
  const priceChange = input.priceChangePct ?? null

  if (funding !== null) {
    if (funding > 0.001) {
      score -= 15
      signals.push("positive funding crowding longs")
    } else if (funding < -0.001) {
      score += 15
      signals.push("negative funding crowding shorts")
    }
  }

  if (openInterest !== null && priceChange !== null) {
    if (openInterest > 10 && priceChange < 0) {
      score -= 15
      signals.push("open interest rising into weakness")
    } else if (openInterest > 10 && priceChange > 0) {
      score += 8
      signals.push("open interest confirms upside")
    }
  }

  if (longShort !== null) {
    if (longShort > 1.5) {
      score -= 10
      signals.push("long positioning elevated")
    } else if (longShort < 0.7) {
      score += 10
      signals.push("short positioning elevated")
    }
  }

  const observations = [
    funding,
    openInterest,
    longShort,
    liquidations,
  ].filter((value) => value !== null).length

  const leverageRisk: DerivativesResult["leverageRisk"] =
    observations === 0
      ? "unknown"
      : (funding !== null && Math.abs(funding) > 0.002) ||
          (openInterest !== null && openInterest > 15) ||
          (liquidations !== null && liquidations > 100000000)
        ? "high"
        : (funding !== null && Math.abs(funding) > 0.001) ||
            (openInterest !== null && openInterest > 8)
          ? "medium"
          : "low"

  const crowding: DerivativesResult["crowding"] =
    longShort === null
      ? "unknown"
      : longShort > 1.2
        ? "long"
        : longShort < 0.85
          ? "short"
          : "balanced"

  score = Math.max(-100, Math.min(100, score))

  return {
    score,
    leverageRisk,
    crowding,
    signals,
  }
}
