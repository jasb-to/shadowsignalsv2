import type { MarketState } from "./types"

export interface MarketStateSnapshot extends MarketState {
  forward?: { h1?: number; h4?: number; h24?: number; d7?: number }
}

const memory: MarketStateSnapshot[] = []
const MAX_SNAPSHOTS = 10000

export function recordMarketState(state: MarketState): MarketStateSnapshot {
  const snapshot = { ...state }
  memory.push(snapshot)
  if (memory.length > MAX_SNAPSHOTS) memory.splice(0, memory.length - MAX_SNAPSHOTS)
  return snapshot
}

export function getMarketMemory(symbol: string, limit = 100): MarketStateSnapshot[] {
  return memory.filter((item) => item.symbol === symbol.toUpperCase()).slice(-limit)
}

export function findSimilarStates(state: MarketState, limit = 10): MarketStateSnapshot[] {
  return memory
    .filter((item) => item.symbol === state.symbol)
    .map((item) => ({ item, distance: Math.abs(item.momentum - state.momentum) + Math.abs(item.volatility - state.volatility) + (item.regime === state.regime ? 0 : 30) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map(({ item }) => item)
}
