"use client"

import { useState, useEffect } from "react"

interface WatchlistItem {
  symbol: string
  addedAt: number
}

const WATCHLIST_CHANGE_EVENT = "shadowsignals_watchlist_change"

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [prices, setPrices] = useState<Record<string, { price: number; change: number }>>({})

  const loadWatchlist = () => {
    const saved = localStorage.getItem("shadowsignals_watchlist")
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved))
      } catch (error) {
        console.error("[v0] Failed to load watchlist:", error)
      }
    }
  }

  useEffect(() => {
    // Load watchlist from localStorage on mount
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

  const addToWatchlist = (symbol: string) => {
    const upperSymbol = symbol.toUpperCase()

    // Check if already in watchlist
    if (watchlist.some((item) => item.symbol === upperSymbol)) {
      console.log("[v0] Symbol already in watchlist:", upperSymbol)
      return
    }

    const newItem: WatchlistItem = {
      symbol: upperSymbol,
      addedAt: Date.now(),
    }
    const updated = [...watchlist, newItem]
    setWatchlist(updated)
    localStorage.setItem("shadowsignals_watchlist", JSON.stringify(updated))
    console.log("[v0] Added to watchlist:", upperSymbol)

    window.dispatchEvent(new Event(WATCHLIST_CHANGE_EVENT))
  }

  const removeFromWatchlist = (symbol: string) => {
    const upperSymbol = symbol.toUpperCase()
    const updated = watchlist.filter((item) => item.symbol !== upperSymbol)
    setWatchlist(updated)
    localStorage.setItem("shadowsignals_watchlist", JSON.stringify(updated))
    console.log("[v0] Removed from watchlist:", upperSymbol)

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
  }
}
