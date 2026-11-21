import { NextRequest, NextResponse } from "next/server"
import { numeric } from "@/lib/utils"
import { runCrossAsset, type CrossAssetInput } from "@/lib/intelligence/cross-asset"

export const dynamic = "force-dynamic"

const QUOTE_SYMBOLS = [
  "BTC", "ETH", "GOLD", "DXY", "SPX", "NDX",
  "SOL", "BNB", "XRP", "ADA", "DOGE", "AVAX", "DOT", "LINK", "HYPE",
] as const

async function getQuote(baseUrl: string, symbol: string) {
  try {
    const url = new URL("/api/market-data-smart", baseUrl)
    url.searchParams.set("symbol", symbol)

    const response = await fetch(url, { cache: "no-store" })
    if (!response.ok) return null

    const data = await response.json()

    return {
      symbol,
      price: numeric(data.price),
      return24h: numeric(data.change24h),
      source: typeof data.source === "string" ? data.source : null,
      timestamp: numeric(data.timestamp),
    }
  } catch {
    return null
  }
}

async function getBtcDominance(): Promise<number | null> {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/global",
      { next: { revalidate: 300 } }
    )

    if (!response.ok) return null

    const data = await response.json()
    return numeric(data?.data?.market_cap_percentage?.btc)
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const quoteResults = await Promise.all(
    QUOTE_SYMBOLS.map((symbol) =>
      getQuote(request.url, symbol)
    )
  )

  const availableQuotes = quoteResults.filter(
    (quote): quote is NonNullable<typeof quote> => quote !== null
  )
  const quotes = Object.fromEntries(
    availableQuotes.map((quote) => [quote.symbol, quote])
  )

  const btcReturn = quotes.BTC?.return24h ?? null
  const ethReturn = quotes.ETH?.return24h ?? null

  const ethBtcReturn =
    btcReturn !== null &&
    ethReturn !== null &&
    1 + btcReturn / 100 > 0
      ? (((1 + ethReturn / 100) / (1 + btcReturn / 100)) - 1) * 100
      : null

  const dominance = await getBtcDominance()

  const input: CrossAssetInput = {
    btcReturn,
    ethReturn,
    btcDominance: dominance,
    ethBtcReturn,
    goldReturn: quotes.GOLD?.return24h ?? null,
    dxyReturn: quotes.DXY?.return24h ?? null,
    spxReturn: quotes.SPX?.return24h ?? null,
    nasdaqReturn: quotes.NDX?.return24h ?? null,
  }

  const breadthAssets = [
    "BTC", "ETH", "SOL", "BNB", "XRP", "ADA",
    "DOGE", "AVAX", "DOT", "LINK", "HYPE",
  ]

  const breadthReturns = breadthAssets
    .map((symbol) => quotes[symbol]?.return24h ?? null)
    .filter((value): value is number => value !== null)

  const positiveBreadth = breadthReturns.length
    ? (breadthReturns.filter((value) => value > 0).length /
        breadthReturns.length) *
      100
    : null

  const assetCoverage = Object.keys(quotes).length
  const expectedQuotes = QUOTE_SYMBOLS.length

  const dataQuality = {
    availableQuotes: assetCoverage,
    expectedQuotes,
    coveragePct: Math.round((assetCoverage / expectedQuotes) * 100),
    btcDominanceAvailable: dominance !== null,
    breadthObservations: breadthReturns.length,
  }

  return NextResponse.json(
    {
      inputs: input,
      crossAsset: runCrossAsset(input),
      breadthScore: positiveBreadth,
      breadthChangePct: null,
      dataQuality,
      quotes,
      generatedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  )
}
