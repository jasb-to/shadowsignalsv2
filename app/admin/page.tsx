"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, RefreshCw, Lock, BarChart3, Users, Activity, Globe, Shield } from "lucide-react"

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [apiStatus, setApiStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const ADMIN_PASSWORD = "shadowsignals2025"

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true)
      fetchAPIStatus()
    } else {
      alert("Incorrect password")
    }
  }

  const fetchAPIStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/status")
      const data = await response.json()
      setApiStatus(data)
    } catch (error) {
      console.error("Failed to fetch API status:", error)
    } finally {
      setLoading(false)
    }
  }

  const resetAI = async () => {
    if (confirm("Are you sure you want to reset AI analysis cache?")) {
      try {
        await fetch("/api/admin/reset-ai", { method: "POST" })
        alert("AI cache reset successfully")
        fetchAPIStatus()
      } catch (error) {
        alert("Failed to reset AI cache")
      }
    }
  }

  useEffect(() => {
    if (authenticated) {
      const interval = setInterval(fetchAPIStatus, 30000) // Refresh every 30s
      return () => clearInterval(interval)
    }
  }, [authenticated])

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center py-20">
        <Card className="w-full max-w-md bg-black/50 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-400">
              <Lock className="w-5 h-5" />
              Admin Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              className="bg-black/50 border-cyan-500/30 text-white"
            />
            <Button onClick={handleLogin} className="w-full bg-cyan-500 hover:bg-cyan-600 text-black">
              Login
            </Button>
            <p className="text-xs text-gray-400 text-center">Password: shadowsignals2025</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-cyan-400" />
              <h1 className="text-3xl font-bold text-white">Shadow Signals Admin</h1>
              <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded-full border border-red-500/30">
                Private Access
              </span>
            </div>
            <p className="text-gray-400 text-sm">Platform Management Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={fetchAPIStatus}
              disabled={loading}
              variant="outline"
              className="border-cyan-500/30 bg-transparent hover:bg-cyan-500/10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh Status
            </Button>
            <span className="px-4 py-2 bg-orange-500/20 text-orange-400 text-sm font-semibold rounded border border-orange-500/30">
              Admin Panel v1.0
            </span>
          </div>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">API Calls Today</span>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{apiStatus?.totalCalls || 0}</div>
              <div className="text-xs text-gray-500">Real-time tracking</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">API Success Rate</span>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{apiStatus?.successRate || "0%"}</div>
              <div className="text-xs text-gray-500">Current session</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Active Users</span>
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">1</div>
              <div className="text-xs text-gray-500">You (Admin)</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">System Uptime</span>
                <Activity className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{apiStatus?.uptime || "99.9%"}</div>
              <div className="text-xs text-gray-500">Current session</div>
            </CardContent>
          </Card>
        </div>

        {/* Live Market Overview */}
        <Card className="bg-gray-900/50 border-gray-800 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Live Market Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-gray-400 text-sm mb-1">Total Market Cap</div>
                <div className="text-2xl font-bold text-white">{apiStatus?.marketData?.totalMarketCap || "$N/A"}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm mb-1">24h Volume</div>
                <div className="text-2xl font-bold text-white">{apiStatus?.marketData?.volume24h || "$N/A"}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm mb-1">Market Cap Change 24h</div>
                <div className="text-2xl font-bold text-red-400">{apiStatus?.marketData?.change24h || "N/A%"}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Interface */}
        <Tabs defaultValue="api-status" className="w-full">
          <TabsList className="bg-gray-900/50 border-b border-gray-800 w-full justify-start rounded-none h-auto p-0">
            <TabsTrigger
              value="api-status"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 rounded-none px-6 py-3"
            >
              API Status
            </TabsTrigger>
            <TabsTrigger
              value="token-management"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 rounded-none px-6 py-3"
            >
              Token Management
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 rounded-none px-6 py-3"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="system"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 rounded-none px-6 py-3"
            >
              System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="api-status" className="mt-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Globe className="w-5 h-5" />
                  API Endpoints Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {apiStatus?.apis?.map((api: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      {api.online ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                      <div>
                        <div className="font-semibold text-white">{api.name}</div>
                        <div className="text-xs text-gray-500">Last checked: {api.lastChecked}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-gray-400">Response: </span>
                        <span className="text-white font-mono">{api.responseTime}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Calls: </span>
                        <span className="text-white font-mono">{api.calls}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Error Rate: </span>
                        <span className="text-white font-mono">{api.errorRate}</span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded text-xs font-semibold ${
                          api.online
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {api.online ? "ONLINE" : "OFFLINE"}
                      </span>
                      {api.name === "AI Analysis" && (
                        <Button
                          onClick={resetAI}
                          size="sm"
                          className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Reset AI
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="token-management" className="mt-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Token Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Token management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Analytics features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="mt-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">System Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">System configuration features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
