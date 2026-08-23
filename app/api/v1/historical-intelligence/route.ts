import { NextRequest, NextResponse } from "next/server"
import { aggregateHistoricalOutcomes } from "@/lib/intelligence/historical"
export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.toUpperCase(); if (!symbol) return NextResponse.json({ error: "symbol is required" }, { status: 400 })
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!base || !key) return NextResponse.json({ matches: 0, outcomes: [], available: false })
  const url = `${base}/rest/v1/market_state_outcomes?select=horizon,direction,return_pct,market_states!inner(symbol)&market_states.symbol=eq.${encodeURIComponent(symbol)}&limit=5000`
  const r = await fetch(url, { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" })
  if (!r.ok) return NextResponse.json({ error: `Supabase ${r.status}` }, { status: 502 })
  const rows = await r.json(); return NextResponse.json({ symbol, available: true, ...aggregateHistoricalOutcomes(Array.isArray(rows) ? rows : []) })
}
