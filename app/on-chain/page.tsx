"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, TrendingUp, AlertTriangle, Bell, RefreshCw, ExternalLink } from 'lucide-react'

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

export default function OnChainPage() {
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-cyan-500/20 bg-gradient-to-r from-black via-cyan-500/5 to-black">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                On-Chain Analyst
              </h1>
              <p className="text-gray-400">Real-time whale tracking and smart money analysis</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-4 py-2 text-sm text-cyan-400">
                FREE Plan
              </div>
              <Button
                onClick={fetchOnChainData}
                variant="outline"
                className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 bg-transparent"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Status
              </Button>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-2 text-sm text-yellow-400">
                Admin Panel v1.0
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-cyan-500/10 to-transparent border-cyan-500/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-400 text-sm">Whale Transactions</div>
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-4xl font-bold text-white mb-1">{stats.whaleTransactions}</div>
            <div className="text-xs text-gray-500">Real-time tracking</div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-400 text-sm">Total Volume</div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-4xl font-bold text-white mb-1">{stats.totalVolume}</div>
            <div className="text-xs text-gray-500">Current session</div>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-400 text-sm">Smart Money</div>
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-4xl font-bold text-white mb-1">{stats.smartMoney}</div>
            <div className="text-xs text-gray-500">You (Admin)</div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-400 text-sm">Active Signals</div>
              <Bell className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-4xl font-bold text-white mb-1">{stats.activeSignals}</div>
            <div className="text-xs text-gray-500">Current session</div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-cyan-500/20">
          {[
            { id: "overview", label: "Overview" },
            { id: "transactions", label: "Whale Transactions" },
            { id: "notifications", label: "Notifications" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === tab.id ? "text-cyan-400 border-b-2 border-cyan-400" : "text-gray-400 hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Whale Activity */}
            <Card className="bg-black/50 border-cyan-500/20 p-6">
              <h3 className="text-xl font-semibold text-cyan-400 mb-6">Recent Whale Activity</h3>
              <div className="space-y-4">
                {transactions.slice(0, 3).map((tx, index) => (
                  <div key={index} className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-cyan-500 text-black text-xs font-bold px-2 py-1 rounded">WHALE</span>
                        <span className="text-white font-semibold">ETH</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">
                      Large transfer detected: {tx.value} ETH ({tx.valueUSD})
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{tx.timestamp}</p>
                  </div>
                ))}
                {transactions.length > 3 && (
                  <div className="text-center py-4 border border-cyan-500/20 rounded-lg">
                    <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
                      View all {transactions.length} whale transactions in the Whale Transactions tab
                    </p>
                  </div>
                )}
                {transactions.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No recent whale activity detected
                  </div>
                )}
              </div>
            </Card>

            {/* Top Tokens by Volume */}
            <Card className="bg-black/50 border-cyan-500/20 p-6">
              <h3 className="text-xl font-semibold text-cyan-400 mb-6">Top Tokens by Volume</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 font-mono">#1</span>
                    <span className="text-white font-semibold">ETH</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">{stats.totalVolume}</div>
                    <div className="text-xs text-gray-400">{stats.whaleTransactions} txs</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Whale Transactions Tab */}
        {activeTab === "transactions" && (
          <Card className="bg-black/50 border-cyan-500/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-cyan-400">Whale Transactions</h3>
              <Button
                onClick={fetchOnChainData}
                variant="outline"
                size="sm"
                className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 bg-transparent"
              >
                Refresh
              </Button>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12 text-gray-400">Loading transactions...</div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12 text-gray-400">No whale transactions detected</div>
              ) : (
                transactions.map((tx, index) => (
                  <div key={index} className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">transfer</span>
                        </div>
                        <div className="text-white font-semibold mb-1">
                          {tx.value} ETH ({tx.valueUSD})
                        </div>
                        <div className="text-xs text-gray-400">{tx.timestamp}</div>
                      </div>
                      <a
                        href={`https://etherscan.io/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1"
                      >
                        View on Etherscan
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <Card className="bg-black/50 border-cyan-500/20 p-6">
            <h3 className="text-xl font-semibold text-cyan-400 mb-6">Notifications</h3>
            <div className="text-center py-12 text-gray-400">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No new notifications</p>
            </div>
          </Card>
        )}

        {/* Unlock CTA */}
        <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/30 p-8 mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Unlock Full On-Chain Analysis</h3>
              <p className="text-gray-400">Get unlimited whale tracking, AI analysis, and real-time alerts</p>
            </div>
            <Button className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black font-semibold">
              Coming Soon
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
