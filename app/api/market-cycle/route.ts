import { NextResponse } from "next/server"
export const dynamic = "force-dynamic"

const TOP_DATE = "2025-10-06T00:00:00.000Z"
const TOP_PRICE = 126000
const ALT_TOP_DATE = "2025-11-01T00:00:00.000Z"

function scoreCycle(btcPrice: number, btcChange: number, dominance: number, ethBtc: number) {
  let topRisk = 0
  if (btcPrice >= TOP_PRICE * 0.85) topRisk += 20
  if (btcPrice >= TOP_PRICE * 0.95) topRisk += 20
  if (btcChange > 0) topRisk += 10
  if (dominance < 55) topRisk += 10
  if (ethBtc > 0.045) topRisk += 10
  return Math.min(100, topRisk)
}

export async function GET() {
  try {
    const [priceResponse, globalResponse] = await Promise.all([
      fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd,btc&include_24h_change=true", { cache: "no-store" }),
      fetch("https://api.coingecko.com/api/v3/global", { cache: "no-store" }),
    ])
    const p = priceResponse.ok ? await priceResponse.json() : {}
    const g = globalResponse.ok ? await globalResponse.json() : {}
    const btcPrice = Number(p.bitcoin?.usd || 0)
    const btcChange = Number(p.bitcoin?.usd_24h_change || 0)
    const ethBtc = Number(p.ethereum?.btc || 0)
    const dominance = Number(g.data?.market_cap_percentage?.btc || 0)
    const topRisk = scoreCycle(btcPrice, btcChange, dominance, ethBtc)
    const now = Date.now()
    const topDate = new Date(TOP_DATE).getTime()
    const bearEnd = new Date("2026-08-01T00:00:00.000Z").getTime()
    const nextTop = new Date("2028-10-01T00:00:00.000Z").getTime()
    const cyclePhase = now < bearEnd ? "Post-peak / bear-market monitoring" : now < nextTop ? "New bull-market cycle monitoring" : "Projected top-window monitoring"

    return NextResponse.json({
      bullMarket: {
        priorTop: { date: TOP_DATE, price: TOP_PRICE, confirmed: true },
        currentPhase: cyclePhase,
        nextProjectedTopWindow: "2028",
        topRiskScore: topRisk,
        status: topRisk >= 70 ? "High top-risk" : "Not top-confirmed",
        methodology: "Historical cycle anchor + live price, dominance, ETH/BTC and momentum confluence. Projection is not a guarantee.",
      },
      bearMarket: {
        priorTopDate: TOP_DATE,
        altseasonTopDate: ALT_TOP_DATE,
        estimatedEnd: "2026",
        status: now >= bearEnd ? "Bear-market end / new-cycle monitoring" : "Bear-market monitoring",
      },
      altseason: {
        priorPeak: { date: ALT_TOP_DATE, confirmed: true },
        ethBtcRatio: ethBtc || null,
        btcDominance: dominance || null,
        status: dominance && ethBtc ? (dominance < 55 && ethBtc > 0.045 ? "Conditions improving" : "Not active") : "Data unavailable",
      },
      summary: { currentDate: new Date().toISOString(), thesis: "The dashboard remembers the 2025 peak and tracks the next cycle instead of pretending the historical top did not happen." },
    })
  } catch (error) {
    console.error("Market cycle API error:", error)
    return NextResponse.json({ error: "Market cycle data unavailable" }, { status: 503 })
  }
}
