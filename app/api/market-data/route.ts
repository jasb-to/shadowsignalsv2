import { type NextRequest, NextResponse } from "next/server"

interface CachedData {
  data: any
  timestamp: number
}

interface APIStatus {
  disabled: boolean
  disabledUntil: number
  reason?: string
}

const dataCache = new Map<string, CachedData>()
const CACHE_DURATION = 600000 // 10 minutes (increased from 5)

const apiStatus = new Map<string, APIStatus>()
const apiUsage = new Map<string, { count: number; resetTime: number }>()

const FALLBACK_DATA: Record<string, any> = {
  BTC: { symbol: "BTC", price: 87500, change24h: 1.2, volume24h: 25000000000, source: "Cached" },
  ETH: { symbol: "ETH", price: 3200, change24h: 0.8, volume24h: 12000000000, source: "Cached" },
  SOL: { symbol: "SOL", price: 195, change24h: 2.1, volume24h: 3500000000, source: "Cached" },
  AAPL: { symbol: "AAPL", price: 185, change24h: 0.3, volume24h: 45000000, source: "Cached" },
  TSLA: { symbol: "TSLA", price: 245, change24h: -0.5, volume24h: 85000000, source: "Cached" },
  "EUR/USD": { symbol: "EUR/USD", price: 1.08, change24h: 0.1, volume24h: 0, source: "Cached" },
}

function isAPIDisabled(apiName: string): boolean {
  const status = apiStatus.get(apiName)
  if (!status || !status.disabled) return false

  const now = Date.now()
  if (now > status.disabledUntil) {
    apiStatus.delete(apiName)
    return false
  }

  return true
}

function disableAPI(apiName: string, durationMs: number, reason: string) {
  console.log(`[v0] Disabling ${apiName} for ${durationMs / 1000 / 60} minutes: ${reason}`)
  apiStatus.set(apiName, {
    disabled: true,
    disabledUntil: Date.now() + durationMs,
    reason,
  })
}

function canUseAPI(apiName: string, rateLimit: number): boolean {
  if (isAPIDisabled(apiName)) {
    return false
  }

  const now = Date.now()
  const usage = apiUsage.get(apiName)

  if (!usage || now > usage.resetTime) {
    apiUsage.set(apiName, { count: 1, resetTime: now + 60000 })
    return true
  }

  if (usage.count < rateLimit) {
    usage.count++
    return true
  }

  return false
}

function getCachedData(symbol: string): any | null {
  const cached = dataCache.get(symbol.toUpperCase())
  if (!cached) return null

  const now = Date.now()
  if (now - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  return null
}

function setCachedData(symbol: string, data: any) {
  dataCache.set(symbol.toUpperCase(), {
    data,
    timestamp: Date.now(),
  })
}

function getStaleCachedData(symbol: string): any | null {
  const cached = dataCache.get(symbol.toUpperCase())
  if (cached) {
    return { ...cached.data, stale: true }
  }
  return null
}

async function fetchFromTwelveData(symbol: string) {
  const apiKey = process.env.TWELVE_DATA_API_KEY
  if (!apiKey) throw new Error("Twelve Data API key not configured")

  let formattedSymbol = symbol.toUpperCase()

  const commodityMap: Record<string, string> = {
    GOLD: "XAU/USD",
    SILVER: "XAG/USD",
    OIL: "USOIL",
    CRUDE: "USOIL",
  }

  if (commodityMap[formattedSymbol]) {
    formattedSymbol = commodityMap[formattedSymbol]
  } else if (["BTC", "ETH", "SOL", "USDT", "BNB", "XRP", "ADA", "DOGE", "MATIC", "DOT"].includes(formattedSymbol)) {
    formattedSymbol = `${formattedSymbol}/USD`
  }

  const response = await fetch(`https://api.twelvedata.com/quote?symbol=${formattedSymbol}&apikey=${apiKey}`, {
    cache: "no-store",
  })

  if (!response.ok) throw new Error("Twelve Data API failed")

  const data = await response.json()

  if (data.status === "error") {
    if (data.message?.includes("API credits")) {
      disableAPI("TwelveData", 60000, "Rate limit exceeded")
    }
    throw new Error(data.message || "Twelve Data error")
  }

  return {
    source: "TwelveData",
    symbol: symbol.toUpperCase(),
    price: Number.parseFloat(data.close),
    change24h: Number.parseFloat(data.percent_change) || 0,
    volume24h: Number.parseFloat(data.volume) || 0,
    timestamp: Date.now(),
  }
}

async function fetchFromCoinGecko(symbol: string) {
  const symbolMap: Record<string, string> = {
    BTC: "bitcoin",
    ETH: "ethereum",
    SOL: "solana",
    USDT: "tether",
    BNB: "binancecoin",
    XRP: "ripple",
    ADA: "cardano",
    DOGE: "dogecoin",
  }

  const coinId = symbolMap[symbol.toUpperCase()]
  if (!coinId) throw new Error("Symbol not supported on CoinGecko")

  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`,
    { cache: "no-store" },
  )

  if (response.status === 429) {
    disableAPI("CoinGecko", 60 * 60 * 1000, "Rate limit exceeded (429)")
    throw new Error("CoinGecko rate limit exceeded")
  }

  if (!response.ok) throw new Error("CoinGecko API failed")

  const data = await response.json()
  const coinData = data[coinId]

  if (!coinData) throw new Error("Symbol not found on CoinGecko")

  return {
    source: "CoinGecko",
    symbol: symbol.toUpperCase(),
    price: coinData.usd,
    change24h: coinData.usd_24h_change || 0,
    volume24h: coinData.usd_24h_vol || 0,
    timestamp: Date.now(),
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const symbol = searchParams.get("symbol")

    if (!symbol) {
      return NextResponse.json({ error: "Symbol parameter is required" }, { status: 400 })
    }

    const cachedData = getCachedData(symbol)
    if (cachedData) {
      return NextResponse.json(cachedData)
    }

    const sources = [
      { name: "TwelveData", fetchData: fetchFromTwelveData, rateLimit: 6 },
      { name: "CoinGecko", fetchData: fetchFromCoinGecko, rateLimit: 25 },
    ]

    let lastError: Error | null = null

    for (const source of sources) {
      if (isAPIDisabled(source.name)) {
        continue
      }

      if (canUseAPI(source.name, source.rateLimit)) {
        try {
          const data = await source.fetchData(symbol)
          setCachedData(symbol, data)
          return NextResponse.json(data)
        } catch (error) {
          lastError = error as Error
          continue
        }
      }
    }

    const staleData = getStaleCachedData(symbol)
    if (staleData) {
      return NextResponse.json(staleData)
    }

    const fallback = FALLBACK_DATA[symbol.toUpperCase()]
    if (fallback) {
      return NextResponse.json({ ...fallback, timestamp: Date.now(), source: "Fallback" })
    }

    return NextResponse.json({ error: "Unable to fetch market data", details: lastError?.message }, { status: 503 })
  } catch (error) {
    console.error("[v0] Market data error:", error)
    return NextResponse.json({ error: "Failed to fetch market data" }, { status: 500 })
  }
}
