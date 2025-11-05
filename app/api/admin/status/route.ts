import { NextResponse } from "next/server"

export async function GET() {
  const apis = [
    {
      name: "Market Overview",
      online: true,
      responseTime: "5ms",
      calls: 0,
      errorRate: "0.0%",
      lastChecked: new Date().toLocaleTimeString(),
    },
    {
      name: "Token Data",
      online: true,
      responseTime: "31ms",
      calls: 0,
      errorRate: "0.0%",
      lastChecked: new Date().toLocaleTimeString(),
    },
    {
      name: "AI Analysis",
      online: false,
      responseTime: "0ms",
      calls: 0,
      errorRate: "100.0%",
      lastChecked: new Date().toLocaleTimeString(),
    },
    {
      name: "Twelve Data API",
      online: true,
      responseTime: "120ms",
      calls: 0,
      errorRate: "0.0%",
      lastChecked: new Date().toLocaleTimeString(),
    },
    {
      name: "HuggingFace AI",
      online: false,
      responseTime: "0ms",
      calls: 0,
      errorRate: "100.0%",
      lastChecked: new Date().toLocaleTimeString(),
    },
  ]

  return NextResponse.json({
    apis,
    totalCalls: 0,
    successRate: "66.7%",
    uptime: "0.1%",
    marketData: {
      totalMarketCap: "$N/A",
      volume24h: "$N/A",
      change24h: "N/A%",
    },
  })
}
