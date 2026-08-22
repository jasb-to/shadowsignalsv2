import { atr, ema, macd, rsi, volatility } from "./indicators"
import type { MarketRegime, MarketState, OHLCVBar } from "./types"

export function buildMarketState(symbol: string, bars: OHLCVBar[], change24h = 0, volume24h = 0): MarketState {
  if (bars.length < 30) throw new Error("At least 30 OHLCV bars are required")
  const closes = bars.map((b) => b.close)
  const price = closes.at(-1)!
  const ema8 = ema(closes, 8)
  const ema21 = ema(closes, 21)
  const rsiValue = rsi(closes)
  const macdState = macd(closes)
  const atrValue = atr(bars)
  const vol = volatility(closes)
  const momentum = rsiValue === null ? 50 : Math.max(0, Math.min(100, rsiValue))
  const trend: MarketState["trend"] = ema8 === null || ema21 === null ? "Sideways" : ema8 > ema21 * 1.002 ? "Trending Up" : ema8 < ema21 * 0.998 ? "Trending Down" : "Sideways"

  const recent = bars.slice(-20)
  const high = Math.max(...recent.map((b) => b.high))
  const low = Math.min(...recent.map((b) => b.low))
  const range = high - low || price
  const positionInRange = (price - low) / range

  let regime: MarketRegime = "range"
  if (trend === "Trending Up" && momentum >= 60) regime = "bullish_expansion"
  else if (trend === "Trending Down" && momentum <= 40) regime = "bearish_expansion"
  else if (trend === "Sideways" && momentum < 50 && positionInRange < 0.35) regime = "accumulation"
  else if (trend === "Sideways" && momentum > 50 && positionInRange > 0.65) regime = "distribution"
  else if (trend !== "Sideways") regime = "transition"

  const signal: MarketState["signal"] = trend === "Trending Up" && momentum >= 55 ? "Buy" : trend === "Trending Down" && momentum <= 45 ? "Sell" : "Hold"
  const evidence: string[] = []
  if (ema8 !== null && ema21 !== null) evidence.push(`EMA 8 is ${ema8 > ema21 ? "above" : "below"} EMA 21`)
  if (rsiValue !== null) evidence.push(`RSI is ${rsiValue.toFixed(1)}`)
  if (macdState.value !== null && macdState.signal !== null) evidence.push(`MACD is ${macdState.value > macdState.signal ? "above" : "below"} its signal line`)
  if (vol !== null) evidence.push(`Annualised volatility is ${vol.toFixed(1)}%`)

  const confidence = Math.round(Math.min(95, 50 + Math.abs(momentum - 50) * 0.7 + (trend === "Sideways" ? 0 : 12)))

  return {
    symbol: symbol.toUpperCase(), timestamp: Date.now(), price, change24h, volume24h,
    signal, trend, regime, momentum, volatility: vol ?? 0, confidence,
    indicators: { rsi: rsiValue, stochasticRsi: null, ema8, ema21, macd: macdState.value, macdSignal: macdState.signal, atr: atrValue, volatility: vol },
    supportResistance: { support1: low, support2: low - range * 0.25, resistance1: high, resistance2: high + range * 0.25 },
    evidence,
    invalidation: signal === "Buy" ? `Close below ${low.toFixed(2)}` : signal === "Sell" ? `Close above ${high.toFixed(2)}` : `Break outside ${low.toFixed(2)}–${high.toFixed(2)} range`,
  }
}
