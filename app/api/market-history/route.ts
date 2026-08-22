import { type NextRequest, NextResponse } from "next/server"

const SYMBOL_MAP: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BNB: "binancecoin",
  XRP: "ripple",
  ADA: "cardano",
  DOGE: "dogecoin",
}

const INTERVAL_DAYS: Record<string, number> = { "1d": 1, "4h": 1, "1h": 1, "15m": 1 }

export async function GET(req: NextRequest) {
  const symbol = (req.nextUrl.searchParams.get("symbol") || "BTC").toUpperCase()
  const interval = req.nextUrl.searchParams.get("interval") || "1h"
  const coinId = SYMBOL_MAP[symbol]
  if (!coinId) return NextResponse.json({ error: `Unsupported crypto symbol: ${symbol}` }, { status: 400 })

  // CoinGecko's market_chart gives reliable OHLC history without fabricating candles.
  const days = INTERVAL_DAYS[interval] ?? 1
  const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=${interval === "1d" ? "daily" : "hourly"}`
  const response = await fetch(url, { cache: "no-store" })
  if (!response.ok) return NextResponse.json({ error: "Historical market data unavailable" }, { status: 503 })
  const data = await response.json()

  const volumeByTs = new Map<number, number>((data.total_volumes || []).map((v: [number, number]) => [v[0], v[1]]))
  const bars = (data.ohlc || []).map((row: [number, number, number, number, number]) => ({
    timestamp: row[0], open: row[1], high: row[2], low: row[3], close: row[4],
    volume: volumeByTs.get(row[0]) ?? 0,
  }))

  return NextResponse.json({ symbol, interval, bars, source: "CoinGecko", timestamp: Date.now() })
}
