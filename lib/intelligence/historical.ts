export interface HistoricalOutcome { horizon: string; samples: number; upPct: number; flatPct: number; downPct: number; avgReturnPct: number }
export interface HistoricalIntelligence { matches: number; outcomes: HistoricalOutcome[] }
export function aggregateHistoricalOutcomes(rows: Array<{ horizon: string; direction: string; return_pct: number }>): HistoricalIntelligence {
  const groups = new Map<string, typeof rows>()
  for (const row of rows) { const list = groups.get(row.horizon) ?? []; list.push(row); groups.set(row.horizon, list) }
  return { matches: rows.length, outcomes: [...groups.entries()].map(([horizon, items]) => ({ horizon, samples: items.length, upPct: Math.round(items.filter(x => x.direction === "up").length / items.length * 1000) / 10, flatPct: Math.round(items.filter(x => x.direction === "flat").length / items.length * 1000) / 10, downPct: Math.round(items.filter(x => x.direction === "down").length / items.length * 1000) / 10, avgReturnPct: Math.round(items.reduce((s, x) => s + Number(x.return_pct), 0) / items.length * 100) / 100 })) }
}
