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

interface CycleData {
  bullMarket: {
    progress: number
    estimatedTop: string
    confluence: number
    indicators: string[]
  }
  altseason: {
    progress: number
    ethBtcRatio: number
    phase: string
    indicators: string[]
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
    const interval = setInterval(fetchCycleData, 300000) // Refresh every 5 minutes

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-48 bg-black/50 border border-cyan-500/20 rounded-lg animate-pulse" />
        <div className="h-48 bg-black/50 border border-cyan-500/20 rounded-lg animate-pulse" />
      </div>
    )
  }

  if (!cycleData) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Bull Market Top Card */}
      <Dialog>
        <DialogTrigger asChild>
          <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/30 p-6 space-y-4 cursor-pointer hover:border-green-500/50 transition-all">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                Bull Market Top
                <span className="text-2xl">📈</span>
              </h3>
              <div className="text-gray-400 text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Progress:</span>
                  <span className="text-green-400 font-semibold">{cycleData.bullMarket.progress}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${cycleData.bullMarket.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Est. Top:</span>
                <span className="text-white font-medium">{cycleData.bullMarket.estimatedTop}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Confluence:</span>
                <span className="text-cyan-400 font-semibold">{cycleData.bullMarket.confluence}%</span>
              </div>

              <div className="pt-2 border-t border-gray-800">
                <p className="text-xs text-gray-500 mb-2">Based on:</p>
                <p className="text-xs text-gray-400 leading-relaxed">{cycleData.bullMarket.indicators.join(", ")}</p>
              </div>
            </div>
          </Card>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">Bull Market Top Indicator 📈</DialogTitle>
            <DialogDescription className="text-base leading-relaxed space-y-4 pt-4">
              <p>
                The <strong>Bull Market Top</strong> indicator helps you identify when Bitcoin and the broader crypto
                market might be approaching a cycle peak. It combines multiple on-chain and market metrics to provide a
                comprehensive view of market conditions.
              </p>

              <div className="space-y-2">
                <h4 className="font-semibold text-white">Progress</h4>
                <p>
                  Shows how far we are through the current bull cycle, calculated from the last major bottom to the
                  projected top. This is based on historical cycle lengths, which typically span 3-4 years from bottom
                  to top.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white">Estimated Top Date</h4>
                <p>
                  A projected date for the cycle peak based on historical patterns and current momentum. This uses the
                  average bull market duration from previous cycles to estimate when the market might reach its peak.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white">Confluence Score</h4>
                <p>
                  The percentage of indicators currently signalling "overheated" or "top" conditions. The higher this
                  number, the more indicators are flashing warning signs. It's calculated from:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    <strong>Pi Cycle Top:</strong> Compares moving averages to identify historical top signals
                  </li>
                  <li>
                    <strong>MVRV Z-Score:</strong> Measures if Bitcoin is overvalued relative to its "fair value"
                  </li>
                  <li>
                    <strong>Open Interest:</strong> Excessive futures positions suggest overleveraged markets
                  </li>
                  <li>
                    <strong>BTC Dominance:</strong> Extreme levels can signal cycle transitions
                  </li>
                  <li>
                    <strong>ETH/BTC Ratio:</strong> Ethereum's strength helps identify market phases
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white">How to Use It</h4>
                <p>
                  When confluence reaches 60-80%+, historically that's been near cycle tops. Lower confluence scores
                  suggest we're still relatively early in the cycle. Use this indicator alongside other analysis to make
                  informed decisions about position sizing and risk management.
                </p>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400">
                  <strong>Update Frequency:</strong> This indicator refreshes every 5 minutes with the latest market
                  data.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Altseason Top Card */}
      <Dialog>
        <DialogTrigger asChild>
          <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/30 p-6 space-y-4 cursor-pointer hover:border-purple-500/50 transition-all">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                Altseason Top
                <span className="text-2xl">⚡</span>
              </h3>
              <div className="text-gray-400 text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Alt Progress:</span>
                  <span className="text-purple-400 font-semibold">{cycleData.altseason.progress}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${cycleData.altseason.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-400">ETH/BTC:</span>
                <span className="text-white font-medium">{cycleData.altseason.ethBtcRatio.toFixed(4)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Phase:</span>
                <span
                  className={`font-semibold ${
                    cycleData.altseason.phase === "Altseason" ? "text-purple-400" : "text-orange-400"
                  }`}
                >
                  {cycleData.altseason.phase}
                </span>
              </div>

              <div className="pt-2 border-t border-gray-800">
                <p className="text-xs text-gray-500 mb-2">Based on:</p>
                <p className="text-xs text-gray-400 leading-relaxed">{cycleData.altseason.indicators.join(", ")}</p>
              </div>
            </div>
          </Card>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">Altseason Top Indicator ⚡</DialogTitle>
            <DialogDescription className="text-base leading-relaxed space-y-4 pt-4">
              <p>
                The <strong>Altseason Top</strong> indicator specifically tracks when alternative cryptocurrencies
                (altcoins) might peak relative to Bitcoin, helping you time rotations between BTC and alts.
              </p>

              <div className="space-y-2">
                <h4 className="font-semibold text-white">Alt Progress</h4>
                <p>
                  Shows how far through the typical altseason cycle we are. Altseasons usually happen in the later
                  stages of bull markets when Bitcoin dominance falls and money rotates into alternative
                  cryptocurrencies.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white">ETH/BTC Ratio</h4>
                <p>
                  Ethereum's price in Bitcoin terms. When this ratio is rising, it indicates altcoins are outperforming
                  Bitcoin (altseason). When falling, Bitcoin is dominant. This is the primary indicator for identifying
                  market rotation.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white">Phase</h4>
                <p>The current market phase is determined by multiple factors:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    <strong>BTC Season:</strong> Bitcoin is outperforming altcoins (ratio declining, dominance rising)
                  </li>
                  <li>
                    <strong>Early Altseason:</strong> Initial signs of altcoin strength emerging
                  </li>
                  <li>
                    <strong>Altseason:</strong> Altcoins are significantly outperforming Bitcoin (ratio rising,
                    dominance falling)
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white">Key Indicators</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    <strong>ETH/BTC Ratio Trend:</strong> Rising = altseason, falling = BTC season
                  </li>
                  <li>
                    <strong>BTC Dominance Trend:</strong> Falling dominance = money flowing to alts
                  </li>
                  <li>
                    <strong>Funding Rates:</strong> High positive funding = overleveraged longs (potential top)
                  </li>
                  <li>
                    <strong>Open Interest:</strong> Excessive leverage in altcoin futures
                  </li>
                  <li>
                    <strong>Market Rotation:</strong> Volume and momentum shifting between BTC and alts
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white">How to Use It</h4>
                <p>Altseasons typically happen when:</p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Bitcoin has already pumped significantly</li>
                  <li>BTC dominance starts falling</li>
                  <li>ETH/BTC ratio starts rising</li>
                  <li>Money rotates from BTC → large caps (ETH) → mid caps → small caps</li>
                </ol>
                <p className="mt-2">
                  Use this indicator to time your rotations between Bitcoin and altcoins. Higher progress percentages
                  and "Altseason" phase signals suggest we're deeper into the altcoin rally cycle.
                </p>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400">
                  <strong>Update Frequency:</strong> This indicator refreshes every 5 minutes with the latest market
                  data.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}
