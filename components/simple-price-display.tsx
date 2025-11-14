"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from 'lucide-react'

interface SimplePriceDisplayProps {
  symbol: string
  currentPrice: number
}

export function SimplePriceDisplay({ symbol, currentPrice }: SimplePriceDisplayProps) {
  return (
    <Card className="bg-black/50 border-cyan-500/20 p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Current Price</h3>
          <div className="text-sm text-gray-400">{symbol}</div>
        </div>

        <div className="space-y-2">
          <div className="text-3xl font-bold text-cyan-400">
            ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
          </div>
          <p className="text-sm text-gray-400">Live market price from aggregated sources</p>
        </div>

        <div className="pt-4 border-t border-cyan-500/20">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Real-time data</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
