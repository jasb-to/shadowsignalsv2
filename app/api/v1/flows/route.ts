import { NextRequest, NextResponse } from "next/server"
import { buildFlowSnapshot } from "@/lib/intelligence/flows"
export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.toUpperCase()
  if (!symbol) return NextResponse.json({ error: "symbol is required" }, { status: 400 })
  const url = new URL("/api/market-history", req.url); url.searchParams.set("symbol", symbol); url.searchParams.set("interval", "1h"); url.searchParams.set("days", "7")
  const r = await fetch(url, { cache: "no-store" }); const data = await r.json()
  if (!r.ok || !Array.isArray(data.bars) || data.bars.length < 48) return NextResponse.json({ error: "Insufficient market history" }, { status: 503 })
  const bars = data.bars; const latest = bars.at(-1); const prior = bars.slice(-25, -1)
  const currentVolume = prior.reduce((s: number, b: any) => s + Number(b.volume), 0); const baseline = bars.slice(-49, -25).reduce((s: number, b: any) => s + Number(b.volume), 0)
  const priceChange = ((Number(latest.close) - Number(bars.at(-25).close)) / Number(bars.at(-25).close)) * 100
  return NextResponse.json(buildFlowSnapshot(symbol, currentVolume, baseline, priceChange))
}
