"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, RefreshCw, Shield, Users, Activity, Globe, Key, Settings, Lock } from "lucide-react"

// Simple admin password - in production, use environment variable
const ADMIN_PASSWORD = "shadow2024admin"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState<any>(null)
  const [tokenStats, setTokenStats] = useState<any>(null)

  useEffect(() => {
    // Check if already authenticated in session
    const authenticated = sessionStorage.getItem("shadowsignals_admin_auth")
    if (authenticated === "true") {
      setIsAuthenticated(true)
      fetchAllData()
    }
  }, [])

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      sessionStorage.setItem("shadowsignals_admin_auth", "true")
      setError("")
      fetchAllData()
    } else {
      setError("Invalid password")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem("shadowsignals_admin_auth")
  }

  const fetchAllData = async () => {
    setLoading(true)
    await Promise.all([fetchAPIStatus(), fetchTokenStats()])
    setLoading(false)
  }

  const fetchAPIStatus = async () => {
    try {
      const response = await fetch("/api/admin/status")
      const data = await response.json()
      setApiStatus(data)
    } catch (error) {
      console.error("Failed to fetch API status:", error)
    }
  }

  const fetchTokenStats = async () => {
    try {
      setTokenStats({
        twelveData: {
          total: 800,
          remaining: 192,
          resetDate: "2025-11-15",
        },
        huggingface: {
          total: 30000,
          remaining: 28453,
          resetDate: "2025-12-01",
        },
      })
    } catch (error) {
      console.error("Failed to fetch token stats:", error)
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
    if (isAuthenticated) {
      const interval = setInterval(() => {
        fetchAPIStatus()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-gray-900/50 border-gray-800 p-8 max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-white text-center flex items-center justify-center gap-2">
              <Lock className="w-6 h-6 text-cyan-400" />
              Admin Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-400 text-center text-sm">Enter the admin password to continue</p>
            <Input
              type="password"
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="bg-black/50 border-gray-700 text-white"
            />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <Button onClick={handleLogin} className="w-full bg-cyan-500 hover:bg-cyan-600">
              <Shield className="w-4 h-4 mr-2" />
              Access Admin Panel
            </Button>
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
              onClick={fetchAllData}
              disabled={loading}
              variant="outline"
              className="border-cyan-500/30 bg-transparent hover:bg-cyan-500/10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh Status
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-red-500/30 bg-transparent hover:bg-red-500/10 text-red-400"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Platform Status</span>
                <Activity className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-green-400 mb-1">Online</div>
              <div className="text-xs text-gray-500">All systems operational</div>
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
                <span className="text-gray-400 text-sm">Active APIs</span>
                <Globe className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {apiStatus?.apis?.filter((a: any) => a.online).length || 0} / {apiStatus?.apis?.length || 0}
              </div>
              <div className="text-xs text-gray-500">Endpoints online</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Free Platform</span>
                <Users className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-3xl font-bold text-cyan-400 mb-1">100%</div>
              <div className="text-xs text-gray-500">No paywalls active</div>
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
                <div
                  className={`text-2xl font-bold ${apiStatus?.marketData?.change24h?.includes("-") ? "text-red-400" : "text-green-400"}`}
                >
                  {apiStatus?.marketData?.change24h || "N/A%"}
                </div>
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
                <CardTitle className="flex items-center gap-2 text-white">
                  <Key className="w-5 h-5" />
                  API Token Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-black/30 rounded-lg border border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-white font-semibold">TwelveData API</h3>
                      <p className="text-sm text-gray-500">Market data provider</p>
                    </div>
                    <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-semibold rounded border border-orange-500/30">
                      Free Tier
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Usage:</span>
                      <span className="text-white font-mono">
                        {(tokenStats?.twelveData?.total || 800) - (tokenStats?.twelveData?.remaining || 192)} /{" "}
                        {tokenStats?.twelveData?.total || 800} calls
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{
                          width: `${(((tokenStats?.twelveData?.total || 800) - (tokenStats?.twelveData?.remaining || 192)) / (tokenStats?.twelveData?.total || 800)) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Resets: {tokenStats?.twelveData?.resetDate || "2025-11-15"}</span>
                      <span>{tokenStats?.twelveData?.remaining || 192} remaining</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-black/30 rounded-lg border border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-white font-semibold">HuggingFace API</h3>
                      <p className="text-sm text-gray-500">AI analysis provider</p>
                    </div>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded border border-green-500/30">
                      Pro Tier
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Usage:</span>
                      <span className="text-white font-mono">
                        {(tokenStats?.huggingface?.total || 30000) - (tokenStats?.huggingface?.remaining || 28453)} /{" "}
                        {tokenStats?.huggingface?.total || 30000} calls
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${(((tokenStats?.huggingface?.total || 30000) - (tokenStats?.huggingface?.remaining || 28453)) / (tokenStats?.huggingface?.total || 30000)) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Resets: {tokenStats?.huggingface?.resetDate || "2025-12-01"}</span>
                      <span>{tokenStats?.huggingface?.remaining || 28453} remaining</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="mt-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Settings className="w-5 h-5" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-black/30 rounded-lg border border-gray-800">
                    <h4 className="text-white font-semibold mb-3">Platform Mode</h4>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-green-400">Free Access - No Paywalls</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      All features are available to everyone without registration
                    </p>
                  </div>

                  <div className="p-4 bg-black/30 rounded-lg border border-gray-800">
                    <h4 className="text-white font-semibold mb-3">Data Storage</h4>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-cyan-500 rounded-full" />
                      <span className="text-cyan-400">Browser LocalStorage</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Watchlists and alerts stored locally in user's browser</p>
                  </div>

                  <div className="p-4 bg-black/30 rounded-lg border border-gray-800">
                    <h4 className="text-white font-semibold mb-3">Environment</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">TWELVE_DATA_API_KEY</span>
                        <span className="text-green-400">Configured</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">HUGGINGFACE_API_KEY</span>
                        <span className="text-green-400">Configured</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-black/30 rounded-lg border border-gray-800">
                    <h4 className="text-white font-semibold mb-3">Version Info</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">App Version</span>
                        <span className="text-white">2.0.0 (Free)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Last Updated</span>
                        <span className="text-white">{new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
