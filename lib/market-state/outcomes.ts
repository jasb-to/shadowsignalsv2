import { createClient } from "@supabase/supabase-js"

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null
}

const HORIZONS: Record<string, number> = { "1h": 60 * 60 * 1000, "4h": 4 * 60 * 60 * 1000, "24h": 24 * 60 * 60 * 1000, "7d": 7 * 24 * 60 * 60 * 1000 }

export async function recordOutcomes(symbol: string, price: number, capturedAt: number) {
  const db = client(); if (!db) return { persisted: false }
  const { data: states } = await db.from("market_states").select("id,captured_at,price").eq("symbol", symbol).lte("captured_at", new Date(Date.now() - 60 * 60 * 1000).toISOString()).order("captured_at", { ascending: true }).limit(100)
  if (!states?.length) return { persisted: true, recorded: 0 }
  let recorded = 0
  for (const state of states) {
    for (const [horizon, ms] of Object.entries(HORIZONS)) {
      const target = new Date(new Date(state.captured_at).getTime() + ms)
      if (target.getTime() > capturedAt) continue
      const { data: existing } = await db.from("market_state_outcomes").select("id").eq("market_state_id", state.id).eq("horizon", horizon).maybeSingle()
      if (existing) continue
      const ret = ((price - Number(state.price)) / Number(state.price)) * 100
      const direction = ret > 1 ? "up" : ret < -1 ? "down" : "flat"
      const { error } = await db.from("market_state_outcomes").insert({ market_state_id: state.id, horizon, target_at: target.toISOString(), price_at_target: price, return_pct: ret, direction })
      if (!error) recorded++
    }
  }
  return { persisted: true, recorded }
}
