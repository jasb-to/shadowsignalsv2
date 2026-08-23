import type { Metadata } from "next"
import { DashboardClient } from "@/components/dashboard-client"

export const metadata: Metadata = {
  title: "A³ Terminal — Live Market Intelligence",
  description: "A³ market intelligence terminal: live data, analysis, cycle intelligence, confluence, risk and decision context.",
  keywords: ["A3 Markets", "market intelligence", "crypto analysis", "market terminal", "AI market analysis"],
  openGraph: {
    title: "A³ Terminal — Market Intelligence",
    description: "Artificial Intelligence × Analysis × Action.",
    url: "https://a3markets.vercel.app/dashboard",
  },
  alternates: { canonical: "https://a3markets.vercel.app/dashboard" },
}

export default function DashboardPage() {
  return <DashboardClient />
}
