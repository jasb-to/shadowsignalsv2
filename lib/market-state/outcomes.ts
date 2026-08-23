const HORIZONS: Record<string, number> = { "1h": 3600000, "4h": 14400000, "24h": 86400000, "7d": 604800000 }

function cfg() { return { url: process.env.NEXT_PUBLIC_SUPABASE_URL, key: process.env.SUPABASE_SERVICE_ROLE_KEY } }

async function query(path: string, init: RequestInit = {}) {
  const { url, key } = cfg()
  if (!url || !key) return null
  const headers = new Headers(init.headers)
  headers.set("apikey", key)
  headers.set("Authorization", `Bearer ${key}`)
  headers.set("Content-Type", "application/json")
  const r = await fetch(`${url}/rest/v1/${path}`, { ...init, headers, cache: "no-store" })
  if (!r.ok) throw new Error(`Supabase ${r.status}`)
  return r.status === 204 ? null : r.json()
}

export async function recordOutcomes(symbol: string, price: number, capturedAt: number) {
  try {
    const states = await query(`market_states?select=id,captured_at,price&symbol=eq.${encodeURIComponent(symbol)}&captured_at=lte.${encodeURIComponent(new Date(capturedAt - 3600000).toISOString())}&order=captured_at.asc&limit=100`)
    if (!Array.isArray(states)) return { persisted: false, recorded: 0 }
    let recorded = 0
    for (const state of states) for (const [horizon, ms] of Object.entries(HORIZONS)) {
      const target = new Date(new Date(state.captured_at).getTime() + ms)
      if (target.getTime() > capturedAt) continue
      const existing = await query(`market_state_outcomes?select=id&market_state_id=eq.${state.id}&horizon=eq.${horizon}&limit=1`)
      if (Array.isArray(existing) && existing.length) continue
      const ret = ((price - Number(state.price)) / Number(state.price)) * 100
      const direction = ret > 1 ? "up" : ret < -1 ? "down" : "flat"
      await query("market_state_outcomes", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ market_state_id: state.id, horizon, target_at: target.toISOString(), price_at_target: price, return_pct: ret, direction }) })
      recorded++
    }
    return { persisted: true, recorded }
  } catch (e) { return { persisted: false, recorded: 0, error: e instanceof Error ? e.message : "outcome_error" } }
}
