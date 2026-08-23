import { NextResponse } from "next/server"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const [btcResponse, domResponse] = await Promise.all([
      fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd,btc&include_24h_change=true", { cache: "no-store" }),
      fetch("https://api.coingecko.com/api/v3/global", { cache: "no-store" }),
    ])
    const priceData = btcResponse.ok ? await btcResponse.json() : {}
    const globalData = domResponse.ok ? await domResponse.json() : {}
    const btcPrice = Number(priceData.bitcoin?.usd || 0)
    const ethBtcRatio = Number(priceData.ethereum?.btc || 0)
    const btcDominance = Number(globalData.data?.market_cap_percentage?.btc || 0)

    // Cycle status is deliberately model-led: no hard-coded historical top is treated as a current fact.
    // Until the full on-chain confluence model is populated, report the state as unconfirmed.
    const nearPriorHigh = btcPrice > 0 && btcPrice >= 100000
    const altPressure = btcDominance > 58 || (ethBtcRatio > 0 && ethBtcRatio < 0.04)

    return NextResponse.json({
      bullMarket: {
        progress: null,
        estimatedTop: null,
        topPrice: null,
        confluence: null,
        status: "Unconfirmed",
        currentPhase: nearPriorHigh ? "Late-cycle monitoring" : "Active cycle monitoring",
        outlook: "No historical top is hard-coded. Cycle-top status will be confirmed from live confluence signals.",
        indicators: [
          { name: "Price structure", status: nearPriorHigh ? "Near prior high zone" : "Monitoring", signal: "neutral" },
          { name: "Cycle model", status: "Awaiting confluence", signal: "neutral" },
          { name: "On-chain valuation", status: "Monitoring", signal: "neutral" },
          { name: "Miner valuation", status: "Monitoring", signal: "neutral" },
          { name: "Profit-taking / euphoria", status: "Monitoring", signal: "neutral" },
        ],
      },
      altseason: {
        progress: null,
        peakDate: null,
        ethBtcRatio: ethBtcRatio || null,
        btcDominance: btcDominance || null,
        phase: altPressure ? "Selective / pressured" : "Not confirmed",
        status: "Unconfirmed",
        outlook: "Altseason is not declared from a fixed historical date. Breadth, ETH/BTC and BTC dominance will drive the state.",
        indicators: [
          { name: "ETH/BTC Ratio", status: ethBtcRatio ? "Live" : "Unavailable", signal: "neutral" },
          { name: "BTC Dominance", status: btcDominance ? "Live" : "Unavailable", signal: "neutral" },
          { name: "Alt/BTC breadth", status: "Monitoring", signal: "neutral" },
          { name: "Funding", status: "Monitoring", signal: "neutral" },
          { name: "Market breadth", status: "Monitoring", signal: "neutral" },
        ],
      },
      summary: {
        currentDate: new Date().toISOString(),
        marketPhase: "Live cycle monitoring",
        recommendation: "Use the live market-intelligence engine rather than a pre-set cycle-top assumption.",
        nextMilestone: "Cycle confluence threshold",
      },
    })
  } catch (error) {
    console.error("Market cycle API error:", error)
    return NextResponse.json({ error: "Market cycle data unavailable" }, { status: 503 })
  }
}
