import type { Metadata } from "next"
import { OnChainClient } from "@/components/on-chain-client"

export const metadata: Metadata = {
  title: "On-Chain Whale Tracker - Bitcoin & Ethereum Whale Alerts & Smart Money",
  description:
    "Free real-time cryptocurrency whale tracking and on-chain analysis. Monitor large Bitcoin and Ethereum transactions, smart money movements, and whale wallet activity. Educational on-chain analytics.",
  keywords: [
    "whale tracker",
    "crypto whale alerts",
    "bitcoin whale",
    "ethereum whale",
    "on-chain analysis",
    "whale watching crypto",
    "large crypto transactions",
    "smart money crypto",
    "blockchain analysis",
    "whale wallet tracker",
    "bitcoin large transactions",
    "ethereum whale alert",
    "crypto whale movements",
  ],
  openGraph: {
    title: "On-Chain Whale Tracker - Bitcoin & Ethereum Whale Alerts | ShadowSignals",
    description:
      "Free real-time cryptocurrency whale tracking. Monitor large Bitcoin and Ethereum transactions and smart money movements.",
    url: "https://www.shadowsignals.live/on-chain",
  },
  alternates: {
    canonical: "https://www.shadowsignals.live/on-chain",
  },
}

export default function OnChainPage() {
  return <OnChainClient />
}
