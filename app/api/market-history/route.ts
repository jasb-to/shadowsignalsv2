import { type NextRequest, NextResponse } from "next/server"

const SYMBOL_MAP: Record<string, string> = { BTC: "bitcoin", ETH: "ethereum", SOL: "solana", BNB: "binancecoin", XRP: "ripple", ADA: "cardano", DOGE: "dogecoin" }

export const maxDuration = 15

export async function GET(req: NextRequest) {
  const symbol = (req.nextUrl.searchParams.get("symbol") || "BTC").toUpperCase()
  const interval = req.nextUrl.searchParams.get("interval") || "1h"
  const coinId = SYMBOL_MAP[symbol]
  if (!coinId) return NextResponse.json({ error: `Unsupported crypto symbol: ${symbol}` }, { status: 400 })

  const days = Math.max(1, Math.min(30, Number(req.nextUrl.searchParams.get("days") || 1)))
  // We need enough observations for RSI/EMA/MACD. CoinGecko returns too few
  // points for multi-day requests when explicitly asking for daily data.
  // Keep requests <= 7 days hourly; use daily only for longer history.
  const apiInterval = days <= 7 ? "hourly" : "daily"
  const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=${apiInterval}`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(url, { cache: "no-store", signal: controller.signal })
    if (!response.ok) return NextResponse.json({ error: `Historical market data unavailable (${response.status})` }, { status: 503 })
    const data = await response.json()
    const closes = data.prices || []
    const volume = data.total_volumes || []
    const bars = closes.map((p: [number, number], index: number) => {
      const previous = closes[index - 1]?.[1] ?? p[1]
      return { timestamp: p[0], open: previous, high: Math.max(previous, p[1]), low: Math.min(previous, p[1]), close: p[1], volume: volume[index]?.[1] ?? 0 }
    })
    if (bars.length < 30) return NextResponse.json({ error: `Insufficient historical market data (${bars.length} observations)` }, { status: 503 })
    return NextResponse.json({ symbol, interval, bars, source: "CoinGecko", timestamp: Date.now() })
  } catch (error) {
    const message = error instanceof DOMException && error.name === "AbortError" ? "Market data provider timed out" : "Market data provider unavailable"
    return NextResponse.json({ error: message }, { status: 503 })
  } finally { clearTimeout(timeout) }
}
