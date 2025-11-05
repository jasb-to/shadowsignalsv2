import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { symbol, timeframe } = await req.json()

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
    }

    const apiKey = process.env.HUGGINGFACE_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "HuggingFace API key not configured" }, { status: 500 })
    }

    const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `As a professional market analyst for ShadowSignals, provide a brief confluence-based analysis for ${symbol} on the ${timeframe || "daily"} timeframe. Focus on:

1. Key technical levels and confluence zones
2. Market structure observations
3. Volume and momentum indicators
4. Risk management considerations

Keep it concise and professional. Remember: This is educational analysis, not financial advice.`,
        parameters: {
          max_new_tokens: 400,
          temperature: 0.7,
          top_p: 0.95,
          return_full_text: false,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] HuggingFace API error:", errorText)

      if (response.status === 503) {
        return NextResponse.json(
          {
            insights: "The AI model is currently loading. Please try again in a few moments.",
            loading: true,
          },
          { status: 200 },
        )
      }

      throw new Error(`HuggingFace API error: ${response.status}`)
    }

    const result = await response.json()

    let insights = ""
    if (Array.isArray(result) && result[0]?.generated_text) {
      insights = result[0].generated_text
    } else if (result.generated_text) {
      insights = result.generated_text
    } else {
      insights = "Unable to generate insights at this time."
    }

    return NextResponse.json({
      symbol,
      timeframe: timeframe || "daily",
      insights,
      timestamp: Date.now(),
      disclaimer: "This analysis is for educational purposes only. Not financial advice.",
    })
  } catch (error) {
    console.error("[v0] Market insights error:", error)
    return NextResponse.json({ error: "Failed to generate market insights" }, { status: 500 })
  }
}
