import type { OHLCVBar } from "./types"

export function sma(values: number[], length: number): number | null {
  if (values.length < length || length <= 0) return null
  return values.slice(-length).reduce((sum, value) => sum + value, 0) / length
}

export function ema(values: number[], length: number): number | null {
  if (values.length < length || length <= 0) return null
  const multiplier = 2 / (length + 1)
  let result = sma(values.slice(0, length), length)!
  for (let i = length; i < values.length; i++) {
    result = values[i] * multiplier + result * (1 - multiplier)
  }
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

export function stochasticRsi(
  values: number[],
  rsiLength = 14,
  stochLength = 14
): number | null {
  const rsis: number[] = []

  for (let i = rsiLength; i < values.length; i++) {
    const value = rsi(values.slice(0, i + 1), rsiLength)
    if (value !== null) rsis.push(value)
  }

  if (rsis.length < stochLength) return null

  const recent = rsis.slice(-stochLength)
  const min = Math.min(...recent)
  const max = Math.max(...recent)

  return max === min ? 50 : ((recent.at(-1)! - min) / (max - min)) * 100
}

export function atr(bars: OHLCVBar[], length = 14): number | null {
  if (bars.length < length + 1) return null

  const trueRanges: number[] = []

  for (let i = 1; i < bars.length; i++) {
    const previousClose = bars[i - 1].close
    trueRanges.push(
      Math.max(
        bars[i].high - bars[i].low,
        Math.abs(bars[i].high - previousClose),
        Math.abs(bars[i].low - previousClose)
      )
    )
  }

  return sma(trueRanges, length)
}

export function macd(
  values: number[],
  fast = 12,
  slow = 26,
  signalLength = 9
) {
  if (values.length < slow + signalLength) {
    return { value: null, signal: null }
  }

  const macdValues: number[] = []

  for (let i = slow; i <= values.length; i++) {
    const window = values.slice(0, i)
    const fastEma = ema(window, fast)
    const slowEma = ema(window, slow)

    if (fastEma !== null && slowEma !== null) {
      macdValues.push(fastEma - slowEma)
    }
  }

  const value = macdValues.at(-1) ?? null

  return {
    value,
    signal: value === null ? null : ema(macdValues, signalLength),
  }
}

/**
 * Annualised standard deviation of log returns, expressed as a percentage.
 * periodsPerYear must match the candle interval (e.g. 8760 for 1h bars).
 */
export function volatility(
  values: number[],
  length = 20,
  periodsPerYear = 365
): number | null {
  if (
    values.length < length + 1 ||
    length <= 0 ||
    !Number.isFinite(periodsPerYear) ||
    periodsPerYear <= 0
  ) {
    return null
  }

  const window = values.slice(-length - 1)
  if (window.some((value) => !Number.isFinite(value) || value <= 0)) {
    return null
  }

  const returns = window
    .slice(1)
    .map((value, index) => Math.log(value / window[index]))

  const mean = returns.reduce((sum, value) => sum + value, 0) / returns.length
  const variance =
    returns.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
    returns.length

  const result = Math.sqrt(variance) * Math.sqrt(periodsPerYear) * 100

  return Number.isFinite(result) ? result : null
}
