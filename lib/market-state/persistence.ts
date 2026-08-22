import { createClient } from "@supabase/supabase-js"
import type { MarketState } from "./types"

function supabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

export async function persistMarketState(state: MarketState, timeframe = "1h") {
  const client = supabase()
  if (!client) return { persisted: false, reason: "supabase_not_configured" as const }
  const { data, error } = await client.from("market_states").insert({
    symbol: state.symbol, timeframe, price: state.price, change_24h: state.change24h,
    trend: state.trend, regime: state.regime, momentum: state.momentum, volatility: state.volatility,
    signal: state.signal, confidence: state.confidence, indicators: state.indicators,
    support_resistance: state.supportResistance, evidence: state.evidence, invalidation: state.invalidation,
    source: "market-state-engine",
  }).select("id").single()
  if (error) return { persisted: false, reason: error.message as string }
  return { persisted: true, id: data.id as string }
}

export async function getSimilarMarketStates(state: MarketState, timeframe = "1h", limit = 25) {
  const client = supabase()
  if (!client) return []
  const { data } = await client.from("market_states")
    .select("id,symbol,timeframe,captured_at,price,trend,regime,momentum,volatility,signal,confidence")
    .eq("timeframe", timeframe).eq("trend", state.trend).eq("regime", state.regime)
    .gte("momentum", state.momentum - 10).lte("momentum", state.momentum + 10)
    .gte("volatility", state.volatility - 3).lte("volatility", state.volatility + 3)
    .order("captured_at", { ascending: false }).limit(limit)
  return data ?? []
}
