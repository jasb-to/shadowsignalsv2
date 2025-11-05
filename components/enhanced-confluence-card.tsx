"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown, Activity, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface EnhancedConfluenceCardProps {
  symbol: string
  price: number
  change: number
  volume: number
  source: string
  confluenceScore: number
  trend: "bullish" | "bearish" | "neutral"
  onAnalyse?: () => void
}

export function EnhancedConfluenceCard({
  symbol,
  price,
  change,
  volume,
  source,
  confluenceScore,
  trend,
  onAnalyse,
}: EnhancedConfluenceCardProps) {
  const [loadingInsights, setLoadingInsights] = useState(false)

  const handleGetInsights = async () => {
    if (onAnalyse) {
      onAnalyse()
    }
  }

  const isPositive = change > 0
  const TrendIcon = isPositive ? TrendingUp : TrendingDown

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
              {change.toFixed(2)}%
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price */}
        <div>
          <p className="text-3xl font-bold text-white">
            $
            {price.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: price < 1 ? 6 : 2,
            })}
          </p>
        </div>

        {/* Confluence Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Confluence Score</span>
            <span className="text-sm font-semibold text-cyan-400">{confluenceScore}/100</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${confluenceScore}%` }}
            />
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">24h Volume</span>
          <span className="text-white font-medium">${(volume / 1000000).toFixed(2)}M</span>
        </div>

        {/* Trend Badge */}
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-cyan-500" />
          <span className="text-sm text-gray-400">Trend:</span>
          <span
            className={`text-sm font-semibold ${
              trend === "bullish" ? "text-green-400" : trend === "bearish" ? "text-red-400" : "text-gray-400"
            }`}
          >
            {trend.charAt(0).toUpperCase() + trend.slice(1)}
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
