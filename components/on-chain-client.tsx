"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, TrendingUp, AlertTriangle, Bell, RefreshCw, ExternalLink } from "lucide-react"

interface WhaleTransaction {
  hash: string
  from: string
  to: string
  value: string
  valueUSD: string
  timestamp: string
  blockNumber: string
}

interface OnChainStats {
  whaleTransactions: number
  totalVolume: string
  smartMoney: number
  activeSignals: number
}

export function OnChainClient() {
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "notifications">("overview")
  const [stats, setStats] = useState<OnChainStats>({
    whaleTransactions: 0,
    totalVolume: "$0",
    smartMoney: 0,
    activeSignals: 0,
  })
  const [transactions, setTransactions] = useState<WhaleTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOnChainData()
  }, [])

  const fetchOnChainData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/on-chain/whale-tracker")
      const data = await response.json()
      setStats(data.stats)
      setTransactions(data.transactions)
    } catch (error) {
      console.error("[v0] Error fetching on-chain data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatValue = (value: string) => {
    const num = Number.parseFloat(value)
    if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`
    }
    return num.toFixed(4)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">
            On-Chain Whale Tracker
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Monitor large cryptocurrency transactions and smart money movements in real-time. Educational insights into
            whale behaviour and market dynamics.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-black/50 border-cyan-500/20 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <span className="text-gray-400">Whale Transactions</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.whaleTransactions}</div>
            <div className="text-sm text-gray-500">Last 24 hours</div>
          </Card>

          <Card className="bg-black/50 border-cyan-500/20 p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-gray-400">Total Volume</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalVolume}</div>
            <div className="text-sm text-gray-500">Whale movements</div>
          </Card>

          <Card className="bg-black/50 border-cyan-500/20 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Bell className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-400">Smart Money</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.smartMoney}</div>
            <div className="text-sm text-gray-500">Active wallets tracked</div>
          </Card>

          <Card className="bg-black/50 border-cyan-500/20 p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-gray-400">Active Alerts</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.activeSignals}</div>
            <div className="text-sm text-gray-500">Significant movements</div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "overview" ? "default" : "outline"}
            onClick={() => setActiveTab("overview")}
            className={activeTab === "overview" ? "bg-cyan-500 text-black" : "border-cyan-500/30 text-cyan-400"}
          >
            Overview
          </Button>
          <Button
            variant={activeTab === "transactions" ? "default" : "outline"}
            onClick={() => setActiveTab("transactions")}
            className={activeTab === "transactions" ? "bg-cyan-500 text-black" : "border-cyan-500/30 text-cyan-400"}
          >
            Recent Transactions
          </Button>
          <Button
            variant="outline"
            onClick={fetchOnChainData}
            className="border-cyan-500/30 text-cyan-400 ml-auto bg-transparent"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <Card className="bg-black/50 border-cyan-500/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4">What is Whale Tracking?</h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                Whale tracking monitors large cryptocurrency holders (typically wallets holding significant amounts of
                an asset). Their movements can indicate potential market trends, as large transactions often precede
                significant price changes.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                  <h4 className="font-semibold text-cyan-400 mb-2">Accumulation Signals</h4>
                  <p className="text-sm text-gray-400">
                    When whales move large amounts to cold storage or accumulate on exchanges, it may indicate bullish
                    sentiment.
                  </p>
                </div>
                <div className="p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                  <h4 className="font-semibold text-cyan-400 mb-2">Distribution Signals</h4>
                  <p className="text-sm text-gray-400">
                    Large movements to exchanges or frequent selling patterns may indicate whales taking profits or
                    reducing exposure.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-yellow-500/10 border-yellow-500/30 p-6">
              <h3 className="text-lg font-bold text-yellow-400 mb-2">Educational Disclaimer</h3>
              <p className="text-gray-400 text-sm">
                Whale tracking data is provided for educational purposes only. Large transactions do not guarantee
                future price movements and should not be used as the sole basis for investment decisions. Always conduct
                thorough research and consider multiple factors before trading.
              </p>
            </Card>
          </div>
        )}

        {activeTab === "transactions" && (
          <Card className="bg-black/50 border-cyan-500/20 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading transactions...</div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No recent whale transactions found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-cyan-500/10">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-cyan-400">Hash</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-cyan-400">From</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-cyan-400">To</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-cyan-400">Value (ETH)</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-cyan-400">Value (USD)</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-cyan-400">Time</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-cyan-400">View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyan-500/10">
                    {transactions.map((tx, index) => (
                      <tr key={tx.hash || index} className="hover:bg-cyan-500/5">
                        <td className="px-4 py-3 text-sm text-gray-300 font-mono">{formatAddress(tx.hash)}</td>
                        <td className="px-4 py-3 text-sm text-gray-300 font-mono">{formatAddress(tx.from)}</td>
                        <td className="px-4 py-3 text-sm text-gray-300 font-mono">{formatAddress(tx.to)}</td>
                        <td className="px-4 py-3 text-sm text-white text-right font-semibold">
                          {formatValue(tx.value)}
                        </td>
                        <td className="px-4 py-3 text-sm text-green-400 text-right">{tx.valueUSD}</td>
                        <td className="px-4 py-3 text-sm text-gray-400 text-right">
                          {new Date(tx.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <a
                            href={`https://etherscan.io/tx/${tx.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300"
                          >
                            <ExternalLink className="w-4 h-4 inline" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
