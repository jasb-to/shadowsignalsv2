import type { Metadata } from "next"
import { LearnClient } from "@/components/learn-client"

export const metadata: Metadata = {
  title: "Trading Education Hub - Learn Technical Analysis & Crypto Trading Strategies",
  description:
    "Free comprehensive trading education. Learn confluence trading, technical analysis, RSI, MACD, Bollinger Bands, support and resistance. Master cryptocurrency and stock market analysis with our expert guides.",
  keywords: [
    "trading education",
    "learn trading",
    "technical analysis tutorial",
    "crypto trading course",
    "trading strategies",
    "confluence trading",
    "RSI indicator",
    "MACD indicator",
    "bollinger bands",
    "support resistance",
    "candlestick patterns",
    "trading indicators",
    "cryptocurrency education",
    "stock trading basics",
    "forex education",
    "free trading course",
  ],
  openGraph: {
    title: "Trading Education Hub - Learn Technical Analysis | ShadowSignals",
    description:
      "Free comprehensive trading education covering technical analysis, indicators, and proven trading strategies.",
    url: "https://www.shadowsignals.live/learn",
  },
  alternates: {
    canonical: "https://www.shadowsignals.live/learn",
  },
}

export default function LearnPage() {
  return <LearnClient />
}
