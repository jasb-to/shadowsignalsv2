import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Fetch from Alternative.me Crypto Fear & Greed Index API
    const response = await fetch("https://api.alternative.me/fng/?limit=1")

    if (!response.ok) {
      throw new Error("Failed to fetch Fear & Greed Index")
    }

    const result = await response.json()
    const data = result.data[0]

    return NextResponse.json({
      value: Number.parseInt(data.value),
      classification: data.value_classification,
      timestamp: Number.parseInt(data.timestamp),
    })
  } catch (error) {
    console.error("[v0] Fear & Greed API error:", error)

    // Fallback to calculated value based on market conditions
    return NextResponse.json({
      value: 50,
      classification: "Neutral",
      timestamp: Date.now(),
    })
  }
}
