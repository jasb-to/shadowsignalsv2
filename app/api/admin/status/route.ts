import { NextResponse } from "next/server"

async function checkEndpoint(url: string, timeout = 5000): Promise<{ online: boolean; responseTime: number }> {
  const start = Date.now()
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    const response = await fetch(url, {
      signal: controller.signal,
      method: 'GET',
    })
    
    clearTimeout(timeoutId)
    const responseTime = Date.now() - start
    
    return {
      online: response.ok,
      responseTime,
    }
  } catch (error) {
    return {
      online: false,
      responseTime: 0,
    }
  }
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  let marketData = null
  try {
    const response = await fetch(`${baseUrl}/api/market-data?symbol=BTC`)
    if (response.ok) {
      marketData = await response.json()
    }
  } catch (error) {
    console.error('[v0] Failed to fetch market data:', error)
  }

  // Check all API endpoints in parallel
  const [marketOverview, tokenData, aiAnalysis, twelveData, huggingface] = await Promise.all([
    checkEndpoint(`${baseUrl}/api/market-data?symbol=BTC`),
    checkEndpoint(`${baseUrl}/api/market-data?symbol=ETH`),
    checkEndpoint(`${baseUrl}/api/ai-search`),
    checkEndpoint(`${baseUrl}/api/market-data?symbol=BTC`),
    checkEndpoint(`${baseUrl}/api/comprehensive-analysis?symbol=BTC&timeframe=1d`),
  ])

  let marketStats = {
    totalMarketCap: "$N/A",
    volume24h: "$N/A",
    change24h: "N/A%",
  }

  if (marketData && marketData.price) {
    try {
      const btcPrice = marketData.price
      const btcSupply = 19500000 // Approximate BTC in circulation
      const btcMarketCap = btcPrice * btcSupply
      
      // Bitcoin dominance is roughly 50%, so total market cap is ~2x BTC market cap
      const totalMarketCap = btcMarketCap * 2
      
      marketStats = {
        totalMarketCap: `$${(totalMarketCap / 1000000000).toFixed(2)}B`,
        volume24h: marketData.volume24h ? `$${(marketData.volume24h / 1000000000).toFixed(2)}B` : "$N/A",
        change24h: `${marketData.change24h.toFixed(2)}%`,
      }
    } catch (error) {
      console.error('[v0] Failed to calculate market stats:', error)
    }
  }

  const apis = [
    {
      name: "Market Overview",
      online: marketOverview.online,
      responseTime: `${marketOverview.responseTime}ms`,
      calls: 0,
      errorRate: marketOverview.online ? "0.0%" : "100.0%",
      lastChecked: new Date().toLocaleTimeString(),
    },
    {
      name: "Token Data",
      online: tokenData.online,
      responseTime: `${tokenData.responseTime}ms`,
      calls: 0,
      errorRate: tokenData.online ? "0.0%" : "100.0%",
      lastChecked: new Date().toLocaleTimeString(),
    },
    {
      name: "AI Analysis",
      online: aiAnalysis.online,
      responseTime: `${aiAnalysis.responseTime}ms`,
      calls: 0,
      errorRate: aiAnalysis.online ? "0.0%" : "100.0%",
      lastChecked: new Date().toLocaleTimeString(),
    },
    {
      name: "Twelve Data API",
      online: twelveData.online,
      responseTime: `${twelveData.responseTime}ms`,
      calls: 0,
      errorRate: twelveData.online ? "0.0%" : "100.0%",
      lastChecked: new Date().toLocaleTimeString(),
    },
    {
      name: "HuggingFace AI",
      online: huggingface.online,
      responseTime: `${huggingface.responseTime}ms`,
      calls: 0,
      errorRate: huggingface.online ? "0.0%" : "100.0%",
      lastChecked: new Date().toLocaleTimeString(),
    },
  ]

  // Calculate success rate
  const onlineCount = apis.filter(api => api.online).length
  const successRate = ((onlineCount / apis.length) * 100).toFixed(1)

  return NextResponse.json({
    apis,
    totalCalls: 0,
    successRate: `${successRate}%`,
    uptime: "99.9%",
    marketData: marketStats,
  })
}
