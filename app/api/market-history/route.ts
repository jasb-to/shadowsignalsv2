import { type NextRequest, NextResponse } from "next/server"
import { numeric } from "@/lib/utils"
import type { OHLCVBar } from "@/lib/market-state/types"

const CRYPTO_SYMBOLS = new Set([
  "BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE", "AVAX", "DOT",
  "LINK", "MATIC", "PEPE", "SHIB", "WIF", "BONK", "AAVE", "UNI",
  "ARB", "OP", "HYPE",
])

const CRYPTO_TWELVE_SYMBOLS = new Set([
  "BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE",
])

const COMMODITY_MAP: Record<string, string> = {
  GOLD: "XAU/USD",
  SILVER: "XAG/USD",
  OIL: "USOIL",
  CRUDE: "USOIL",
}

const INTERVALS: Record<string, { binance: string; twelve: string; barsPerDay: number }> = {
  "1h": { binance: "1h", twelve: "1h", barsPerDay: 24 },
  "4h": { binance: "4h", twelve: "4h", barsPerDay: 6 },
  "1d": { binance: "1d", twelve: "1day", barsPerDay: 1 },
  "7d": { binance: "1w", twelve: "1week", barsPerDay: 1 / 7 },
  "1m": { binance: "1M", twelve: "1month", barsPerDay: 1 / 30 },
}

const CACHE_5M = { next: { revalidate: 300 } as const }

function clampLimit(value: number, interval: string, days: number): number {
  const barsPerDay = INTERVALS[interval].barsPerDay
  const computed = Math.ceil(days * barsPerDay)
  const fallback = interval === "7d" ? 104 : interval === "1m" ? 60 : 200
  return Math.max(30, Math.min(1000, Number.isFinite(value) ? value : Math.max(computed, fallback)))
}

function twelveSymbol(symbol: string): string {
  const upper = symbol.toUpperCase()
  if (COMMODITY_MAP[upper]) return COMMODITY_MAP[upper]
  if (CRYPTO_TWELVE_SYMBOLS.has(upper)) return upper + "/USD"
  return upper
}

async function fetchBinanceHistory(
  symbol: string,
  interval: string,
  limit: number
): Promise<OHLCVBar[] | null> {
  if (!CRYPTO_SYMBOLS.has(symbol)) return null

  const pair = symbol + "USDT"
  const url =
    "https://api.binance.com/api/v3/klines?symbol=" +
    encodeURIComponent(pair) +
    "&interval=" +
    encodeURIComponent(INTERVALS[interval].binance) +
    "&limit=" +
    String(limit)

  const response = await fetch(url, CACHE_5M)
  if (!response.ok) {
    throw new Error("Binance historical request failed: " + response.status)
  }

  const rows: unknown = await response.json()
  if (!Array.isArray(rows)) throw new Error("Binance returned invalid candles")

  const bars = rows.flatMap((row): OHLCVBar[] => {
    if (!Array.isArray(row) || row.length < 6) return []

    const timestamp = numeric(row[0])
    const closeTimestamp = numeric(row[6])
    const open = numeric(row[1])
    const high = numeric(row[2])
    const low = numeric(row[3])
    const close = numeric(row[4])
    const volume = numeric(row[5])

    if (
      timestamp === null ||
      closeTimestamp === null ||
      closeTimestamp >= Date.now() ||
      open === null ||
      high === null ||
      low === null ||
      close === null ||
      volume === null ||
      open <= 0 ||
      high <= 0 ||
      low <= 0 ||
      close <= 0 ||
      volume < 0
    ) {
      return []
    }

    return [{ timestamp, open, high, low, close, volume }]
  })

  return bars
}

function nextCandleOpenTime(timestamp: number, interval: string): number {
  const end = new Date(timestamp)

  switch (interval) {
    case "1h":
      end.setUTCHours(end.getUTCHours() + 1)
      break
    case "4h":
      end.setUTCHours(end.getUTCHours() + 4)
      break
    case "1d":
      end.setUTCDate(end.getUTCDate() + 1)
      break
    case "7d":
      end.setUTCDate(end.getUTCDate() + 7)
      break
    case "1m":
      end.setUTCMonth(end.getUTCMonth() + 1)
      break
  }

  return end.getTime()
}

async function fetchTwelveDataHistory(
  symbol: string,
  interval: string,
  limit: number
): Promise<OHLCVBar[]> {
  const apiKey = process.env.TWELVE_DATA_API_KEY
  if (!apiKey) throw new Error("Twelve Data API key is not configured")

  const apiInterval = INTERVALS[interval].twelve
  const url =
    "https://api.twelvedata.com/time_series?symbol=" +
    encodeURIComponent(twelveSymbol(symbol)) +
    "&interval=" +
    encodeURIComponent(apiInterval) +
    "&outputsize=" +
    String(Math.min(limit, 500)) +
    "&timezone=UTC" +
    "&apikey=" +
    encodeURIComponent(apiKey)

  const response = await fetch(url, CACHE_5M)
  if (!response.ok) {
    throw new Error("Twelve Data request failed: " + response.status)
  }

  const data: unknown = await response.json()
  if (
    !data ||
    typeof data !== "object" ||
    (data as { status?: string }).status === "error" ||
    !Array.isArray((data as { values?: unknown[] }).values)
  ) {
    const message =
      typeof (data as { message?: unknown })?.message === "string"
        ? (data as { message: string }).message
        : "Twelve Data returned no historical candles"
    throw new Error(message)
  }

  const values = (data as { values: Array<Record<string, unknown>> }).values

  return values
    .map((row): OHLCVBar | null => {
      const timestamp =
        typeof row.datetime === "string"
          ? new Date(row.datetime).getTime()
          : NaN

      const open = numeric(row.open)
      const high = numeric(row.high)
      const low = numeric(row.low)
      const close = numeric(row.close)
      const volume = numeric(row.volume) ?? 0

      if (
        !Number.isFinite(timestamp) ||
        nextCandleOpenTime(timestamp, interval) > Date.now() ||
        open === null ||
        high === null ||
        low === null ||
        close === null ||
        open <= 0 ||
        high <= 0 ||
        low <= 0 ||
        close <= 0
      ) {
        return null
      }

      return { timestamp, open, high, low, close, volume }
    })
    .filter((bar): bar is OHLCVBar => bar !== null)
    .sort((a, b) => a.timestamp - b.timestamp)
}

export const dynamic = "force-dynamic"
export const maxDuration = 15

export async function GET(req: NextRequest) {
  const rawSymbol = req.nextUrl.searchParams.get("symbol") || "BTC"
  const symbol = rawSymbol.trim().toUpperCase()
  const rawInterval = req.nextUrl.searchParams.get("interval") || "1h"
  const interval = rawInterval === "1w" ? "7d" : rawInterval === "1M" ? "1m" : rawInterval

  if (!/^[A-Z0-9][A-Z0-9._:/-]{0,31}$/.test(symbol)) {
    return NextResponse.json({ error: "Invalid symbol" }, { status: 400 })
  }

  if (!Object.hasOwn(INTERVALS, interval)) {
    return NextResponse.json(
      { error: "Unsupported interval", supported: Object.keys(INTERVALS) },
      { status: 400 }
    )
  }

  const daysValue = numeric(req.nextUrl.searchParams.get("days"))
  const days = Math.max(1, Math.min(3650, daysValue ?? 7))
  const limitValue = numeric(req.nextUrl.searchParams.get("limit"))
  const limit = clampLimit(limitValue ?? NaN, interval, days)

  try {
    let bars: OHLCVBar[] | null = null
    let source = "Binance"

    try {
      bars = await fetchBinanceHistory(symbol, interval, limit)
    } catch (error) {
      console.warn(
        "Binance history unavailable for " + symbol + ":",
        error instanceof Error ? error.message : "unknown error"
      )
    }

    if (!bars || bars.length < 30) {
      source = "TwelveData"
      bars = await fetchTwelveDataHistory(symbol, interval, limit)
    }

    if (bars.length < 30) {
      return NextResponse.json(
        {
          error: "Insufficient historical OHLCV data",
          symbol,
          interval,
          observations: bars.length,
          minimum: 30,
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      {
        symbol,
        interval,
        bars,
        source,
        timestamp: Date.now(),
      },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch (error) {
    console.error("Market history error:", {
      symbol,
      interval,
      error: error instanceof Error ? error.message : "unknown error",
    })

    return NextResponse.json(
      { error: "Historical market data unavailable", symbol, interval },
      { status: 503 }
    )
  }
}
