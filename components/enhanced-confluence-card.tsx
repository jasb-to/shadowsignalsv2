"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown, Activity, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface EnhancedConfluenceCardProps {
  data?: {
    symbol?: string
    price?: number
    change24h?: number
    volume24h?: number
    source?: string
    confluenceScore?: number
    trend?: "bullish" | "bearish" | "neutral"
  }
  symbol?: string
  price?: number
  change?: number
  volume?: number
  source?: string
  confluenceScore?: number
  trend?: "bullish" | "bearish" | "neutral"
  onAnalyse?: () => void
}

export function EnhancedConfluenceCard({
  data,
  symbol: propSymbol,
  price: propPrice,
  change: propChange,
  volume: propVolume,
  source: propSource,
  confluenceScore: propConfluence,
  trend: propTrend,
  onAnalyse,
}: EnhancedConfluenceCardProps) {
  const symbol = data?.symbol || propSymbol || "N/A"
  const price = data?.price ?? propPrice ?? 0
  const change = data?.change24h ?? propChange ?? 0
  const volume = data?.volume24h ?? propVolume ?? 0
  const source = data?.source || propSource || "Unknown"
  const confluenceScore = data?.confluenceScore ?? propConfluence ?? 50
  const trend = data?.trend || propTrend || "neutral"

  const [loadingInsights, setLoadingInsights] = useState(false)

  const handleGetInsights = async () => {
    if (onAnalyse) {
      onAnalyse()
    }
  }

  const safePrice = typeof price === "number" && !isNaN(price) ? price : 0
  const safeChange = typeof change === "number" && !isNaN(change) ? change : 0
  const safeVolume = typeof volume === "number" && !isNaN(volume) ? volume : 0
  const safeScore = typeof confluenceScore === "number" && !isNaN(confluenceScore) ? confluenceScore : 50

  const isPositive = safeChange > 0
  const TrendIcon = isPositive ? TrendingUp : TrendingDown

  const displayTrend =
    trend !== "neutral" ? trend : safeChange > 1 ? "bullish" : safeChange < -1 ? "bearish" : "neutral"

  return (
    <Card className="bg-black/50 border-cyan-500/30 hover:border-cyan-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-white">{symbol}</CardTitle>
            <p className="text-xs text-gray-500 mt-1">Source: {source}</p>
          </div>
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full ${
              isPositive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
            }`}
          >
            <TrendIcon className="h-3 w-3" />
            <span className="text-xs font-semibold">
              {isPositive ? "+" : ""}
              {safeChange.toFixed(2)}%
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price */}
        <div>
          <p className="text-3xl font-bold text-white">
            $
            {safePrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: safePrice < 1 ? 6 : 2,
            })}
          </p>
        </div>

        {/* Confluence Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Confluence Score</span>
            <span className="text-sm font-semibold text-cyan-400">{safeScore}/100</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${safeScore}%` }}
            />
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">24h Volume</span>
          <span className="text-white font-medium">
            $
            {safeVolume > 1000000000
              ? (safeVolume / 1000000000).toFixed(2) + "B"
              : (safeVolume / 1000000).toFixed(2) + "M"}
          </span>
        </div>

        {/* Trend Badge */}
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-cyan-500" />
          <span className="text-sm text-gray-400">Trend:</span>
          <span
            className={`text-sm font-semibold ${
              displayTrend === "bullish"
                ? "text-green-400"
                : displayTrend === "bearish"
                  ? "text-red-400"
                  : "text-gray-400"
            }`}
          >
            {displayTrend.charAt(0).toUpperCase() + displayTrend.slice(1)}
          </span>
        </div>

        {/* AI Insights Button */}
        <Button
          onClick={handleGetInsights}
          disabled={loadingInsights}
          className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
          variant="outline"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          AI Analyse
        </Button>
      </CardContent>
    </Card>
  )
}
