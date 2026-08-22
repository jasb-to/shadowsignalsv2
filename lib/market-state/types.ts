export type MarketSignal = "Buy" | "Sell" | "Hold"
export type MarketTrend = "Trending Up" | "Trending Down" | "Sideways"
export type MarketRegime = "bullish_expansion" | "bearish_expansion" | "accumulation" | "distribution" | "range" | "transition"

export interface OHLCVBar {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface IndicatorState {
  rsi: number | null
  stochasticRsi: number | null
  ema8: number | null
  ema21: number | null
  macd: number | null
  macdSignal: number | null
  atr: number | null
  volatility: number | null
}

export interface MarketState {
  symbol: string
  timestamp: number
  price: number
  change24h: number
  volume24h: number
  signal: MarketSignal
  trend: MarketTrend
  regime: MarketRegime
  momentum: number
  volatility: number
  confidence: number
  indicators: IndicatorState
  supportResistance: {
    support1: number | null
    support2: number | null
    resistance1: number | null
    resistance2: number | null
  }
  evidence: string[]
  invalidation: string
}
