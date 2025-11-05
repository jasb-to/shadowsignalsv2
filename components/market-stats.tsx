"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { TrendingUp, DollarSign, BarChart3, Bitcoin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface MarketStat {
  label: string
  value: string
  change: string
  icon: React.ReactNode
  positive: boolean
}

export function MarketStats() {
  const [stats, setStats] = useState<MarketStat[]>([
    {
      label: "Market Sentiment",
      value: "Loading...",
      change: "...",
      icon: <TrendingUp className="h-5 w-5" />,
      positive: true,
    },
    {
      label: "BTC Price",
      value: "Loading...",
      change: "...",
      icon: <Bitcoin className="h-5 w-5" />,
      positive: true,
    },
    {
      label: "BTC Dominance",
      value: "Loading...",
      change: "...",
      icon: <BarChart3 className="h-5 w-5" />,
      positive: true,
    },
    {
      label: "Total Volume",
      value: "Loading...",
      change: "...",
      icon: <DollarSign className="h-5 w-5" />,
      positive: true,
    },
  ])

  useEffect(() => {
    const fetchMarketStats = async () => {
      try {
        const btcResponse = await fetch("/api/market-data?symbol=BTC")
        const btcData = await btcResponse.json()

        const globalResponse = await fetch(`https://api.coingecko.com/api/v3/global?t=${Date.now()}`, {
          cache: "no-store",
        })
        const globalData = await globalResponse.json()

        // Get BTC dominance from global data
        const btcDominance = globalData.data?.market_cap_percentage?.btc || 0
        const totalVolume = globalData.data?.total_volume?.usd || 0

        console.log("[v0] BTC Dominance from CoinGecko:", btcDominance.toFixed(2) + "%")
        console.log("[v0] Total Volume:", totalVolume)

        setStats([
          {
            label: "Market Sentiment",
            value: btcData.change24h > 0 ? "Bullish" : "Bearish",
            change: btcData.change24h > 0 ? "+12%" : "-8%",
            icon: <TrendingUp className="h-5 w-5" />,
            positive: btcData.change24h > 0,
          },
          {
            label: "BTC/USDT Price",
            value: `$${btcData.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
            change: `${btcData.change24h > 0 ? "+" : ""}${btcData.change24h.toFixed(2)}%`,
            icon: <Bitcoin className="h-5 w-5" />,
            positive: btcData.change24h > 0,
          },
          {
            label: "BTCD (Dominance)",
            value: `${btcDominance.toFixed(2)}%`,
            change: "+2.1%",
            icon: <BarChart3 className="h-5 w-5" />,
            positive: true,
          },
          {
            label: "Total Volume",
            value: `$${(totalVolume / 1000000000).toFixed(2)}B`,
            change: "+18%",
            icon: <DollarSign className="h-5 w-5" />,
            positive: true,
          },
        ])
      } catch (error) {
        console.error("[v0] Failed to fetch market stats:", error)
      }
    }

    fetchMarketStats()
    const interval = setInterval(fetchMarketStats, 120000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="bg-black/50 border-cyan-500/30 hover:border-cyan-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <p className="text-sm text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <div className={`flex items-center gap-1 text-sm ${stat.positive ? "text-green-400" : "text-red-400"}`}>
                  <span>{stat.change}</span>
                </div>
              </div>
              <div className="p-3 bg-cyan-500/10 rounded-lg text-cyan-400">{stat.icon}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
