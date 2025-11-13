import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("[v0] Fetching crypto news...")
    
    // Use CryptoPanic free API (no key required for basic usage)
    const response = await fetch(
      `https://cryptopanic.com/api/v1/posts/?auth_token=&currencies=BTC,ETH,SOL&public=true&kind=news`,
      {
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    )

    if (!response.ok) {
      throw new Error(`CryptoPanic API error: ${response.status}`)
    }

    const data = await response.json()

    // Transform CryptoPanic format to our format
    const news = data.results?.slice(0, 20).map((article: any) => ({
      id: article.id.toString(),
      title: article.title,
      source: article.source?.title || article.domain || "CryptoPanic",
      url: article.url,
      publishedAt: article.published_at,
      sentiment: article.votes?.positive > article.votes?.negative ? "positive" : 
                 article.votes?.negative > article.votes?.positive ? "negative" : "neutral",
    })) || []

    console.log(`[v0] Fetched ${news.length} news articles from CryptoPanic`)

    return NextResponse.json({ news })
  } catch (error) {
    console.error("[v0] CryptoPanic failed, trying NewsAPI.org...")
    
    // Fallback to NewsAPI.org (no key needed for top headlines)
    try {
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=cryptocurrency OR bitcoin OR ethereum&sortBy=publishedAt&language=en&pageSize=20&apiKey=demo`,
        {
          next: { revalidate: 300 }
        }
      )
      
      if (!response.ok) throw new Error("NewsAPI failed")
      
      const data = await response.json()
      
      const news = data.articles?.map((article: any, index: number) => ({
        id: `newsapi-${index}`,
        title: article.title,
        source: article.source?.name || "News",
        url: article.url,
        publishedAt: article.publishedAt,
        sentiment: determineSentiment(article.title, article.description),
      })) || []
      
      console.log(`[v0] Fetched ${news.length} news articles from NewsAPI`)
      return NextResponse.json({ news })
      
    } catch (fallbackError) {
      console.error("[v0] All news APIs failed:", fallbackError)
      
      // Return helpful message instead of empty array
      return NextResponse.json({ 
        news: [],
        message: "Unable to load news. Please check back later."
      })
    }
  }
}

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
