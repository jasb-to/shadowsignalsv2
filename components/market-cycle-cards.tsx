"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Indicator {
  name: string
  status: string
  signal: "bullish" | "bearish" | "neutral"
}

interface CycleData {
  bullMarket: {
    progress: number
    estimatedTop: string
    topPrice?: number
    confluence: number
    status?: string
    currentPhase?: string
    outlook?: string
    indicators: Indicator[] | string[]
  }
  altseason: {
    progress: number
    peakDate?: string
    ethBtcRatio: number
    btcDominance?: number
    phase: string
    status?: string
    outlook?: string
    indicators: Indicator[] | string[]
  }
  summary?: {
    marketPhase: string
    recommendation: string
    nextMilestone: string
  }
}

export function MarketCycleCards() {
  const [cycleData, setCycleData] = useState<CycleData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCycleData = async () => {
      try {
        const response = await fetch("/api/market-cycle")
        if (response.ok) {
          const data = await response.json()
          setCycleData(data)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch cycle data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCycleData()
    const interval = setInterval(fetchCycleData, 300000)

    return () => clearInterval(interval)
  }, [])

  const renderIndicators = (indicators: Indicator[] | string[]) => {
    if (!indicators || indicators.length === 0) return "Loading..."

    if (typeof indicators[0] === "string") {
      return (indicators as string[]).join(", ")
    }

    return (indicators as Indicator[]).map((ind) => `${ind.name} (${ind.status})`).join(", ")
  }

  const renderIndicatorList = (indicators: Indicator[] | string[]) => {
    if (!indicators || indicators.length === 0) return null

    if (typeof indicators[0] === "string") {
      return (indicators as string[]).map((indicator, i) => <li key={i}>{indicator}</li>)
    }

    return (indicators as Indicator[]).map((indicator, i) => (
      <li key={i} className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            indicator.signal === "bullish"
              ? "bg-green-500"
              : indicator.signal === "bearish"
                ? "bg-red-500"
                : "bg-yellow-500"
          }`}
        />
        <span>
          {indicator.name}: <span className="text-gray-400">{indicator.status}</span>
        </span>
      </li>
    ))
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-48 bg-black/50 border border-cyan-500/20 rounded-lg animate-pulse" />
        <div className="h-48 bg-black/50 border border-cyan-500/20 rounded-lg animate-pulse" />
      </div>
    )
  }

  if (!cycleData) return null

  const hasTopped = cycleData.bullMarket.status === "Topped" || cycleData.bullMarket.progress >= 95
  const altseasonComplete =
    cycleData.altseason.status === "Ended" ||
    cycleData.altseason.status === "Complete" ||
    cycleData.altseason.progress >= 95

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Bull Market Top Card */}
      <Dialog>
        <DialogTrigger asChild>
          <Card
            className={`bg-gradient-to-br ${hasTopped ? "from-red-500/10 border-red-500/30 hover:border-red-500/50" : "from-green-500/10 border-green-500/30 hover:border-green-500/50"} to-transparent p-6 space-y-4 cursor-pointer transition-all`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                Bull Market Top
                <span className="text-2xl">{hasTopped ? "🔴" : "📈"}</span>
              </h3>
              {cycleData.bullMarket.status && (
                <span
                  className={`text-xs px-2 py-1 rounded-full font-semibold ${hasTopped ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}
                >
                  {cycleData.bullMarket.status}
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Cycle Progress:</span>
                  <span className={`font-semibold ${hasTopped ? "text-red-400" : "text-green-400"}`}>
                    {cycleData.bullMarket.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${hasTopped ? "bg-gradient-to-r from-red-500 to-red-400" : "bg-gradient-to-r from-green-500 to-green-400"}`}
                    style={{ width: `${cycleData.bullMarket.progress}%` }}
                  />
                </div>
              </div>

              {cycleData.bullMarket.topPrice && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Cycle Top Price:</span>
                  <span className="text-white font-medium">${cycleData.bullMarket.topPrice.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{hasTopped ? "Topped:" : "Est. Top:"}</span>
                <span className="text-white font-medium">{cycleData.bullMarket.estimatedTop}</span>
              </div>

              {cycleData.bullMarket.currentPhase && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Current Phase:</span>
                  <span className="text-yellow-400 font-medium">{cycleData.bullMarket.currentPhase}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Top Confluence:</span>
                <span
                  className={`font-semibold ${cycleData.bullMarket.confluence > 70 ? "text-red-400" : "text-cyan-400"}`}
                >
                  {cycleData.bullMarket.confluence}%
                </span>
              </div>

              <div className="pt-2 border-t border-gray-800">
                <p className="text-xs text-gray-500 mb-2">Indicators:</p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {renderIndicators(cycleData.bullMarket.indicators)}
                </p>
              </div>
            </div>
          </Card>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              Bull Market Top Indicator {hasTopped ? "🔴" : "📈"}
            </DialogTitle>
            <DialogDescription className="text-base leading-relaxed space-y-4 pt-4">
              {hasTopped && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                  <p className="text-red-400 font-semibold">
                    The bull market cycle has topped. BTC reached its cycle high of $
                    {cycleData.bullMarket.topPrice?.toLocaleString() || "~108,000"} around{" "}
                    {cycleData.bullMarket.estimatedTop}. We are now in the distribution/correction phase.
                  </p>
                </div>
              )}

              {cycleData.bullMarket.outlook && (
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Outlook</h4>
                  <p className="text-gray-300">{cycleData.bullMarket.outlook}</p>
                </div>
              )}

              <p>
                The <strong>Bull Market Top</strong> indicator tracks Bitcoin's position within the halving cycle. Based
                on the April 2024 halving, the typical 12-18 month post-halving peak aligned with October 2025.
              </p>

              <div className="space-y-2">
                <h4 className="font-semibold text-white">Cycle Progress: {cycleData.bullMarket.progress}%</h4>
                <p>
                  At 100%, the bull cycle is considered complete. Current phase:{" "}
                  {cycleData.bullMarket.currentPhase || "Distribution"}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white">Top Confluence Score: {cycleData.bullMarket.confluence}%</h4>
                <p>
                  Percentage of on-chain indicators signalling cycle top conditions. Above 70% indicates high confidence
                  the top is in.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white">Current Indicators</h4>
                <ul className="list-none space-y-2 ml-2">{renderIndicatorList(cycleData.bullMarket.indicators)}</ul>
              </div>

              {cycleData.summary && (
                <div className="pt-4 border-t border-gray-700 space-y-2">
                  <h4 className="font-semibold text-white">Market Summary</h4>
                  <p className="text-gray-300">
                    <strong>Phase:</strong> {cycleData.summary.marketPhase}
                  </p>
                  <p className="text-gray-300">
                    <strong>Next Milestone:</strong> {cycleData.summary.nextMilestone}
                  </p>
                  <p className="text-yellow-400">
                    <strong>Recommendation:</strong> {cycleData.summary.recommendation}
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Altseason Top Card */}
      <Dialog>
        <DialogTrigger asChild>
          <Card
            className={`bg-gradient-to-br ${altseasonComplete ? "from-orange-500/10 border-orange-500/30 hover:border-orange-500/50" : "from-purple-500/10 border-purple-500/30 hover:border-purple-500/50"} to-transparent p-6 space-y-4 cursor-pointer transition-all`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                Altseason Top
                <span className="text-2xl">{altseasonComplete ? "🟠" : "⚡"}</span>
              </h3>
              {cycleData.altseason.status && (
                <span
                  className={`text-xs px-2 py-1 rounded-full font-semibold ${altseasonComplete ? "bg-orange-500/20 text-orange-400" : "bg-purple-500/20 text-purple-400"}`}
                >
                  {cycleData.altseason.status}
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Altseason Progress:</span>
                  <span className={`font-semibold ${altseasonComplete ? "text-orange-400" : "text-purple-400"}`}>
                    {cycleData.altseason.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${altseasonComplete ? "bg-gradient-to-r from-orange-500 to-orange-400" : "bg-gradient-to-r from-purple-500 to-purple-400"}`}
                    style={{ width: `${cycleData.altseason.progress}%` }}
                  />
                </div>
              </div>

              {cycleData.altseason.peakDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Altseason Peaked:</span>
                  <span className="text-white font-medium">{cycleData.altseason.peakDate}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-400">ETH/BTC Ratio:</span>
                <span className="text-white font-medium">{cycleData.altseason.ethBtcRatio.toFixed(4)}</span>
              </div>

              {cycleData.altseason.btcDominance && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">BTC Dominance:</span>
                  <span className="text-white font-medium">{cycleData.altseason.btcDominance.toFixed(1)}%</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Phase:</span>
                <span
                  className={`font-semibold ${
                    cycleData.altseason.phase.includes("Relief")
                      ? "text-yellow-400"
                      : altseasonComplete
                        ? "text-orange-400"
                        : "text-purple-400"
                  }`}
                >
                  {cycleData.altseason.phase}
                </span>
              </div>

              <div className="pt-2 border-t border-gray-800">
                <p className="text-xs text-gray-500 mb-2">Indicators:</p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {renderIndicators(cycleData.altseason.indicators)}
                </p>
              </div>
            </div>
          </Card>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              Altseason Top Indicator {altseasonComplete ? "🟠" : "⚡"}
            </DialogTitle>
            <DialogDescription className="text-base leading-relaxed space-y-4 pt-4">
              {altseasonComplete && (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-4">
                  <p className="text-orange-400 font-semibold">
                    Altseason has concluded for this cycle. It peaked around{" "}
                    {cycleData.altseason.peakDate || "November 2025"}, approximately 4-6 weeks after BTC's top. ETH/BTC
                    ratio declining confirms capital rotation back to BTC and stablecoins.
                  </p>
                </div>
              )}

              {cycleData.altseason.outlook && (
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Outlook</h4>
                  <p className="text-gray-300">{cycleData.altseason.outlook}</p>
                </div>
              )}

              <p>
                The <strong>Altseason Top</strong> indicator tracks when altcoins peak relative to Bitcoin.
                Historically, altseasons occur 4-8 weeks after BTC tops as capital rotates seeking higher returns.
              </p>

              <div className="space-y-2">
                <h4 className="font-semibold text-white">Current Phase: {cycleData.altseason.phase}</h4>
                <p>
                  {cycleData.altseason.phase.includes("Relief")
                    ? "A relief rally may provide temporary upside before the broader correction continues. This is often exit liquidity for remaining positions."
                    : cycleData.altseason.phase.includes("Complete")
                      ? "Altseason has ended. Capital is flowing out of alts back to BTC and stablecoins. Risk management is critical."
                      : "Current market conditions based on ETH/BTC ratio and BTC dominance metrics."}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white">Key Metrics</h4>
                <ul className="space-y-1">
                  <li>
                    <strong>ETH/BTC Ratio:</strong> {cycleData.altseason.ethBtcRatio.toFixed(4)} -{" "}
                    {cycleData.altseason.ethBtcRatio < 0.04
                      ? "Below 0.04 indicates altseason firmly over"
                      : "Watch for further decline"}
                  </li>
                  {cycleData.altseason.btcDominance && (
                    <li>
                      <strong>BTC Dominance:</strong> {cycleData.altseason.btcDominance.toFixed(1)}% -{" "}
                      {cycleData.altseason.btcDominance > 55
                        ? "Rising dominance confirms capital rotation to BTC"
                        : "Monitor for trend"}
                    </li>
                  )}
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white">Current Indicators</h4>
                <ul className="list-none space-y-2 ml-2">{renderIndicatorList(cycleData.altseason.indicators)}</ul>
              </div>

              {cycleData.summary && (
                <div className="pt-4 border-t border-gray-700">
                  <p className="text-yellow-400 font-medium">{cycleData.summary.recommendation}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}
