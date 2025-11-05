import { NextResponse } from "next/server"

export async function GET() {
  const results: any = {
    tradingview_target: 60.55,
    sources: [],
  }

  // Test 1: ADI API (mentioned in search results)
  try {
    const adiResponse = await fetch("https://api.adiinvestments.net/v1/crypto/dominance", { cache: "no-store" })
    if (adiResponse.ok) {
      const adiData = await adiResponse.json()
      const btcDominance = adiData.btc || adiData.bitcoin || adiData.BTC
      results.sources.push({
        name: "ADI API",
        value: btcDominance,
        difference: Math.abs(60.55 - btcDominance).toFixed(2),
        status: "success",
      })
    }
  } catch (error: any) {
    results.sources.push({
      name: "ADI API",
      status: "failed",
      error: error.message,
    })
  }

  // Test 2: Calculate from CoinGecko top 125 coins (TradingView methodology)
  try {
    // Get Bitcoin market cap
    const btcResponse = await fetch(
      "https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&community_data=false&developer_data=false",
      { cache: "no-store" },
    )
    const btcData = await btcResponse.json()
    const btcMarketCap = btcData.market_data?.market_cap?.usd || 0

    // Get top 125 coins by market cap
    const top125Response = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=125&page=1&sparkline=false",
      { cache: "no-store" },
    )
    const top125Data = await top125Response.json()

    // Calculate total market cap of top 125
    const totalMarketCap = top125Data.reduce((sum: number, coin: any) => sum + (coin.market_cap || 0), 0)

    const btcDominance = (btcMarketCap / totalMarketCap) * 100

    results.sources.push({
      name: "CoinGecko Top 125 (TradingView Method)",
      value: Number.parseFloat(btcDominance.toFixed(2)),
      difference: Math.abs(60.55 - btcDominance).toFixed(2),
      status: "success",
      details: {
        btc_market_cap: btcMarketCap,
        total_market_cap_top_125: totalMarketCap,
      },
    })
  } catch (error: any) {
    results.sources.push({
      name: "CoinGecko Top 125",
      status: "failed",
      error: error.message,
    })
  }

  // Test 3: CoinGecko top 250 coins
  try {
    const btcResponse = await fetch(
      "https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&community_data=false&developer_data=false",
      { cache: "no-store" },
    )
    const btcData = await btcResponse.json()
    const btcMarketCap = btcData.market_data?.market_cap?.usd || 0

    // Get top 250 coins
    const page1 = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false",
      { cache: "no-store" },
    )
    const top250Data = await page1.json()

    const totalMarketCap = top250Data.reduce((sum: number, coin: any) => sum + (coin.market_cap || 0), 0)

    const btcDominance = (btcMarketCap / totalMarketCap) * 100

    results.sources.push({
      name: "CoinGecko Top 250",
      value: Number.parseFloat(btcDominance.toFixed(2)),
      difference: Math.abs(60.55 - btcDominance).toFixed(2),
      status: "success",
    })
  } catch (error: any) {
    results.sources.push({
      name: "CoinGecko Top 250",
      status: "failed",
      error: error.message,
    })
  }

  // Test 4: CoinCap (they might use different methodology)
  try {
    const coincapResponse = await fetch("https://api.coincap.io/v2/assets", {
      cache: "no-store",
    })
    const coincapData = await coincapResponse.json()

    const btc = coincapData.data.find((coin: any) => coin.symbol === "BTC" || coin.id === "bitcoin")
    const btcMarketCap = Number.parseFloat(btc?.marketCapUsd || 0)

    // Get top 125 from CoinCap
    const top125 = coincapData.data.slice(0, 125)
    const totalMarketCap = top125.reduce((sum: number, coin: any) => sum + Number.parseFloat(coin.marketCapUsd || 0), 0)

    const btcDominance = (btcMarketCap / totalMarketCap) * 100

    results.sources.push({
      name: "CoinCap Top 125",
      value: Number.parseFloat(btcDominance.toFixed(2)),
      difference: Math.abs(60.55 - btcDominance).toFixed(2),
      status: "success",
    })
  } catch (error: any) {
    results.sources.push({
      name: "CoinCap Top 125",
      status: "failed",
      error: error.message,
    })
  }

  // Sort by closest to TradingView
  results.sources.sort((a: any, b: any) => {
    if (a.status !== "success") return 1
    if (b.status !== "success") return -1
    return Number.parseFloat(a.difference) - Number.parseFloat(b.difference)
  })

  // Add recommendation
  const bestSource = results.sources.find((s: any) => s.status === "success")
  if (bestSource) {
    results.recommendation = {
      source: bestSource.name,
      value: bestSource.value,
      accuracy: `${(100 - (Number.parseFloat(bestSource.difference) / 60.55) * 100).toFixed(2)}% accurate`,
    }
  }

  return NextResponse.json(results)
}
