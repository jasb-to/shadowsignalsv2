export interface IntelligenceScore { score: number; confidence: number; bias: "bullish" | "bearish" | "neutral"; factors: string[] }
export function scoreIntelligence(input: { trend: string; rsi: number | null; macd: number | null; macdSignal: number | null; fundingRate?: number | null; longShortRatio?: number | null; volumePriceDivergence?: "bullish" | "bearish" | "neutral" }): IntelligenceScore {
  let score = 0; const factors: string[] = []
  if (input.trend === "Trending Up") { score += 20; factors.push("trend bullish") } else if (input.trend === "Trending Down") { score -= 20; factors.push("trend bearish") }
  if (input.rsi != null) { if (input.rsi < 35) { score += 15; factors.push("RSI oversold") } else if (input.rsi > 65) { score -= 15; factors.push("RSI overbought") } }
  if (input.macd != null && input.macdSignal != null) { if (input.macd > input.macdSignal) { score += 15; factors.push("MACD bullish") } else { score -= 15; factors.push("MACD bearish") } }
  if (input.fundingRate != null) { if (input.fundingRate > 0.001) { score -= 10; factors.push("elevated positive funding") } else if (input.fundingRate < -0.001) { score += 10; factors.push("negative funding") } }
  if (input.longShortRatio != null) { if (input.longShortRatio > 1.25) { score -= 10; factors.push("crowded longs") } else if (input.longShortRatio < 0.8) { score += 10; factors.push("crowded shorts") } }
  if (input.volumePriceDivergence === "bullish") { score += 10; factors.push("bullish volume-price divergence") } else if (input.volumePriceDivergence === "bearish") { score -= 10; factors.push("bearish volume-price divergence") }
  score = Math.max(-100, Math.min(100, score)); const confidence = Math.min(95, 50 + Math.round(Math.abs(score) * 0.45)); const bias = score > 15 ? "bullish" : score < -15 ? "bearish" : "neutral"
  return { score, confidence, bias, factors }
}
