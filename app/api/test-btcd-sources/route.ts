export const dynamic = "force-dynamic"
export const runtime = "edge"

export async function GET() {
  const results: any[] = []

  // 1. CoinGecko
  try {
    const response = await fetch("https://api.coingecko.com/api/v3/global", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
    const data = await response.json()
    const btcDominance = data.data?.market_cap_percentage?.btc
    results.push({
      source: "CoinGecko",
      dominance: btcDominance,
      status: response.ok ? "success" : "failed",
      url: "https://api.coingecko.com/api/v3/global",
    })
  } catch (error: any) {
    results.push({
      source: "CoinGecko",
      dominance: null,
      status: "error",
      error: error.message,
    })
  }

  // 2. CoinMarketCap (free tier)
  try {
    const response = await fetch("https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/latest", {
      headers: {
        "X-CMC_PRO_API_KEY": "DEMO_KEY", // Using demo key for testing
        Accept: "application/json",
      },
      cache: "no-store",
    })
    const data = await response.json()
    const btcDominance = data.data?.btc_dominance
    results.push({
      source: "CoinMarketCap",
      dominance: btcDominance,
      status: response.ok ? "success" : "failed",
      url: "https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/latest",
    })
  } catch (error: any) {
    results.push({
      source: "CoinMarketCap",
      dominance: null,
      status: "error",
      error: error.message,
    })
  }

  // 3. Messari
  try {
    const response = await fetch("https://data.messari.io/api/v1/assets/bitcoin/metrics", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
    const data = await response.json()
    const btcDominance = data.data?.marketcap?.marketcap_dominance_percent
    results.push({
      source: "Messari",
      dominance: btcDominance,
      status: response.ok ? "success" : "failed",
      url: "https://data.messari.io/api/v1/assets/bitcoin/metrics",
    })
  } catch (error: any) {
    results.push({
      source: "Messari",
      dominance: null,
      status: "error",
      error: error.message,
    })
  }

  // 4. CryptoCompare
  try {
    const response = await fetch("https://min-api.cryptocompare.com/data/blockchain/list", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
    const data = await response.json()
    // CryptoCompare doesn't have direct dominance, we'll calculate it
    results.push({
      source: "CryptoCompare",
      dominance: null,
      status: "no_direct_endpoint",
      note: "No direct BTC dominance endpoint",
    })
  } catch (error: any) {
    results.push({
      source: "CryptoCompare",
      dominance: null,
      status: "error",
      error: error.message,
    })
  }

  // 5. Alternative.me (Fear & Greed Index - also has market data)
  try {
    const response = await fetch("https://api.alternative.me/v2/ticker/Bitcoin/?convert=USD", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
    const data = await response.json()
    const btcDominance = data.data?.["1"]?.market_cap_dominance
    results.push({
      source: "Alternative.me",
      dominance: btcDominance,
      status: response.ok ? "success" : "failed",
      url: "https://api.alternative.me/v2/ticker/Bitcoin/",
    })
  } catch (error: any) {
    results.push({
      source: "Alternative.me",
      dominance: null,
      status: "error",
      error: error.message,
    })
  }

  // 6. Binance (calculate from market data)
  try {
    // Get BTC market cap and total market cap
    const btcResponse = await fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT", {
      cache: "no-store",
    })
    const btcData = await btcResponse.json()

    results.push({
      source: "Binance",
      dominance: null,
      status: "no_direct_endpoint",
      note: "Binance does not provide market cap dominance data",
    })
  } catch (error: any) {
    results.push({
      source: "Binance",
      dominance: null,
      status: "error",
      error: error.message,
    })
  }

  // 7. CoinCap
  try {
    const response = await fetch("https://api.coincap.io/v2/assets/bitcoin", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
    const data = await response.json()

    // Get total market cap
    const globalResponse = await fetch("https://api.coincap.io/v2/assets", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
    const globalData = await globalResponse.json()

    const btcMarketCap = Number.parseFloat(data.data?.marketCapUsd || 0)
    const totalMarketCap =
      globalData.data?.reduce((sum: number, asset: any) => sum + Number.parseFloat(asset.marketCapUsd || 0), 0) || 0

    const btcDominance = totalMarketCap > 0 ? (btcMarketCap / totalMarketCap) * 100 : null

    results.push({
      source: "CoinCap",
      dominance: btcDominance,
      status: response.ok ? "success" : "failed",
      url: "https://api.coincap.io/v2/assets/bitcoin",
      calculated: true,
    })
  } catch (error: any) {
    results.push({
      source: "CoinCap",
      dominance: null,
      status: "error",
      error: error.message,
    })
  }

  // Sort by closest to TradingView's 60.55%
  const tradingViewValue = 60.55
  const sortedResults = results
    .filter((r) => r.dominance !== null)
    .sort((a, b) => {
      const diffA = Math.abs(a.dominance - tradingViewValue)
      const diffB = Math.abs(b.dominance - tradingViewValue)
      return diffA - diffB
    })

  return new Response(JSON.stringify({
    tradingViewReference: tradingViewValue,
    results,
    sortedByAccuracy: sortedResults,
    recommendation: sortedResults[0] || null,
    timestamp: new Date().toISOString(),
  }), { headers: { "content-type": "application/json" } })
}
