import type { MarketState } from "./types"

export interface MarketStateRecord extends MarketState { forward?: { h1?: number; h4?: number; h24?: number; d7?: number } }
const records: MarketStateRecord[] = []
const MAX = 10000
export function saveState(state: MarketState) { records.push({ ...state }); if (records.length > MAX) records.splice(0, records.length - MAX); return state }
export function statesFor(symbol: string, limit = 100) { return records.filter(r => r.symbol === symbol.toUpperCase()).slice(-limit) }
export function similarStates(state: MarketState, limit = 10) { return records.filter(r => r.symbol === state.symbol).map(r => ({ r, d: Math.abs(r.momentum-state.momentum) + Math.abs(r.volatility-state.volatility) + (r.regime===state.regime ? 0 : 30) })).sort((a,b)=>a.d-b.d).slice(0,limit).map(x=>x.r) }
