import type { Metadata } from "next"
import { DashboardClient } from "@/components/dashboard-client"

export const metadata: Metadata = {
  title: "Live Crypto Dashboard - Real-Time Bitcoin, Ethereum & Stock Analysis",
  description:
    "Free real-time cryptocurrency and stock market dashboard. Live Bitcoin price analysis, Ethereum tracking, confluence scoring, fear & greed index, and AI-powered market insights. Updated every 5 minutes.",
  keywords: [
    "crypto dashboard",
    "bitcoin dashboard",
    "ethereum dashboard",
    "live crypto prices",
    "real-time market analysis",
    "cryptocurrency tracker",
    "stock market dashboard",
    "bitcoin price live",
    "crypto trading dashboard",
    "market analytics dashboard",
  ],
  openGraph: {
    title: "Live Crypto Dashboard - Real-Time Market Analysis | ShadowSignals",
    description:
      "Free real-time cryptocurrency and stock market dashboard with AI-powered analysis and confluence scoring.",
    url: "https://www.shadowsignals.live/dashboard",
  },
  alternates: {
    canonical: "https://www.shadowsignals.live/dashboard",
  },
}

export default function DashboardPage() {
  return <DashboardClient />
}
