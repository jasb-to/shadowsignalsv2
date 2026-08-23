import type { Metadata } from "next"
import { A3LearnHub } from "@/components/a3-learn-hub"

export const metadata: Metadata = {
  title: "A³ Learn — Market Intelligence Education",
  description: "Learn the market layers behind A³: BTC dominance, blockchain, on-chain data, liquidity, macro, technical analysis, confluence and risk.",
  keywords: ["A3 Markets", "BTC dominance", "blockchain education", "crypto education", "market intelligence", "technical analysis", "liquidity", "on-chain analysis", "macro markets"],
  openGraph: { title: "A³ Learn — Market Intelligence Education", description: "Understand the market. Then use the intelligence.", url: "https://a3markets.vercel.app/learn" },
  alternates: { canonical: "https://a3markets.vercel.app/learn" },
}

export default function LearnPage() { return <A3LearnHub /> }
