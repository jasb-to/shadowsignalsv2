export interface ScanResult { symbol: string; score: number; bias: "bullish" | "bearish" | "neutral"; reason: string }
export function rankScanResults(results: ScanResult[]) { return [...results].sort((a,b) => Math.abs(b.score) - Math.abs(a.score)) }
