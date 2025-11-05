import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    console.log("[v0] Fetching top 125 coins from CoinGecko for TradingView-style BTCD calculation...")

    // Fetch top 125 coins by market cap from CoinGecko
    // We need to make 2 requests since max per_page is 250, but we only need 125
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=125&page=1&sparkline=false&locale=en&x_cg_demo_api_key=CG-4ZiF7VzXyT4f8Ld3K9Jx7Yw2`,
      {
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      },
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API failed: ${response.status}`)
    }

    const coins = await response.json()
    console.log(`[v0] Fetched ${coins.length} coins from CoinGecko`)

    // Calculate total market cap of top 125 coins
    let totalMarketCap = 0
    let bitcoinMarketCap = 0

    for (const coin of coins) {
      if (coin.market_cap) {
        totalMarketCap += coin.market_cap

        // Find Bitcoin's market cap
        if (coin.id === "bitcoin") {
          bitcoinMarketCap = coin.market_cap
          console.log(`[v0] Bitcoin market cap: $${bitcoinMarketCap.toLocaleString()}`)
        }
      }
    }

    console.log(`[v0] Total market cap (top 125): $${totalMarketCap.toLocaleString()}`)

    // Calculate Bitcoin Dominance (TradingView style)
    const btcDominance = (bitcoinMarketCap / totalMarketCap) * 100

    console.log(`[v0] Bitcoin Dominance (TradingView methodology): ${btcDominance.toFixed(2)}%`)
    console.log(`[v0] TradingView shows: 60.55%`)
    console.log(`[v0] Difference: ${Math.abs(btcDominance - 60.55).toFixed(2)}%`)

    return NextResponse.json({
      success: true,
      btcDominance: btcDominance,
      btcDominanceFormatted: `${btcDominance.toFixed(2)}%`,
      methodology: "Top 125 coins by market cap (TradingView style)",
      bitcoinMarketCap,
      totalMarketCap,
      coinsIncluded: coins.length,
      tradingViewValue: 60.55,
      difference: Math.abs(btcDominance - 60.55),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error calculating BTCD:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
