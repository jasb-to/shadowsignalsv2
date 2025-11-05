"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"

interface FearGreedData {
  value: number
  classification: string
  timestamp: number
}

export function FearGreedIndex() {
  const [data, setData] = useState<FearGreedData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFearGreed = async () => {
      try {
        const response = await fetch("/api/fear-greed")
        if (response.ok) {
          const result = await response.json()
          setData(result)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch Fear & Greed Index:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFearGreed()
    const interval = setInterval(fetchFearGreed, 300000) // Update every 5 minutes
    return () => clearInterval(interval)
  }, [])

  if (loading || !data) {
    return (
      <Card className="bg-black/50 border-cyan-500/20 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-4" />
          <div className="h-24 bg-gray-700 rounded" />
        </div>
      </Card>
    )
  }

  const getColor = (value: number) => {
    if (value <= 25) return "from-red-600 to-red-400"
    if (value <= 45) return "from-orange-600 to-orange-400"
    if (value <= 55) return "from-yellow-600 to-yellow-400"
    if (value <= 75) return "from-green-600 to-green-400"
    return "from-emerald-600 to-emerald-400"
  }

  const getTextColor = (value: number) => {
    if (value <= 25) return "text-red-400"
    if (value <= 45) return "text-orange-400"
    if (value <= 55) return "text-yellow-400"
    if (value <= 75) return "text-green-400"
    return "text-emerald-400"
  }

  return (
    <Card className="bg-black/50 border-cyan-500/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Fear & Greed Index</h3>
        <div className={`text-2xl font-bold ${getTextColor(data.value)}`}>{data.value}</div>
      </div>

      <div className="mb-4">
        <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getColor(data.value)} transition-all duration-500`}
            style={{ width: `${data.value}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Extreme Fear</span>
          <span>Neutral</span>
          <span>Extreme Greed</span>
        </div>
      </div>

      <div className="text-center">
        <div className={`text-xl font-bold ${getTextColor(data.value)} mb-1`}>{data.classification}</div>
        <div className="text-xs text-gray-400">
          Market sentiment indicator based on volatility, momentum, social media, and surveys
        </div>
      </div>
    </Card>
  )
}
