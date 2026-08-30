import type { CalibrationBin } from "./calibration"

export interface CalibratedConfidence {
  raw: number
  calibrated: number
  sampleSize: number
  method: "empirical" | "prior"
}

export function calibrateConfidence(raw: number, bins: CalibrationBin[]): CalibratedConfidence {
  const r = Math.max(0, Math.min(100, raw))
  const bin = bins.find((b, index) => {
    const m = b.range.match(/(\d+)-(\d+)%/)
    if (!m) return false
    const lo = Number(m[1])
    const hi = Number(m[2])
    return r >= lo && (index === bins.length - 1 ? r <= hi : r < hi)
  })

  if (!bin || bin.forecasts < 10) {
    return { raw: r, calibrated: r, sampleSize: bin?.forecasts ?? 0, method: "prior" }
  }

  const shrink = bin.forecasts / (bin.forecasts + 25)
  const calibrated = Math.round((r * (1 - shrink) + bin.accuracy * shrink) * 10) / 10
  return { raw: r, calibrated, sampleSize: bin.forecasts, method: "empirical" }
}
