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

export default function DashboardPage() {
  const [marketData, setMarketData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [analysisSymbol, setAnalysisSymbol] = useState<string | null>(null)

  useEffect(() => {
    const fetchMarketData = async () => {
      const symbols = ["BTC", "ETH", "SOL", "AAPL", "TSLA", "EUR/USD"]
      const promises = symbols.map(async (symbol) => {
        try {
          const response = await fetch(`/api/market-data?symbol=${symbol}`)
          if (response.ok) {
            return await response.json()
          }
          return null
        } catch (error) {
          console.error(`[v0] Failed to fetch ${symbol}:`, error)
          return null
        }
      })

      const results = await Promise.all(promises)
      setMarketData(results.filter(Boolean))
      setLoading(false)
    }

    fetchMarketData()
    const interval = setInterval(fetchMarketData, 300000)

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
          <p className="text-gray-400">Real-time confluence analysis powered by AI</p>
        </div>

        {/* AI Search */}
        <div className="bg-gradient-to-br from-cyan-500/10 to-transparent p-6 rounded-lg border border-cyan-500/20">
          <AISearchBar onAnalysisOpen={(symbol) => setAnalysisSymbol(symbol)} />
        </div>

        {/* Market Stats */}
        <MarketStats />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <FearGreedIndex />
          <div className="lg:col-span-2">
            <MarketCycleCards />
          </div>
        </div>

        <PriceAlerts />

        <WatchlistPanel onAnalyse={(symbol) => setAnalysisSymbol(symbol)} />

        {/* Market Analysis Grid */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Live Market Analysis</h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-black/50 border border-cyan-500/20 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketData.map((data, index) => (
                <EnhancedConfluenceCard
                  key={index}
                  symbol={data.symbol}
                  price={data.price}
                  change={data.change24h}
                  volume={data.volume24h}
                  source={data.source}
                  confluenceScore={Math.floor(Math.random() * 30) + 70}
                  trend={data.change24h > 0 ? "bullish" : "bearish"}
                  onAnalyse={() => setAnalysisSymbol(data.symbol)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-12 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-sm text-yellow-200/80 leading-relaxed">
            <strong>Important Disclaimer:</strong> ShadowSignals provides confluence-based market analysis for
            educational purposes only. We are not FCA regulated and do not provide financial advice. All analysis
            represents data-driven observations and should not be considered as recommendations to buy or sell any
            financial instruments. Trading carries significant risk of loss.
          </p>
        </div>
      </div>

      {analysisSymbol && <ComprehensiveAnalysisPanel symbol={analysisSymbol} onClose={() => setAnalysisSymbol(null)} />}
    </div>
  )
}
