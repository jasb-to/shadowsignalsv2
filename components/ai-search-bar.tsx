"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Search, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const POPULAR_ASSETS = [
  // Major Cryptocurrencies
  { symbol: "BTC", name: "Bitcoin", type: "crypto" },
  { symbol: "ETH", name: "Ethereum", type: "crypto" },
  { symbol: "SOL", name: "Solana", type: "crypto" },
  { symbol: "BNB", name: "Binance Coin", type: "crypto" },
  { symbol: "XRP", name: "Ripple", type: "crypto" },
  { symbol: "ADA", name: "Cardano", type: "crypto" },
  { symbol: "AVAX", name: "Avalanche", type: "crypto" },
  { symbol: "DOT", name: "Polkadot", type: "crypto" },
  { symbol: "MATIC", name: "Polygon", type: "crypto" },
  { symbol: "LINK", name: "Chainlink", type: "crypto" },

  // AI & Small Cap Coins
  { symbol: "VIRTUAL", name: "Virtuals Protocol", type: "crypto" },
  { symbol: "AI16Z", name: "ai16z", type: "crypto" },
  { symbol: "RENDER", name: "Render Token", type: "crypto" },
  { symbol: "FET", name: "Fetch.ai", type: "crypto" },
  { symbol: "AGIX", name: "SingularityNET", type: "crypto" },
  { symbol: "OCEAN", name: "Ocean Protocol", type: "crypto" },

  // DeFi Tokens
  { symbol: "UNI", name: "Uniswap", type: "crypto" },
  { symbol: "AAVE", name: "Aave", type: "crypto" },
  { symbol: "MKR", name: "Maker", type: "crypto" },
  { symbol: "CRV", name: "Curve DAO", type: "crypto" },
  { symbol: "SUSHI", name: "SushiSwap", type: "crypto" },

  // Meme Coins
  { symbol: "DOGE", name: "Dogecoin", type: "crypto" },
  { symbol: "SHIB", name: "Shiba Inu", type: "crypto" },
  { symbol: "PEPE", name: "Pepe", type: "crypto" },
  { symbol: "WIF", name: "dogwifhat", type: "crypto" },
  { symbol: "BONK", name: "Bonk", type: "crypto" },

  // Layer 2s
  { symbol: "ARB", name: "Arbitrum", type: "crypto" },
  { symbol: "OP", name: "Optimism", type: "crypto" },
  { symbol: "IMX", name: "Immutable X", type: "crypto" },

  // Stocks
  { symbol: "AAPL", name: "Apple Inc.", type: "stock" },
  { symbol: "TSLA", name: "Tesla Inc.", type: "stock" },
  { symbol: "GOOGL", name: "Alphabet Inc.", type: "stock" },
  { symbol: "MSFT", name: "Microsoft Corp.", type: "stock" },
  { symbol: "NVDA", name: "NVIDIA Corp.", type: "stock" },
  { symbol: "AMZN", name: "Amazon.com Inc.", type: "stock" },
  { symbol: "META", name: "Meta Platforms Inc.", type: "stock" },

  // Forex
  { symbol: "EUR/USD", name: "Euro / US Dollar", type: "forex" },
  { symbol: "GBP/USD", name: "British Pound / US Dollar", type: "forex" },
]

interface AISearchBarProps {
  onAnalyse?: (symbol: string) => void
}

export function AISearchBar({ onAnalyse }: AISearchBarProps) {
  const [query, setQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [filteredAssets, setFilteredAssets] = useState(POPULAR_ASSETS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.trim()) {
      const filtered = POPULAR_ASSETS.filter(
        (asset) =>
          asset.symbol.toLowerCase().includes(query.toLowerCase()) ||
          asset.name.toLowerCase().includes(query.toLowerCase()),
      )
      setFilteredAssets(filtered)
    } else {
      setFilteredAssets(POPULAR_ASSETS)
    }
  }, [query])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleAssetSelect = async (symbol: string) => {
    console.log("[v0] Asset selected from dropdown:", symbol)
    setQuery(symbol)
    setShowDropdown(false)
    if (onAnalyse) {
      console.log("[v0] Calling onAnalyse with symbol:", symbol)
      onAnalyse(symbol)
    }
  }

  const handleAnalyse = async (searchSymbol?: string) => {
    const symbolToAnalyse = searchSymbol || query.trim()
    console.log("[v0] Analyse button clicked with symbol:", symbolToAnalyse)
    if (!symbolToAnalyse) return

    if (onAnalyse) {
      console.log("[v0] Calling onAnalyse callback")
      onAnalyse(symbolToAnalyse)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !showDropdown) {
      handleAnalyse()
    }
  }

  return (
    <div className="w-full space-y-4" ref={dropdownRef}>
      <div className="flex gap-2 relative">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-500" />
          <Input
            type="text"
            placeholder="Search for BTC, ETH, AAPL, or any asset..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setShowDropdown(true)}
            className="pl-10 bg-black/50 border-cyan-500/30 text-white placeholder:text-gray-500 focus:border-cyan-500"
            disabled={loading}
          />

          {showDropdown && filteredAssets.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-black border border-cyan-500/30 rounded-lg shadow-lg shadow-cyan-500/10 max-h-64 overflow-y-auto z-50">
              {filteredAssets.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => handleAssetSelect(asset.symbol)}
                  className="w-full px-4 py-3 text-left hover:bg-cyan-500/10 transition-colors border-b border-cyan-500/10 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">{asset.symbol}</p>
                      <p className="text-gray-400 text-sm">{asset.name}</p>
                    </div>
                    <span className="text-xs text-cyan-400 uppercase px-2 py-1 bg-cyan-500/10 rounded">
                      {asset.type}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <Button
          onClick={() => handleAnalyse()}
          disabled={loading || !query.trim()}
          className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold"
        >
          {loading ? (
            <>
              <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
              Analysing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Analyse
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}
