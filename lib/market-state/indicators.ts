import type { OHLCVBar } from "./types"

export function sma(values: number[], length: number): number | null {
  if (values.length < length || length <= 0) return null
  const slice = values.slice(-length)
  return slice.reduce((sum, value) => sum + value, 0) / length
}

export function ema(values: number[], length: number): number | null {
  if (values.length < length || length <= 0) return null
  const k = 2 / (length + 1)
  let result = sma(values.slice(0, length), length)!
  for (let i = length; i < values.length; i++) result = values[i] * k + result * (1 - k)
  return result
}

export function rsi(values: number[], length = 14): number | null {
  if (values.length < length + 1) return null
  let gain = 0
  let loss = 0
  for (let i = 1; i <= length; i++) {
    const change = values[i] - values[i - 1]
    gain += Math.max(change, 0)
    loss += Math.max(-change, 0)
  }
  gain /= length
  loss /= length
  for (let i = length + 1; i < values.length; i++) {
    const change = values[i] - values[i - 1]
    gain = (gain * (length - 1) + Math.max(change, 0)) / length
    loss = (loss * (length - 1) + Math.max(-change, 0)) / length
  }
  if (loss === 0) return 100
  return 100 - 100 / (1 + gain / loss)
}

export function atr(bars: OHLCVBar[], length = 14): number | null {
  if (bars.length < length + 1) return null
  const trs: number[] = []
  for (let i = 1; i < bars.length; i++) {
    const previousClose = bars[i - 1].close
    trs.push(Math.max(bars[i].high - bars[i].low, Math.abs(bars[i].high - previousClose), Math.abs(bars[i].low - previousClose)))
  }
  return sma(trs, length)
}

export function macd(values: number[], fast = 12, slow = 26, signalLength = 9) {
  if (values.length < slow + signalLength) return { value: null, signal: null }
  const macdValues: number[] = []
  for (let i = slow; i <= values.length; i++) {
    const window = values.slice(0, i)
    const fastEma = ema(window, fast)
    const slowEma = ema(window, slow)
    if (fastEma !== null && slowEma !== null) macdValues.push(fastEma - slowEma)
  }
  const value = macdValues.at(-1) ?? null
  const signal = value === null ? null : ema(macdValues, signalLength)
  return { value, signal }
}

export function volatility(values: number[], length = 20): number | null {
  if (values.length < length + 1) return null
  const returns = values.slice(-length - 1).slice(1).map((v, i) => Math.log(v / values.slice(-length - 1)[i]))
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length
  const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / returns.length
  return Math.sqrt(variance) * Math.sqrt(365) * 100
}
