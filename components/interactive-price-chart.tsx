"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface PriceChartProps {
  symbol: string
  currentPrice: number
}

export function InteractivePriceChart({ symbol, currentPrice }: PriceChartProps) {
  const [timeframe, setTimeframe] = useState<"1H" | "4H" | "1D" | "1W">("1D")
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const generateChartData = () => {
      const dataPoints = timeframe === "1H" ? 60 : timeframe === "4H" ? 96 : timeframe === "1D" ? 24 : 168
      const volatility = currentPrice * 0.02
      let price = currentPrice * 0.95

      const data = Array.from({ length: dataPoints }, (_, i) => {
        price += (Math.random() - 0.48) * volatility
        const timestamp =
          Date.now() -
          (dataPoints - i) *
            (timeframe === "1H" ? 60000 : timeframe === "4H" ? 900000 : timeframe === "1D" ? 3600000 : 3600000)

        return {
          time: new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: timeframe === "1W" ? undefined : "2-digit",
            month: timeframe === "1W" ? "short" : undefined,
            day: timeframe === "1W" ? "numeric" : undefined,
          }),
          price: Number(price.toFixed(2)),
          volume: Math.random() * 1000000,
        }
      })

      data[data.length - 1].price = currentPrice
      setChartData(data)
      setLoading(false)
    }

    generateChartData()
  }, [timeframe, currentPrice, symbol])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-cyan-500/30 p-3 rounded-lg">
          <p className="text-cyan-400 font-semibold">${payload[0].value.toFixed(2)}</p>
          <p className="text-gray-400 text-sm">{payload[0].payload.time}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="bg-black/50 border-cyan-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Price Chart - {symbol}</CardTitle>
          <div className="flex gap-2">
            {(["1H", "4H", "1D", "1W"] as const).map((tf) => (
              <Button
                key={tf}
                size="sm"
                variant={timeframe === tf ? "default" : "outline"}
                onClick={() => setTimeframe(tf)}
                className={
                  timeframe === tf
                    ? "bg-cyan-500 text-white hover:bg-cyan-600"
                    : "border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 bg-transparent"
                }
              >
                {tf}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-cyan-400">Loading chart...</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#64748b" style={{ fontSize: "12px" }} />
              <YAxis stroke="#64748b" style={{ fontSize: "12px" }} domain={["auto", "auto"]} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="price" stroke="#06b6d4" strokeWidth={2} fill="url(#priceGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
