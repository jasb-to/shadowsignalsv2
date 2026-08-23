export interface FlowSnapshot { symbol: string; volume24h: number | null; volumeChangePct: number | null; priceChangePct: number | null; volumePriceDivergence: "bullish" | "bearish" | "neutral"; source: string; timestamp: number }
export function buildFlowSnapshot(symbol: string, currentVolume: number, previousVolume: number, priceChangePct: number): FlowSnapshot {
  const volumeChangePct = previousVolume > 0 ? ((currentVolume - previousVolume) / previousVolume) * 100 : null
  const volumePriceDivergence = volumeChangePct != null && volumeChangePct > 15 && priceChangePct < 0 ? "bearish" : volumeChangePct != null && volumeChangePct > 15 && priceChangePct > 0 ? "bullish" : "neutral"
  return { symbol, volume24h: currentVolume, volumeChangePct, priceChangePct, volumePriceDivergence, source: "market-history", timestamp: Date.now() }
}
