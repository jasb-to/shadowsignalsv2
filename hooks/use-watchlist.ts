"use client"

import { useState, useEffect } from "react"

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

  const loadWatchlist = () => {
    const saved = localStorage.getItem("shadowsignals_watchlist")
    if (saved) {
      try {
        const items = JSON.parse(saved)
        setWatchlist(items)
      } catch (error) {
        console.error("Failed to load watchlist:", error)
      }
    }
  }

  useEffect(() => {
    loadWatchlist()

    const handleWatchlistChange = () => {
      loadWatchlist()
    }

    window.addEventListener(WATCHLIST_CHANGE_EVENT, handleWatchlistChange)
    return () => window.removeEventListener(WATCHLIST_CHANGE_EVENT, handleWatchlistChange)
  }, [])

  useEffect(() => {
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
          console.error(`Failed to fetch ${item.symbol}:`, error)
        }
      }

      setPrices(priceData)
    }

    if (watchlist.length > 0) {
      fetchPrices()
      const interval = setInterval(fetchPrices, 60000)
      return () => clearInterval(interval)
    }
  }, [watchlist])

  const addToWatchlist = (symbol: string, name?: string, price?: number) => {
    const upperSymbol = symbol.toUpperCase()

    if (watchlist.some((item) => item.symbol === upperSymbol)) {
      return
    }

    const newItem: WatchlistItem = {
      symbol: upperSymbol,
      name: name || upperSymbol,
      price: price || 0,
      addedAt: Date.now(),
    }

    const updated = [...watchlist, newItem]
    setWatchlist(updated)
    localStorage.setItem("shadowsignals_watchlist", JSON.stringify(updated))
    window.dispatchEvent(new Event(WATCHLIST_CHANGE_EVENT))
  }

  const removeFromWatchlist = (symbol: string) => {
    const upperSymbol = symbol.toUpperCase()
    const updated = watchlist.filter((item) => item.symbol !== upperSymbol)
    setWatchlist(updated)
    localStorage.setItem("shadowsignals_watchlist", JSON.stringify(updated))
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
