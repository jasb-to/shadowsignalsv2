import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Mock news data - in production, integrate with CryptoPanic, NewsAPI, or similar
    const mockNews = [
      {
        id: "1",
        title: "Bitcoin Surges Past $100K as Institutional Adoption Accelerates",
        source: "CryptoNews",
        url: "https://example.com/news/1",
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        sentiment: "positive" as const,
      },
      {
        id: "2",
        title: "Federal Reserve Signals Potential Rate Cuts in Q2 2025",
        source: "Financial Times",
        url: "https://example.com/news/2",
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        sentiment: "positive" as const,
      },
      {
        id: "3",
        title: "Ethereum Network Upgrade Improves Transaction Speed by 40%",
        source: "CoinDesk",
        url: "https://example.com/news/3",
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        sentiment: "positive" as const,
      },
      {
        id: "4",
        title: "Tech Stocks Face Volatility Amid Regulatory Concerns",
        source: "Bloomberg",
        url: "https://example.com/news/4",
        publishedAt: new Date(Date.now() - 14400000).toISOString(),
        sentiment: "negative" as const,
      },
      {
        id: "5",
        title: "Gold Prices Stabilise as Inflation Data Meets Expectations",
        source: "Reuters",
        url: "https://example.com/news/5",
        publishedAt: new Date(Date.now() - 18000000).toISOString(),
        sentiment: "neutral" as const,
      },
      {
        id: "6",
        title: "DeFi Protocol Launches New Yield Farming Opportunities",
        source: "The Block",
        url: "https://example.com/news/6",
        publishedAt: new Date(Date.now() - 21600000).toISOString(),
        sentiment: "positive" as const,
      },
      {
        id: "7",
        title: "Market Analysis: Altcoin Season Indicators Show Mixed Signals",
        source: "CryptoSlate",
        url: "https://example.com/news/7",
        publishedAt: new Date(Date.now() - 25200000).toISOString(),
        sentiment: "neutral" as const,
      },
    ]

    return NextResponse.json({ news: mockNews })
  } catch (error) {
    console.error("[v0] News feed error:", error)
    return NextResponse.json({ news: [] }, { status: 500 })
  }
}
