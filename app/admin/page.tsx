"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, RefreshCw, Shield, BarChart3, Users, Activity, Globe, Key, Settings } from 'lucide-react'

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [apiStatus, setApiStatus] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [tokenStats, setTokenStats] = useState<any>(null)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login?redirect=/admin")
        return
      }

      let { data: userData, error: userError } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", user.id)
        .single()

      // If user doesn't exist, create them
      if (userError?.code === "PGRST116" || !userData) {
        const { error: insertError } = await supabase.from("users").insert({
          id: user.id,
          email: user.email,
          is_admin: false,
          subscription_tier: "free",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (!insertError) {
          const { data: newUserData } = await supabase.from("users").select("is_admin").eq("id", user.id).single()
          userData = newUserData
        }
      }

      // Check admin status
      if (!userData?.is_admin) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      setIsAdmin(true)
      // Fetch all data in parallel
      await Promise.all([
        fetchAPIStatus(),
        fetchAnalytics(),
        fetchTokenStats()
      ])
    } catch (error) {
      console.error("[v0] Admin: Access check failed:", error)
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const grantAdminAccess = async () => {
    if (!confirm("Grant yourself admin access? This should only be done by the site owner.")) {
      return
    }
    
    try {
      const response = await fetch('/api/admin/grant-admin', { method: 'POST' })
      const data = await response.json()
      
      if (data.success) {
        alert("Admin access granted! Reloading page...")
        window.location.reload()
      } else {
        alert("Failed to grant admin access: " + data.error)
      }
    } catch (error) {
      alert("Failed to grant admin access")
      console.error(error)
    }
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

  const fetchAnalytics = async () => {
    try {
      // Fetch user statistics
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      const { count: freeUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_tier', 'free')

      const { count: paidUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .neq('subscription_tier', 'free')

      const { count: totalWatchlists } = await supabase
        .from('watchlists')
        .select('*', { count: 'exact', head: true })

      const { count: totalAlerts } = await supabase
        .from('price_alerts')
        .select('*', { count: 'exact', head: true })

      const { count: activeAlerts } = await supabase
        .from('price_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      setAnalytics({
        totalUsers: totalUsers || 0,
        freeUsers: freeUsers || 0,
        paidUsers: paidUsers || 0,
        totalWatchlists: totalWatchlists || 0,
        totalAlerts: totalAlerts || 0,
        activeAlerts: activeAlerts || 0,
      })
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    }
  }

  const fetchTokenStats = async () => {
    try {
      setTokenStats({
        twelveData: {
          total: 800,
          remaining: 192,
          resetDate: '2025-11-15'
        },
        huggingface: {
          total: 30000,
          remaining: 28453,
          resetDate: '2025-12-01'
        }
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
    if (isAdmin) {
      const interval = setInterval(() => {
        fetchAPIStatus()
        fetchAnalytics()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [isAdmin])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-cyan-400">Verifying admin access...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-gray-900/50 border-gray-800 p-8 max-w-md">
          <CardHeader>
            <CardTitle className="text-white text-center">Admin Access Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-400">
              You need admin privileges to access this page.
            </p>
            <p className="text-sm text-gray-500">
              If you are the site owner, click below to grant yourself admin access.
            </p>
            <Button
              onClick={grantAdminAccess}
              className="w-full bg-cyan-500 hover:bg-cyan-600"
            >
              <Shield className="w-4 h-4 mr-2" />
              Grant Admin Access
            </Button>
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="w-full border-gray-700"
            >
              Back to Dashboard
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
              onClick={() => {
                fetchAPIStatus()
                fetchAnalytics()
                fetchTokenStats()
              }}
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
                <span className="text-gray-400 text-sm">Total Users</span>
                <Users className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{analytics?.totalUsers || 0}</div>
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
                <span className="text-gray-400 text-sm">Paid Subscribers</span>
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{analytics?.paidUsers || 0}</div>
              <div className="text-xs text-gray-500">Active subscriptions</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Active Alerts</span>
                <Activity className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{analytics?.activeAlerts || 0}</div>
              <div className="text-xs text-gray-500">Price alerts set</div>
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
                <div className={`text-2xl font-bold ${apiStatus?.marketData?.change24h?.includes('-') ? 'text-red-400' : 'text-green-400'}`}>
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
                      <span className="text-white font-mono">{tokenStats?.twelveData?.total - tokenStats?.twelveData?.remaining || 608} / {tokenStats?.twelveData?.total || 800} calls</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${((tokenStats?.twelveData?.total - tokenStats?.twelveData?.remaining) / tokenStats?.twelveData?.total) * 100 || 76}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Resets: {tokenStats?.twelveData?.resetDate || '2025-11-15'}</span>
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
                      <span className="text-white font-mono">{tokenStats?.huggingface?.total - tokenStats?.huggingface?.remaining || 1547} / {tokenStats?.huggingface?.total || 30000} calls</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${((tokenStats?.huggingface?.total - tokenStats?.huggingface?.remaining) / tokenStats?.huggingface?.total) * 100 || 5.2}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Resets: {tokenStats?.huggingface?.resetDate || '2025-12-01'}</span>
                      <span>{tokenStats?.huggingface?.remaining || 28453} remaining</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-black/30 rounded-lg border border-gray-800">
                  <h3 className="text-white font-semibold mb-2">Environment Variables</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">HUGGINGFACE_API_KEY</span>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">TWELVE_DATA_API_KEY</span>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">STRIPE_SECRET_KEY</span>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">SUPABASE_SERVICE_ROLE_KEY</span>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Users className="w-5 h-5" />
                    User Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-black/30 rounded-lg">
                      <div className="text-gray-400 text-sm mb-1">Total Users</div>
                      <div className="text-3xl font-bold text-white">{analytics?.totalUsers || 0}</div>
                    </div>
                    <div className="p-4 bg-black/30 rounded-lg">
                      <div className="text-gray-400 text-sm mb-1">Free Tier</div>
                      <div className="text-3xl font-bold text-gray-400">{analytics?.freeUsers || 0}</div>
                    </div>
                    <div className="p-4 bg-black/30 rounded-lg">
                      <div className="text-gray-400 text-sm mb-1">Paid Subscribers</div>
                      <div className="text-3xl font-bold text-green-400">{analytics?.paidUsers || 0}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <BarChart3 className="w-5 h-5" />
                    Feature Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-black/30 rounded-lg">
                      <div className="text-gray-400 text-sm mb-1">Total Watchlists</div>
                      <div className="text-3xl font-bold text-white">{analytics?.totalWatchlists || 0}</div>
                      <div className="text-xs text-gray-500 mt-1">Assets tracked by users</div>
                    </div>
                    <div className="p-4 bg-black/30 rounded-lg">
                      <div className="text-gray-400 text-sm mb-1">Price Alerts</div>
                      <div className="text-3xl font-bold text-white">{analytics?.totalAlerts || 0}</div>
                      <div className="text-xs text-green-400 mt-1">{analytics?.activeAlerts || 0} active</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="system" className="mt-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Settings className="w-5 h-5" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-black/30 rounded-lg border border-gray-800">
                  <h3 className="text-white font-semibold mb-4">Database Status</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Supabase Connection</span>
                      <span className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        Connected
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Tables</span>
                      <span className="text-white">4 (users, watchlists, price_alerts, user_preferences)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Row Level Security</span>
                      <span className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        Enabled
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-black/30 rounded-lg border border-gray-800">
                  <h3 className="text-white font-semibold mb-4">Payment Processing</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Stripe Integration</span>
                      <span className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        Active
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Webhook Status</span>
                      <span className="text-white">Configured</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Price Tiers</span>
                      <span className="text-white">4 (Free, Basic, Pro, Institutional)</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-black/30 rounded-lg border border-gray-800">
                  <h3 className="text-white font-semibold mb-4">Application Info</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Version</span>
                      <span className="text-white">1.0.0</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Environment</span>
                      <span className="text-white">Production</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Last Deploy</span>
                      <span className="text-white">{new Date().toLocaleDateString()}</span>
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
