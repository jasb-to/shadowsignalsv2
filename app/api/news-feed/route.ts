import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.NEWSDATA_API_KEY
    
    if (!apiKey) {
      console.error("[v0] NEWSDATA_API_KEY not configured")
      return NextResponse.json({ 
        news: [],
        error: "News API not configured. Please add NEWSDATA_API_KEY environment variable."
      })
    }

    // Fetch crypto and financial news from NewsData.io
    const response = await fetch(
      `https://newsdata.io/api/1/news?apikey=${apiKey}&category=business,technology&q=crypto OR bitcoin OR ethereum OR stock OR market&language=en`,
      {
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    )

    if (!response.ok) {
      throw new Error(`NewsData.io API error: ${response.status}`)
    }

    const data = await response.json()

    // Transform NewsData.io format to our format
    const news = data.results?.map((article: any, index: number) => ({
      id: article.article_id || `news-${index}`,
      title: article.title,
      source: article.source_id || "Unknown",
      url: article.link,
      publishedAt: article.pubDate,
      sentiment: determineSentiment(article.title, article.description),
    })) || []

    console.log(`[v0] Fetched ${news.length} real news articles from NewsData.io`)

    return NextResponse.json({ news })
  } catch (error) {
    console.error("[v0] News feed error:", error)
    
    // Fallback to a few sample articles if API fails
    const fallbackNews = [
      {
        id: "fallback-1",
        title: "Unable to load live news. Please configure NEWSDATA_API_KEY environment variable.",
        source: "System",
        url: "https://newsdata.io/",
        publishedAt: new Date().toISOString(),
        sentiment: "neutral" as const,
      },
    ]
    
    return NextResponse.json({ news: fallbackNews })
  }
}

// Simple sentiment analysis based on keywords
function determineSentiment(title: string, description: string): "positive" | "negative" | "neutral" {
  const text = `${title} ${description || ""}`.toLowerCase()
  
  const positiveKeywords = [
    "surge", "rally", "gain", "rise", "up", "growth", "bull", "breakthrough",
    "adoption", "success", "profit", "win", "record", "high", "upgrade", "innovation"
  ]
  
  const negativeKeywords = [
    "crash", "drop", "fall", "down", "bear", "loss", "decline", "concern",
    "risk", "warning", "threat", "fail", "hack", "scam", "regulatory", "ban"
  ]
  
  const positiveScore = positiveKeywords.filter(keyword => text.includes(keyword)).length
  const negativeScore = negativeKeywords.filter(keyword => text.includes(keyword)).length
  
  if (positiveScore > negativeScore) return "positive"
  if (negativeScore > positiveScore) return "negative"
  return "neutral"
}
