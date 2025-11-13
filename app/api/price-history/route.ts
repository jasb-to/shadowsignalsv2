import { NextRequest, NextResponse } from "next/server"

const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get("symbol")
  const timeframe = searchParams.get("timeframe") || "1D"

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
  }

  const cacheKey = `${symbol}-${timeframe}`
  const cached = cache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`[v0] Returning cached price history for ${symbol} ${timeframe}`)
    return NextResponse.json(cached.data)
  }

  try {
    const apiKey = process.env.TWELVE_DATA_API_KEY

    if (!apiKey) {
      console.error("[v0] TWELVE_DATA_API_KEY not configured")
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    const intervalMap: Record<string, { interval: string; outputsize: number }> = {
      "1H": { interval: "1min", outputsize: 60 },
      "4H": { interval: "15min", outputsize: 16 },
      "1D": { interval: "1h", outputsize: 24 },
      "1W": { interval: "4h", outputsize: 42 },
    }

    const config = intervalMap[timeframe] || intervalMap["1D"]

    let formattedSymbol = symbol
    if (["BTC", "ETH", "SOL", "XRP", "ADA", "DOGE", "MATIC", "DOT", "AVAX", "LINK"].includes(symbol)) {
      formattedSymbol = `${symbol}/USD`
    }

    console.log(`[v0] Fetching price history for ${formattedSymbol} with interval ${config.interval}`)

    const response = await fetch(
      `https://api.twelvedata.com/time_series?symbol=${formattedSymbol}&interval=${config.interval}&outputsize=${config.outputsize}&apikey=${apiKey}`,
      { next: { revalidate: 300 } }
    )

    if (!response.ok) {
      throw new Error(`TwelveData API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.status === "error") {
      console.error(`[v0] TwelveData error: ${data.message}`)
      return NextResponse.json({ error: data.message }, { status: 400 })
    }

    const chartData = (data.values || []).reverse().map((item: any) => ({
      time: new Date(item.datetime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: timeframe === "1W" ? undefined : "2-digit",
        month: timeframe === "1W" ? "short" : undefined,
        day: timeframe === "1W" ? "numeric" : undefined,
      }),
      price: parseFloat(item.close),
      volume: parseFloat(item.volume || 0),
    }))

    const result = {
      symbol,
      timeframe,
      data: chartData,
    }

    cache.set(cacheKey, { data: result, timestamp: Date.now() })

    return NextResponse.json(result)
  } catch (error) {
    console.error(`[v0] Error fetching price history:`, error)
    return NextResponse.json({ error: "Failed to fetch price history" }, { status: 500 })
  }
}
