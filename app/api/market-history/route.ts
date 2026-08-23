import { type NextRequest, NextResponse } from "next/server"

const CRYPTO_MAP: Record<string, string> = { BTC: "bitcoin", ETH: "ethereum", SOL: "solana", BNB: "binancecoin", XRP: "ripple", ADA: "cardano", DOGE: "dogecoin", USDT: "tether" }
const COMMODITY_MAP: Record<string, string> = { GOLD: "XAU/USD", SILVER: "XAG/USD", OIL: "USOIL", CRUDE: "USOIL" }

function twelveSymbol(symbol: string) {
  const upper = symbol.toUpperCase()
  if (COMMODITY_MAP[upper]) return COMMODITY_MAP[upper]
  if (["BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE", "USDT"].includes(upper)) return `${upper}/USD`
  return upper
}

async function cryptoHistory(symbol: string, days: number) {
  const coinId = CRYPTO_MAP[symbol]
  if (!coinId) return null
  const apiInterval = days <= 7 ? "hourly" : "daily"
  const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=${apiInterval}`
  const response = await fetch(url, { cache: "no-store" })
  if (!response.ok) throw new Error(`Historical market data unavailable (${response.status})`)
  const data = await response.json()
  const closes = data.prices || []
  const volume = data.total_volumes || []
  return closes.map((p: [number, number], index: number) => { const previous = closes[index - 1]?.[1] ?? p[1]; return { timestamp: p[0], open: previous, high: Math.max(previous, p[1]), low: Math.min(previous, p[1]), close: p[1], volume: volume[index]?.[1] ?? 0 } })
}

async function twelveDataHistory(symbol: string, interval: string, outputsize: number) {
  const apiKey = process.env.TWELVE_DATA_API_KEY
  if (!apiKey) throw new Error("Twelve Data API key not configured")
  const tdInterval = interval === "4h" ? "4h" : interval === "1d" || interval === "24h" ? "1day" : interval === "7d" ? "1week" : "1h"
  const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(twelveSymbol(symbol))}&interval=${tdInterval}&outputsize=${Math.min(outputsize, 500)}&apikey=${apiKey}`
  const response = await fetch(url, { cache: "no-store" })
  if (!response.ok) throw new Error("Twelve Data historical request failed")
  const data = await response.json()
  if (data.status === "error" || !Array.isArray(data.values)) throw new Error(data.message || "Historical data unavailable")
  return data.values.reverse().map((v: any, index: number) => ({ timestamp: new Date(v.datetime).getTime(), open: Number(v.open), high: Number(v.high), low: Number(v.low), close: Number(v.close), volume: Number(v.volume) || 0 }))
}

export const maxDuration = 15

export async function GET(req: NextRequest) {
  const symbol = (req.nextUrl.searchParams.get("symbol") || "BTC").toUpperCase()
  const interval = req.nextUrl.searchParams.get("interval") || "1h"
  const days = Math.max(1, Math.min(30, Number(req.nextUrl.searchParams.get("days") || 7)))
  try {
    let bars = await cryptoHistory(symbol, days)
    let source = "CoinGecko"
    if (!bars) { bars = await twelveDataHistory(symbol, interval, days <= 7 ? 200 : 100); source = "TwelveData" }
    if (!Array.isArray(bars) || bars.length < 30) return NextResponse.json({ error: `Insufficient historical market data (${bars?.length ?? 0} observations)` }, { status: 503 })
    return NextResponse.json({ symbol, interval, bars, source, timestamp: Date.now() })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Market data provider unavailable"
    return NextResponse.json({ error: message }, { status: 503 })
  }
}
