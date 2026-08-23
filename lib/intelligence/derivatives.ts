export interface DerivativesSnapshot { symbol: string; fundingRate: number | null; openInterest: number | null; longShortRatio: number | null; liquidations24h: number | null; source: string; timestamp: number }
const BASE = "https://fapi.binance.com"
async function get(path: string) { const r = await fetch(`${BASE}${path}`, { cache: "no-store", signal: AbortSignal.timeout(8000) }); if (!r.ok) throw new Error(`Binance ${r.status}`); return r.json() }
export async function getDerivativesSnapshot(symbol: string): Promise<DerivativesSnapshot> {
  const pair = `${symbol.toUpperCase()}USDT`
  try {
    const [premium, oi, ratio, liq] = await Promise.all([get(`/fapi/v1/premiumIndex?symbol=${pair}`), get(`/fapi/v1/openInterest?symbol=${pair}`), get(`/futures/data/globalLongShortAccountRatio?symbol=${pair}&period=1h&limit=24`), get(`/fapi/v1/allForceOrders?symbol=${pair}&limit=100`)])
    const ratios = Array.isArray(ratio) ? ratio : []; const latest = ratios.at(-1)?.longShortRatio
    const liquidations = Array.isArray(liq) ? liq.reduce((s: number, x: any) => s + Number(x.price || 0) * Number(x.origQty || 0), 0) : null
    return { symbol: symbol.toUpperCase(), fundingRate: Number(premium.lastFundingRate), openInterest: Number(oi.openInterest), longShortRatio: latest == null ? null : Number(latest), liquidations24h: liquidations, source: "binance-futures", timestamp: Date.now() }
  } catch { return { symbol: symbol.toUpperCase(), fundingRate: null, openInterest: null, longShortRatio: null, liquidations24h: null, source: "unavailable", timestamp: Date.now() } }
}
