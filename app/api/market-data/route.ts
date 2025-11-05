import { type NextRequest, NextResponse } from "next/server"

interface MarketDataSource {
  name: string
  fetchData: (symbol: string) => Promise<any>
  rateLimit: number // requests per minute
}

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
const CACHE_DURATION = 300000 // 5 minutes

const apiStatus = new Map<string, APIStatus>()

const apiUsage = new Map<string, { count: number; resetTime: number }>()

function isAPIDisabled(apiName: string): boolean {
  const status = apiStatus.get(apiName)
  if (!status || !status.disabled) return false

  const now = Date.now()
  if (now > status.disabledUntil) {
    // Re-enable the API
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
  const cached = dataCache.get(symbol)
  if (!cached) return null

  const now = Date.now()
  if (now - cached.timestamp < CACHE_DURATION) {
    console.log(`[v0] Returning cached data for ${symbol}`)
    return cached.data
  }

  // Cache expired
  dataCache.delete(symbol)
  return null
}

function setCachedData(symbol: string, data: any) {
  dataCache.set(symbol, {
    data,
    timestamp: Date.now(),
  })
}

async function fetchFromTwelveData(symbol: string) {
  const apiKey = process.env.TWELVE_DATA_API_KEY

  if (!apiKey) throw new Error("Twelve Data API key not configured")

  let formattedSymbol = symbol.toUpperCase()

  // Commodity mappings
  const commodityMap: Record<string, string> = {
    GOLD: "XAU/USD",
    SILVER: "XAG/USD",
    OIL: "USOIL",
    CRUDE: "USOIL",
    CRUDEOIL: "USOIL",
    BRENT: "UKOIL",
    NATGAS: "NG",
    NATURALGAS: "NG",
    COPPER: "HG",
    PLATINUM: "XPT/USD",
    PALLADIUM: "XPD/USD",
  }

  // Check if it's a commodity
  if (commodityMap[formattedSymbol]) {
    formattedSymbol = commodityMap[formattedSymbol]
  }
  // Check if it's a crypto that needs /USD suffix
  else if (["BTC", "ETH", "SOL", "USDT", "BNB", "XRP", "ADA", "DOGE", "MATIC", "DOT"].includes(formattedSymbol)) {
    formattedSymbol = `${formattedSymbol}/USD`
  }
  // Otherwise use the symbol as-is (for stocks like AAPL, TSLA, etc.)

  const response = await fetch(`https://api.twelvedata.com/quote?symbol=${formattedSymbol}&apikey=${apiKey}`, {
    cache: "no-store",
  })

  if (!response.ok) throw new Error("Twelve Data API failed")

  const data = await response.json()

  if (data.status === "error") throw new Error(data.message || "Twelve Data error")

  return {
    source: "Twelve Data",
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
    MATIC: "matic-network",
    DOT: "polkadot",
  }

  const coinId = symbolMap[symbol.toUpperCase()] || symbol.toLowerCase().replace("usdt", "").replace("usd", "")

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

async function fetchFromCoinPaprika(symbol: string) {
  const searchResponse = await fetch(
    `https://api.coinpaprika.com/v1/search?q=${symbol.replace("USDT", "").replace("USD", "")}`,
    { cache: "no-store" },
  )

  if (searchResponse.status === 402) {
    disableAPI("CoinPaprika", 24 * 60 * 60 * 1000, "Monthly rate limit exceeded")
    throw new Error("CoinPaprika monthly limit exceeded")
  }

  if (!searchResponse.ok) throw new Error("CoinPaprika search failed")

  const searchData = await searchResponse.json()
  const coin = searchData.currencies?.[0]

  if (!coin) throw new Error("Symbol not found on CoinPaprika")

  const tickerResponse = await fetch(`https://api.coinpaprika.com/v1/tickers/${coin.id}`, { cache: "no-store" })

  if (tickerResponse.status === 402) {
    disableAPI("CoinPaprika", 24 * 60 * 60 * 1000, "Monthly rate limit exceeded")
    throw new Error("CoinPaprika monthly limit exceeded")
  }

  if (!tickerResponse.ok) throw new Error("CoinPaprika ticker failed")

  const tickerData = await tickerResponse.json()

  return {
    source: "CoinPaprika",
    symbol: symbol.toUpperCase(),
    price: tickerData.quotes.USD.price,
    change24h: tickerData.quotes.USD.percent_change_24h || 0,
    volume24h: tickerData.quotes.USD.volume_24h || 0,
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

    const sources: MarketDataSource[] = [
      { name: "TwelveData", fetchData: fetchFromTwelveData, rateLimit: 30 },
      { name: "CoinGecko", fetchData: fetchFromCoinGecko, rateLimit: 40 },
      { name: "CoinPaprika", fetchData: fetchFromCoinPaprika, rateLimit: 100 },
    ]

    let lastError: Error | null = null

    for (const source of sources) {
      if (isAPIDisabled(source.name)) {
        const status = apiStatus.get(source.name)
        console.log(`[v0] ${source.name} is disabled: ${status?.reason}`)
        continue
      }

      if (canUseAPI(source.name, source.rateLimit)) {
        try {
          console.log(`[v0] Fetching ${symbol} from ${source.name}`)
          const data = await source.fetchData(symbol)

          setCachedData(symbol, data)

          return NextResponse.json(data)
        } catch (error) {
          console.log(`[v0] ${source.name} failed, trying next source:`, error)
          lastError = error as Error
          continue
        }
      } else {
        console.log(`[v0] ${source.name} rate limit reached, trying next source`)
      }
    }

    return NextResponse.json(
      {
        error: "Unable to fetch market data from any source",
        details: lastError?.message,
      },
      { status: 503 },
    )
  } catch (error) {
    console.error("[v0] Market data error:", error)
    return NextResponse.json({ error: "Failed to fetch market data" }, { status: 500 })
  }
}
