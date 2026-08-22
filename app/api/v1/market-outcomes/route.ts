import { NextRequest, NextResponse } from "next/server"
import { recordOutcomes } from "../../../../lib/market-state/outcomes"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const symbol = String(body.symbol || "").toUpperCase()
    const price = Number(body.price)
    if (!symbol || !Number.isFinite(price)) return NextResponse.json({ error: "symbol and price are required" }, { status: 400 })
    return NextResponse.json(await recordOutcomes(symbol, price, Date.now()))
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Outcome tracking failed" }, { status: 500 })
  }
}
