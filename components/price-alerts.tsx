"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface Alert {
  id: string
  symbol: string
  targetPrice: number
  condition: "above" | "below"
  currentPrice: number
  createdAt: number
}

export function PriceAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [newSymbol, setNewSymbol] = useState("")
  const [newPrice, setNewPrice] = useState("")
  const [newCondition, setNewCondition] = useState<"above" | "below">("above")
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  const loadAlerts = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)

    if (user) {
      // Load from Supabase for authenticated users
      const { data, error } = await supabase
        .from("price_alerts")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (!error && data) {
        const items = data.map((item) => ({
          id: item.id,
          symbol: item.symbol,
          targetPrice: item.target_price,
          condition: item.direction as "above" | "below",
          currentPrice: 0,
          createdAt: new Date(item.created_at).getTime(),
        }))
        setAlerts(items)
      }
    } else {
      // Load from localStorage for non-authenticated users
      const stored = localStorage.getItem("shadowsignals_alerts")
      if (stored) {
        setAlerts(JSON.parse(stored))
      }
    }
  }

  useEffect(() => {
    loadAlerts()

    const handleAlertsUpdate = () => {
      loadAlerts()
    }

    window.addEventListener("alertsUpdated", handleAlertsUpdate)
    return () => window.removeEventListener("alertsUpdated", handleAlertsUpdate)
  }, [])

  const saveAlerts = (updatedAlerts: Alert[]) => {
    if (!user) {
      localStorage.setItem("shadowsignals_alerts", JSON.stringify(updatedAlerts))
    }
    window.dispatchEvent(new Event("alertsUpdated"))
    setAlerts(updatedAlerts)
  }

  const addAlert = async () => {
    if (!newSymbol || !newPrice) {
      toast({
        title: "Invalid Input",
        description: "Please enter both symbol and target price",
        variant: "destructive",
      })
      return
    }

    if (user) {
      // Save to Supabase for authenticated users
      const { error } = await supabase.from("price_alerts").insert({
        user_id: user.id,
        symbol: newSymbol.toUpperCase(),
        target_price: Number.parseFloat(newPrice),
        direction: newCondition,
      })

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create alert",
          variant: "destructive",
        })
        return
      }
    } else {
      // Save to localStorage for non-authenticated users
      const alert: Alert = {
        id: Date.now().toString(),
        symbol: newSymbol.toUpperCase(),
        targetPrice: Number.parseFloat(newPrice),
        condition: newCondition,
        currentPrice: 0,
        createdAt: Date.now(),
      }

      const updatedAlerts = [...alerts, alert]
      saveAlerts(updatedAlerts)
    }

    toast({
      title: "Alert Created",
      description: `You'll be notified when ${newSymbol.toUpperCase()} goes ${newCondition} $${newPrice}`,
    })

    setNewSymbol("")
    setNewPrice("")
    setIsOpen(false)
    loadAlerts()
  }

  const removeAlert = async (id: string) => {
    if (user) {
      // Remove from Supabase for authenticated users
      const { error } = await supabase.from("price_alerts").delete().eq("id", id).eq("user_id", user.id)

      if (error) {
        toast({
          title: "Error",
          description: "Failed to remove alert",
          variant: "destructive",
        })
        return
      }
    } else {
      // Remove from localStorage for non-authenticated users
      const updatedAlerts = alerts.filter((a) => a.id !== id)
      saveAlerts(updatedAlerts)
    }

    toast({
      title: "Alert Removed",
      description: "Price alert has been deleted",
    })

    loadAlerts()
  }

  return (
    <Card className="bg-black/50 border-cyan-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Price Alerts</CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-cyan-500 text-white hover:bg-cyan-600">
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Alert
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-cyan-500/30">
              <DialogHeader>
                <DialogTitle className="text-white">Create Price Alert</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Symbol</label>
                  <Input
                    placeholder="BTC, ETH, AAPL..."
                    value={newSymbol}
                    onChange={(e) => setNewSymbol(e.target.value)}
                    className="bg-black/50 border-cyan-500/30 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Target Price</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="bg-black/50 border-cyan-500/30 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Condition</label>
                  <div className="flex gap-2">
                    <Button
                      variant={newCondition === "above" ? "default" : "outline"}
                      onClick={() => setNewCondition("above")}
                      className={
                        newCondition === "above"
                          ? "bg-cyan-500 text-white hover:bg-cyan-600 flex-1"
                          : "border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 bg-transparent flex-1"
                      }
                    >
                      Above
                    </Button>
                    <Button
                      variant={newCondition === "below" ? "default" : "outline"}
                      onClick={() => setNewCondition("below")}
                      className={
                        newCondition === "below"
                          ? "bg-cyan-500 text-white hover:bg-cyan-600 flex-1"
                          : "border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 bg-transparent flex-1"
                      }
                    >
                      Below
                    </Button>
                  </div>
                </div>
                <Button onClick={addAlert} className="w-full bg-cyan-500 text-white hover:bg-cyan-600">
                  Create Alert
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <svg className="h-12 w-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <p>No active alerts</p>
            <p className="text-sm mt-1">Create an alert to get notified of price movements</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-lg"
              >
                <div>
                  <div className="font-semibold text-white">{alert.symbol}</div>
                  <div className="text-sm text-gray-400">
                    Alert when {alert.condition} ${alert.targetPrice.toFixed(2)}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeAlert(alert.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
