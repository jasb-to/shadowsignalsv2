"use client"

import { useState, useEffect } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface WatchlistItem {
  symbol: string
  name: string
  price: number
  addedAt: number
}

const WATCHLIST_CHANGE_EVENT = "shadowsignals_watchlist_change"

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [prices, setPrices] = useState<Record<string, { price: number; change: number }>>({})
  const [user, setUser] = useState<any>(null)
  const supabase = getSupabaseBrowserClient()

  const loadWatchlist = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)

    if (user) {
      // Load from Supabase for authenticated users
      const { data, error } = await supabase
        .from("watchlists")
        .select("*")
        .eq("user_id", user.id)
        .order("added_at", { ascending: false })

      if (!error && data) {
        const items = data.map((item) => ({
          symbol: item.symbol,
          name: item.name,
          price: item.price,
          addedAt: new Date(item.added_at).getTime(),
        }))
        setWatchlist(items)
        console.log("[v0] Loaded watchlist from Supabase:", items.length, "items")
      }
    } else {
      // Load from localStorage for non-authenticated users
      const saved = localStorage.getItem("shadowsignals_watchlist")
      if (saved) {
        try {
          const items = JSON.parse(saved)
          setWatchlist(items)
          console.log("[v0] Loaded watchlist from localStorage:", items.length, "items")
        } catch (error) {
          console.error("[v0] Failed to load watchlist:", error)
        }
      }
    }
  }

  useEffect(() => {
    loadWatchlist()

    const handleWatchlistChange = () => {
      console.log("[v0] Watchlist changed, reloading...")
      loadWatchlist()
    }

    window.addEventListener(WATCHLIST_CHANGE_EVENT, handleWatchlistChange)

    return () => {
      window.removeEventListener(WATCHLIST_CHANGE_EVENT, handleWatchlistChange)
    }
  }, [])

  useEffect(() => {
    // Fetch prices for watchlist items
    const fetchPrices = async () => {
      const priceData: Record<string, { price: number; change: number }> = {}

      for (const item of watchlist) {
        try {
          const response = await fetch(`/api/market-data?symbol=${item.symbol}`)
          if (response.ok) {
            const data = await response.json()
            priceData[item.symbol] = {
              price: data.price,
              change: data.change24h,
            }
          }
        } catch (error) {
          console.error(`[v0] Failed to fetch ${item.symbol}:`, error)
        }
      }

      setPrices(priceData)
    }

    if (watchlist.length > 0) {
      fetchPrices()
      const interval = setInterval(fetchPrices, 60000) // Update every minute
      return () => clearInterval(interval)
    }
  }, [watchlist])

  const addToWatchlist = async (symbol: string, name?: string, price?: number) => {
    const upperSymbol = symbol.toUpperCase()

    if (watchlist.some((item) => item.symbol === upperSymbol)) {
      console.log("[v0] Symbol already in watchlist:", upperSymbol)
      return
    }

    const newItem: WatchlistItem = {
      symbol: upperSymbol,
      name: name || upperSymbol,
      price: price || 0,
      addedAt: Date.now(),
    }

    if (user) {
      // Save to Supabase for authenticated users
      const { error } = await supabase.from("watchlists").insert({
        user_id: user.id,
        symbol: newItem.symbol,
        name: newItem.name,
        price: newItem.price,
      })

      if (error) {
        console.error("[v0] Failed to add to Supabase watchlist:", error)
        return
      }
      console.log("[v0] Added to Supabase watchlist:", upperSymbol)
    } else {
      // Save to localStorage for non-authenticated users
      const updated = [...watchlist, newItem]
      setWatchlist(updated)
      localStorage.setItem("shadowsignals_watchlist", JSON.stringify(updated))
      console.log("[v0] Added to localStorage watchlist:", upperSymbol)
    }

    window.dispatchEvent(new Event(WATCHLIST_CHANGE_EVENT))
  }

  const removeFromWatchlist = async (symbol: string) => {
    const upperSymbol = symbol.toUpperCase()

    if (user) {
      // Remove from Supabase for authenticated users
      const { error } = await supabase.from("watchlists").delete().eq("user_id", user.id).eq("symbol", upperSymbol)

      if (error) {
        console.error("[v0] Failed to remove from Supabase watchlist:", error)
        return
      }
      console.log("[v0] Removed from Supabase watchlist:", upperSymbol)
    } else {
      // Remove from localStorage for non-authenticated users
      const updated = watchlist.filter((item) => item.symbol !== upperSymbol)
      setWatchlist(updated)
      localStorage.setItem("shadowsignals_watchlist", JSON.stringify(updated))
      console.log("[v0] Removed from localStorage watchlist:", upperSymbol)
    }

    window.dispatchEvent(new Event(WATCHLIST_CHANGE_EVENT))
  }

  const isInWatchlist = (symbol: string) => {
    return watchlist.some((item) => item.symbol === symbol.toUpperCase())
  }

  return {
    watchlist,
    prices,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    isAuthenticated: !!user,
  }
}
