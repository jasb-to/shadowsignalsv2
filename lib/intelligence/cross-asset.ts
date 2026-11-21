export interface CrossAssetInput {
  btcReturn?: number | null
  ethReturn?: number | null
  btcDominance?: number | null
  ethBtcReturn?: number | null
  goldReturn?: number | null
  dxyReturn?: number | null
  spxReturn?: number | null
  nasdaqReturn?: number | null
}

export interface CrossAssetResult {
  score: number
  regime: "risk_on" | "risk_off" | "mixed" | "unavailable"
  signals: string[]
  availablePairs: number
}

export function runCrossAsset(i: CrossAssetInput): CrossAssetResult {
  let score = 0
  let availablePairs = 0
  const signals: string[] = []

  if (i.spxReturn != null && i.nasdaqReturn != null) {
    availablePairs += 1
    if (i.spxReturn > 0 && i.nasdaqReturn > 0) {
      score += 15
      signals.push("equities risk-on")
    } else if (i.spxReturn < 0 && i.nasdaqReturn < 0) {
      score -= 15
      signals.push("equities risk-off")
    }
  }

  if (i.btcReturn != null && i.ethReturn != null) {
    availablePairs += 1
    if (i.btcReturn > 0 && i.ethReturn > i.btcReturn) {
      score += 15
      signals.push("crypto breadth improving")
    } else if (i.btcReturn < 0 && i.ethReturn < i.btcReturn) {
      score -= 15
      signals.push("crypto breadth weakening")
    }
  }

  if (i.goldReturn != null && i.dxyReturn != null) {
    availablePairs += 1
    if (i.goldReturn > 0 && i.dxyReturn < 0) {
      score += 8
      signals.push("gold supported as dollar weakens")
    } else if (i.goldReturn < 0 && i.dxyReturn > 0) {
      score -= 8
      signals.push("dollar strength pressures risk assets")
    }
  }

  if (i.btcDominance != null && i.ethBtcReturn != null) {
    availablePairs += 1
    if (i.btcDominance < 55 && i.ethBtcReturn > 0) {
      score += 12
      signals.push("altcoin relative strength")
    } else if (i.btcDominance > 60 && i.ethBtcReturn < 0) {
      score -= 10
      signals.push("BTC concentration elevated")
    }
  }

  score = Math.max(-100, Math.min(100, score))

  const regime =
    availablePairs === 0
      ? "unavailable"
      : score > 12
        ? "risk_on"
        : score < -12
          ? "risk_off"
          : "mixed"

  return {
    score,
    regime,
    signals,
    availablePairs,
  }
}
