"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useWatchlist } from "@/hooks/use-watchlist"

export function WatchlistPanel({ onAnalyse }: { onAnalyse: (symbol: string) => void }) {
  const { watchlist, prices, removeFromWatchlist } = useWatchlist()

  if (watchlist.length === 0) {
    return (
      <Card className="bg-black/50 border-cyan-500/20 p-6">
        <div className="text-center">
          <div className="text-gray-400 mb-2">Your watchlist is empty</div>
          <div className="text-sm text-gray-500">Click the star icon on any asset to add it to your watchlist</div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-black/50 border-cyan-500/20 p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Watchlist</h3>
      <div className="space-y-2">
        {watchlist.map((item) => {
          const priceData = prices[item.symbol]
          return (
            <div
              key={item.symbol}
              className="flex items-center justify-between p-3 bg-gray-900/50 border border-cyan-500/10 rounded-lg hover:border-cyan-500/30 transition-colors"
            >
              <div className="flex-1">
                <div className="font-semibold text-white">{item.symbol}</div>
                {priceData && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-cyan-400">${priceData.price.toFixed(2)}</span>
                    <span className={priceData.change >= 0 ? "text-green-400" : "text-red-400"}>
                      {priceData.change >= 0 ? "+" : ""}
                      {priceData.change.toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => onAnalyse(item.symbol)}
                  className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400"
                >
                  Analyse
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeFromWatchlist(item.symbol)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
