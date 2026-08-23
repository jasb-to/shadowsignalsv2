import { NextRequest, NextResponse } from "next/server"
import { scoreIntelligence } from "@/lib/intelligence/scoring"
import { getDerivativesSnapshot } from "@/lib/intelligence/derivatives"
export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.toUpperCase(); if (!symbol) return NextResponse.json({ error: "symbol is required" }, { status: 400 })
  const derivatives = await getDerivativesSnapshot(symbol)
  return NextResponse.json({ symbol, derivatives, score: scoreIntelligence({ trend: "Sideways", rsi: null, macd: null, macdSignal: null, fundingRate: derivatives.fundingRate, longShortRatio: derivatives.longShortRatio }) })
}
