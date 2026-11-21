import { numeric } from "@/lib/utils"

export interface DerivativesSnapshot {
  symbol: string
  fundingRate: number | null
  openInterest: number | null
  openInterestChangePct: number | null
  longShortRatio: number | null
  // Kept for API compatibility. The Binance sample endpoint is not a
  // complete rolling 24-hour liquidation total, so this remains null.
  liquidations24h: number | null
  source: string
  timestamp: number
}

const BASE = "https://fapi.binance.com"

async function get(path: string): Promise<unknown> {
  const response = await fetch(BASE + path, {
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  })

  if (!response.ok) {
    throw new Error("Binance " + response.status)
  }

  return response.json()
}

function settledValue(
  result: PromiseSettledResult<unknown>
): unknown {
  return result.status === "fulfilled" ? result.value : null
}

export async function getDerivativesSnapshot(
  symbol: string
): Promise<DerivativesSnapshot> {
  const pair = symbol.toUpperCase() + "USDT"

  const [premiumResult, oiResult, oiHistoryResult, ratioResult] =
    await Promise.allSettled([
      get("/fapi/v1/premiumIndex?symbol=" + pair),
      get("/fapi/v1/openInterest?symbol=" + pair),
      get(
        "/futures/data/openInterestHist?symbol=" +
          pair +
          "&period=1d&limit=2"
      ),
      get(
        "/futures/data/globalLongShortAccountRatio?symbol=" +
          pair +
          "&period=1h&limit=24"
      ),
    ])

  const premium = settledValue(premiumResult) as
    | Record<string, unknown>
    | null

  const oi = settledValue(oiResult) as
    | Record<string, unknown>
    | null

  const oiHistory = settledValue(oiHistoryResult)
  const ratios = settledValue(ratioResult)

  const fundingRate = numeric(premium?.lastFundingRate)
  const openInterest = numeric(oi?.openInterest)

  let openInterestChangePct: number | null = null

  if (Array.isArray(oiHistory) && oiHistory.length >= 2) {
    const previous = numeric(oiHistory[0]?.sumOpenInterest)
    const latest = numeric(oiHistory.at(-1)?.sumOpenInterest)

    if (previous !== null && latest !== null && previous > 0) {
      openInterestChangePct = ((latest - previous) / previous) * 100
    }
  }

  const longShortRatio =
    Array.isArray(ratios) && ratios.length > 0
      ? numeric(ratios.at(-1)?.longShortRatio)
      : null

  const available = [
    fundingRate,
    openInterest,
    openInterestChangePct,
    longShortRatio,
  ].some((value) => value !== null)

  return {
    symbol: symbol.toUpperCase(),
    fundingRate,
    openInterest,
    openInterestChangePct,
    longShortRatio,
    liquidations24h: null,
    source: available ? "binance-futures" : "unavailable",
    timestamp: Date.now(),
  }
}
