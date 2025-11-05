"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface NewsItem {
  id: string
  title: string
  source: string
  url: string
  publishedAt: string
  sentiment: "positive" | "negative" | "neutral"
}

export function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "crypto" | "stocks">("all")

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch("/api/news-feed")
        if (response.ok) {
          const data = await response.json()
          setNews(data.news)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch news:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
    const interval = setInterval(fetchNews, 300000) // Refresh every 5 minutes

    return () => clearInterval(interval)
  }, [])

  const filteredNews = news.filter((item) => {
    if (filter === "all") return true
    if (filter === "crypto")
      return (
        item.title.toLowerCase().includes("crypto") ||
        item.title.toLowerCase().includes("bitcoin") ||
        item.title.toLowerCase().includes("ethereum")
      )
    if (filter === "stocks")
      return !item.title.toLowerCase().includes("crypto") && !item.title.toLowerCase().includes("bitcoin")
    return true
  })

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-400"
      case "negative":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "↑"
      case "negative":
        return "↓"
      default:
        return "•"
    }
  }

  return (
    <Card className="bg-black/50 border-cyan-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Market News</CardTitle>
          <div className="flex gap-2">
            {(["all", "crypto", "stocks"] as const).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "outline"}
                onClick={() => setFilter(f)}
                className={
                  filter === f
                    ? "bg-cyan-500 text-white hover:bg-cyan-600 capitalize"
                    : "border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 bg-transparent capitalize"
                }
              >
                {f}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-cyan-500/5 border border-cyan-500/20 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <svg className="h-12 w-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
            <p>No news available</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {filteredNews.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/10 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="text-white font-medium mb-1 line-clamp-2">{item.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span>{item.source}</span>
                      <span>•</span>
                      <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${getSentimentColor(item.sentiment)}`}>
                    {getSentimentIcon(item.sentiment)}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
