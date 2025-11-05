import { type NextRequest, NextResponse } from "next/server"
import { HfInference } from "@huggingface/inference"

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    const apiKey = process.env.HUGGINGFACE_API_KEY

    if (!apiKey) {
      console.error("[v0] HuggingFace API key not configured")
      return NextResponse.json({ error: "HuggingFace API key not configured" }, { status: 500 })
    }

    const hf = new HfInference(apiKey)

    const prompt = `You are a professional market analysis assistant for ShadowSignals, a confluence-based trading analysis platform. Analyze the following query and provide insights based on technical confluence, market structure, and data patterns. Remember: This is educational analysis only, not financial advice.

User Query: ${query}

Provide a clear, professional analysis focusing on:
- Technical confluence factors
- Market structure observations
- Key data points to consider
- Risk factors to be aware of

Keep the response concise and professional.`

    try {
      console.log("[v0] Attempting FinMA-7B analysis...")
      const result = await hf.textGeneration({
        model: "ChanceFocus/finma-7b-full",
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.95,
          return_full_text: false,
        },
      })

      console.log("[v0] FinMA-7B succeeded!")
      return NextResponse.json({
        analysis: result.generated_text,
        model: "FinMA-7B",
        disclaimer:
          "This analysis is for educational purposes only and does not constitute financial advice. ShadowSignals is not FCA regulated.",
      })
    } catch (finmaError: any) {
      console.error("[v0] FinMA-7B error:", finmaError.message || finmaError)

      try {
        console.log("[v0] Attempting Mistral-7B-Instruct-v0.2...")
        const result = await hf.textGeneration({
          model: "mistralai/Mistral-7B-Instruct-v0.2",
          inputs: prompt,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
            top_p: 0.95,
            return_full_text: false,
          },
        })

        console.log("[v0] Mistral-7B-v0.2 succeeded!")
        return NextResponse.json({
          analysis: result.generated_text,
          model: "Mistral-7B-v0.2",
          disclaimer:
            "This analysis is for educational purposes only and does not constitute financial advice. ShadowSignals is not FCA regulated.",
        })
      } catch (mistralError: any) {
        console.error("[v0] Mistral-7B-v0.2 error:", mistralError.message || mistralError)

        try {
          console.log("[v0] Attempting Mistral-7B-Instruct-v0.1...")
          const result = await hf.textGeneration({
            model: "mistralai/Mistral-7B-Instruct-v0.1",
            inputs: prompt,
            parameters: {
              max_new_tokens: 500,
              temperature: 0.7,
              top_p: 0.95,
              return_full_text: false,
            },
          })

          console.log("[v0] Mistral-7B-v0.1 succeeded!")
          return NextResponse.json({
            analysis: result.generated_text,
            model: "Mistral-7B-v0.1",
            disclaimer:
              "This analysis is for educational purposes only and does not constitute financial advice. ShadowSignals is not FCA regulated.",
          })
        } catch (finalError: any) {
          console.error("[v0] Mistral-7B-v0.1 error:", finalError.message || finalError)
          console.error("[v0] All AI models failed, using rule-based fallback")

          return NextResponse.json({
            analysis: `Based on the query "${query}", here are key considerations for confluence-based analysis:

**Technical Confluence Factors:**
• Monitor multiple timeframes (1h, 4h, 1d) for signal alignment
• Check volume confirmation on price movements
• Identify key support and resistance levels using multiple indicators
• Look for MACD, RSI, and EMA alignment

**Market Structure:**
• Analyze trend direction across timeframes
• Identify potential reversal zones
• Monitor momentum indicators for divergence
• Check for breakout or breakdown patterns

**Risk Management:**
• Always use proper position sizing (1-3% of portfolio)
• Set stop losses based on technical levels
• Consider risk/reward ratios before entry
• Monitor overall market sentiment

**Important Note:** AI models are currently unavailable. This is a rule-based analysis framework. For AI-powered detailed insights with FinMA-7B or Mistral models, please ensure your HuggingFace API has sufficient credits and model access.`,
            model: "Rule-based fallback",
            disclaimer:
              "This analysis is for educational purposes only and does not constitute financial advice. ShadowSignals is not FCA regulated.",
          })
        }
      }
    }
  } catch (error: any) {
    console.error("[v0] AI search error:", error.message || error)
    return NextResponse.json({ error: "Failed to generate analysis" }, { status: 500 })
  }
}
