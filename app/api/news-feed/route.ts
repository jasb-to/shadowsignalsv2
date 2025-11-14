import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("[v0] Fetching crypto news from RSS feeds...")
    
    const feedSources = [
      {
        url: "https://cointelegraph.com/rss",
        name: "Cointelegraph"
      },
      {
        url: "https://bitcoinmagazine.com/.rss/full/",
        name: "Bitcoin Magazine"
      },
      {
        url: "https://decrypt.co/feed",
        name: "Decrypt"
      }
    ]
    
    let news: any[] = []
    
    for (const source of feedSources) {
      try {
        const response = await fetch(source.url, {
          redirect: "follow", // Follow redirects automatically
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; ShadowSignals/1.0)"
          },
          next: { revalidate: 300 } // Cache for 5 minutes
        })
        
        if (response.ok) {
          const rssText = await response.text()
          const parsedNews = parseRSSFeed(rssText, source.name)
          news = news.concat(parsedNews)
          console.log(`[v0] Fetched ${parsedNews.length} articles from ${source.name}`)
          
          if (news.length >= 15) break // We have enough news
        }
      } catch (sourceError) {
        console.error(`[v0] Failed to fetch from ${source.name}:`, sourceError)
        continue // Try next source
      }
    }
    
    if (news.length === 0) {
      throw new Error("All RSS sources failed")
    }
    
    // Sort by date and limit to 20 most recent
    news.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    news = news.slice(0, 20)
    
    console.log(`[v0] Successfully fetched ${news.length} news articles`)
    
    return NextResponse.json({ news })
    
  } catch (error) {
    console.error("[v0] RSS news fetch failed:", error)
    
    // Return sample educational news as fallback
    const fallbackNews = [
      {
        id: "edu-1",
        title: "Understanding Bitcoin Market Cycles and Halving Events",
        source: "Educational Content",
        url: "/learn",
        publishedAt: new Date().toISOString(),
        sentiment: "neutral" as const,
      },
      {
        id: "edu-2",
        title: "Technical Analysis 101: Key Indicators for Crypto Trading",
        source: "Educational Content",
        url: "/learn",
        publishedAt: new Date().toISOString(),
        sentiment: "neutral" as const,
      },
      {
        id: "edu-3",
        title: "Risk Management Strategies for Cryptocurrency Investors",
        source: "Educational Content",
        url: "/learn",
        publishedAt: new Date().toISOString(),
        sentiment: "neutral" as const,
      }
    ]
    
    return NextResponse.json({ 
      news: fallbackNews,
      message: "Showing educational content. Live news temporarily unavailable."
    })
  }
}

function parseRSSFeed(rssText: string, sourceName: string) {
  const news: Array<{
    id: string
    title: string
    source: string
    url: string
    publishedAt: string
    sentiment: "positive" | "negative" | "neutral"
  }> = []
  
  // Extract items from RSS
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  const items = [...rssText.matchAll(itemRegex)]
  
  items.slice(0, 10).forEach((match, index) => {
    const itemContent = match[1]
    
    // Extract title (handle both CDATA and plain text)
    let title = ""
    const titleCdataMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)
    const titlePlainMatch = itemContent.match(/<title>(.*?)<\/title>/)
    title = titleCdataMatch ? titleCdataMatch[1] : (titlePlainMatch ? titlePlainMatch[1] : "")
    
    // Extract link
    const linkMatch = itemContent.match(/<link>(.*?)<\/link>/)
    const url = linkMatch ? linkMatch[1].trim() : ""
    
    // Extract pubDate
    const dateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/)
    const publishedAt = dateMatch ? new Date(dateMatch[1]).toISOString() : new Date().toISOString()
    
    // Extract description for sentiment
    let description = ""
    const descCdataMatch = itemContent.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)
    const descPlainMatch = itemContent.match(/<description>(.*?)<\/description>/)
    description = descCdataMatch ? descCdataMatch[1] : (descPlainMatch ? descPlainMatch[1] : "")
    
    if (title && url) {
      news.push({
        id: `${sourceName.toLowerCase().replace(/\s+/g, '-')}-${index}`,
        title,
        source: sourceName,
        url,
        publishedAt,
        sentiment: determineSentiment(title, description),
      })
    }
  })
  
  return news
}

function determineSentiment(title: string, description: string): "positive" | "negative" | "neutral" {
  const text = `${title} ${description || ""}`.toLowerCase()
  
  const positiveKeywords = [
    "surge", "rally", "gain", "rise", "up", "growth", "bull", "breakthrough",
    "adoption", "success", "profit", "win", "record", "high", "upgrade", "innovation",
    "soar", "jump", "boost", "advance"
  ]
  
  const negativeKeywords = [
    "crash", "drop", "fall", "down", "bear", "loss", "decline", "concern",
    "risk", "warning", "threat", "fail", "hack", "scam", "regulatory", "ban",
    "plunge", "tumble", "slump", "fear"
  ]
  
  const positiveScore = positiveKeywords.filter(keyword => text.includes(keyword)).length
  const negativeScore = negativeKeywords.filter(keyword => text.includes(keyword)).length
  
  if (positiveScore > negativeScore) return "positive"
  if (negativeScore > positiveScore) return "negative"
  return "neutral"
}
