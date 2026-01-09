"use client"

import { useState, useEffect } from "react"
import { AISearchBar } from "@/components/ai-search-bar"
import { EnhancedConfluenceCard } from "@/components/enhanced-confluence-card"
import { MarketStats } from "@/components/market-stats"
import { ComprehensiveAnalysisPanel } from "@/components/comprehensive-analysis-panel"
import { MarketCycleCards } from "@/components/market-cycle-cards"
import { WatchlistPanel } from "@/components/watchlist-manager"
import { FearGreedIndex } from "@/components/fear-greed-index"
import { PriceAlerts } from "@/components/price-alerts"

export function DashboardClient() {
  const [marketData, setMarketData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [analysisSymbol, setAnalysisSymbol] = useState<string | null>(null)

  useEffect(() => {
    const fetchMarketData = async () => {
      const symbols = ["BTC", "ETH", "SOL", "AAPL", "TSLA", "EUR/USD"]

      const results: any[] = []

      for (const symbol of symbols) {
        try {
          const response = await fetch(`/api/market-data?symbol=${symbol}`)
          if (response.ok) {
            const data = await response.json()
            results.push(data)
          }
        } catch (error) {
          console.error(`[v0] Failed to fetch ${symbol}:`, error)
        }
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      setMarketData(results)
      setLoading(false)
    }

    fetchMarketData()
    const interval = setInterval(fetchMarketData, 600000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">
            Market Dashboard
          </h1>
          <p className="text-gray-400">Real-time confluence analysis across multiple asset classes</p>
        </div>

        {/* AI Search */}
        <AISearchBar onAnalyse={setAnalysisSymbol} />

        {/* Market Stats */}
        <MarketStats />

        {/* Fear & Greed Index */}
        <FearGreedIndex />

        {/* Comprehensive Analysis Panel */}
        {analysisSymbol && (
          <ComprehensiveAnalysisPanel
            symbol={analysisSymbol}
            onClose={() => {
              console.log("[v0] Closing analysis panel")
              setAnalysisSymbol(null)
            }}
          />
        )}

        {/* Market Cycle Analysis */}
        <MarketCycleCards />

        {/* Enhanced Confluence Cards */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Live Market Analysis</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-gray-900 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : marketData.length === 0 ? (
            <div className="text-center py-12 bg-gray-900/50 rounded-lg border border-gray-800">
              <p className="text-gray-400 mb-2">Market data is temporarily unavailable</p>
              <p className="text-sm text-gray-500">Data will refresh automatically. Try again in a few minutes.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketData.map((data, index) => {
                console.log(`[v0] Rendering card for ${data?.symbol}, has data:`, !!data)
                return (
                  <EnhancedConfluenceCard
                    key={data?.symbol || index}
                    data={data}
                    onAnalyse={() => {
                      console.log("[v0] Setting analysis symbol to:", data?.symbol)
                      setAnalysisSymbol(data?.symbol)
                    }}
                  />
                )
              })}
            </div>
          )}
        </div>

        {/* Watchlist and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WatchlistPanel />
          <PriceAlerts />
        </div>
      </div>
    </div>
  )
}
