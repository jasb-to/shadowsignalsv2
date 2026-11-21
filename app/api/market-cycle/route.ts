import { NextResponse } from "next/server"
import { numeric } from "@/lib/utils"

export const dynamic = "force-dynamic"

const BTC_TOP_DATE = "2025-10-06T00:00:00.000Z"
const BTC_TOP_PRICE = 126000
const ALT_TOP_DATE = "2025-11-01T00:00:00.000Z"
const CACHE_5M = { next: { revalidate: 300 } as const }

const clamp = (value: number) => Math.max(0, Math.min(100, value))

async function safeJson(response: PromiseSettledResult<Response>) {
  if (response.status !== "fulfilled" || !response.value.ok) return null
  try {
    return await response.value.json()
  } catch {
    return null
  }
}

export async function GET() {
  try {
    const [priceResult, globalResult, athResult] = await Promise.allSettled([
      fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd,btc&include_24h_change=true",
        CACHE_5M
      ),
      fetch("https://api.coingecko.com/api/v3/global", CACHE_5M),
      fetch(
        "https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false",
        CACHE_5M
      ),
    ])

    const [priceData, globalData, athData] = await Promise.all([
      safeJson(priceResult),
      safeJson(globalResult),
      safeJson(athResult),
    ])

    const btc = numeric(priceData?.bitcoin?.usd)
    const change = numeric(priceData?.bitcoin?.usd_24h_change)
    const ethBtc = numeric(priceData?.ethereum?.btc)
    const dominance = numeric(globalData?.data?.market_cap_percentage?.btc)

    // This is CoinGecko's current ATH field, not a historic-cycle constant.
    const ath = numeric(athData?.market_data?.ath?.usd)
    const athDate =
      typeof athData?.market_data?.ath_date?.usd === "string"
        ? athData.market_data.ath_date.usd
        : null

    const drawdownPct =
      btc !== null && ath !== null && ath > 0
        ? ((btc / ath) - 1) * 100
        : null

    const now = Date.now()
    const historicalTopMs = new Date(BTC_TOP_DATE).getTime()
    const bottomMs = new Date("2026-08-01T00:00:00.000Z").getTime()
    const nextTopMs = new Date("2028-10-01T00:00:00.000Z").getTime()

    const bottomProgress = clamp(
      ((now - historicalTopMs) / (bottomMs - historicalTopMs)) * 100
    )
    const cycleProgress = clamp(
      ((now - bottomMs) / (nextTopMs - bottomMs)) * 100
    )

    const riskParts = [
      drawdownPct === null
        ? null
        : drawdownPct >= -15
          ? 40
          : drawdownPct >= -25
            ? 25
            : 0,
      change === null ? null : change > 0 ? 10 : 0,
      dominance === null ? null : dominance < 55 ? 10 : 0,
      ethBtc === null ? null : ethBtc > 0.045 ? 10 : 0,
    ].filter((value): value is number => value !== null)

    const topRisk = riskParts.length
      ? clamp(riskParts.reduce((sum, value) => sum + value, 0))
      : null

    const altParts = [
      dominance === null
        ? null
        : dominance < 55
          ? 40
          : dominance < 60
            ? 20
            : 0,
      ethBtc === null
        ? null
        : ethBtc > 0.045
          ? 40
          : ethBtc > 0.035
            ? 20
            : 0,
      change === null ? null : change > 0 ? 20 : 0,
    ].filter((value): value is number => value !== null)

    const altScore = altParts.length
      ? clamp(altParts.reduce((sum, value) => sum + value, 0))
      : null

    const phase =
      now < bottomMs
        ? "Bear-market / bottom discovery"
        : now < nextTopMs
          ? "New bull-cycle accumulation / expansion"
          : "2028 top-window monitoring"

    return NextResponse.json({
      bullMarket: {
        ath,
        athDate,
        drawdownPct,
        athSource: ath === null ? null : "CoinGecko market_data.ath.usd",
        currentPrice: btc,
        priorTop: {
          date: BTC_TOP_DATE,
          price: BTC_TOP_PRICE,
          confirmed: true,
        },
        currentPhase: phase,
        estimatedTop: "2028",
        nextProjectedTopWindow: "2028",
        topRiskScore: topRisk,
        confluence: topRisk === null ? null : clamp(100 - topRisk),
        cycleProgress,
        status:
          topRisk === null
            ? "Insufficient cycle data"
            : topRisk >= 70
              ? "High top-risk"
              : "New cycle / not top-confirmed",
        outlook:
          "October 2025 BTC top is a historical reference. The projected 2028 window is a model assumption, not a confirmed market event.",
        indicators: [
          "BTC " + (btc === null ? "unavailable" : "$" + btc.toFixed(0)),
          "BTC dominance " +
            (dominance === null ? "unavailable" : dominance.toFixed(1) + "%"),
          "ETH/BTC " +
            (ethBtc === null ? "unavailable" : ethBtc.toFixed(4)),
        ],
      },
      bearMarket: {
        priorTopDate: BTC_TOP_DATE,
        estimatedEnd: "2026",
        bottomWindow: "2026",
        bottomProgress,
        status:
          now >= bottomMs
            ? "Bottom window passed / new-cycle monitoring"
            : "Bottom discovery",
        thesis:
          "Identify the bear-market low before treating the next bull cycle as established.",
      },
      altseason: {
        priorPeak: {
          date: ALT_TOP_DATE,
          confirmed: true,
        },
        peakDate: "November 2025",
        ethBtcRatio: ethBtc,
        btcDominance: dominance,
        progress: altScore,
        status:
          altScore === null
            ? "Insufficient rotation data"
            : altScore >= 70
              ? "Rotation conditions improving"
              : "Not active",
        phase:
          altScore !== null && altScore >= 70
            ? "Rotation building"
            : "Monitoring",
        outlook:
          "The 2025 altseason peak is the historical anchor. The next altseason requires breadth and rotation confirmation.",
        indicators: [
          "ETH/BTC " + (ethBtc === null ? "—" : ethBtc.toFixed(4)),
          "BTC dominance " +
            (dominance === null ? "—" : dominance.toFixed(1) + "%"),
        ],
      },
      summary: {
        currentDate: new Date().toISOString(),
        marketPhase: phase,
        recommendation:
          "Cycle cards are strategic context; asset-level decisions come from the intelligence engine.",
      },
    })
  } catch (error) {
    console.error("Market cycle API error:", error)

    return NextResponse.json(
      { error: "Market cycle data unavailable" },
      { status: 503 }
    )
  }
}
