"use client"

import { X, Activity, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { ExportAnalysis } from "@/components/export-analysis"
import { useWatchlist } from "@/hooks/use-watchlist"
import { SimplePriceDisplay } from "@/components/simple-price-display"

interface AnalysisData {
  symbol: string; currentPrice: number; change24h: number
  aiRecommendation: "Buy" | "Sell" | "Hold"; signalStrength: number
  indicators: { rsi: { value: number | null; signal: string }; trend: string; macd: string }
  technicalIndicators: { rsi: number | null; stochasticRsi: number | null; support: number | null; resistance: number | null }
  supportResistance: { support1: number | null; support2: number | null; resistance1: number | null; resistance2: number | null }
  marketInsight: string
  multiTimeframe: Record<string, { signal: "Buy" | "Sell" | "Hold"; confidence: number }>
}

interface ComprehensiveAnalysisPanelProps { symbol: string; onClose: () => void }

export function ComprehensiveAnalysisPanel({ symbol, onClose }: ComprehensiveAnalysisPanelProps) {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()

  useEffect(() => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 20000)
    setLoading(true); setError(null); setAnalysisData(null)
    ;(async () => {
      try {
        const response = await fetch(`/api/comprehensive-analysis?symbol=${encodeURIComponent(symbol)}`, { cache: "no-store", signal: controller.signal })
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.error || `Analysis API returned ${response.status}`)
        setAnalysisData(data)
      } catch (err) {
        setError(err instanceof DOMException && err.name === "AbortError" ? "Analysis timed out. The market-data provider may be temporarily unavailable." : err instanceof Error ? err.message : "Unable to load analysis.")
      } finally {
        clearTimeout(timeout); setLoading(false)
      }
    })()
    return () => { clearTimeout(timeout); controller.abort() }
  }, [symbol])

  if (loading) return <Overlay><Activity className="w-8 h-8 text-cyan-400 animate-pulse mx-auto mb-3" /><div className="text-white">Loading analysis for {symbol}...</div><div className="text-xs text-gray-500 mt-2">Fetching real market history</div></Overlay>
  if (error || !analysisData) return <Overlay><AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" /><div className="text-white font-semibold mb-2">Analysis unavailable</div><div className="text-sm text-gray-400 mb-5">{error || "No analysis was returned."}</div><div className="flex gap-2 justify-center"><Button onClick={onClose} variant="outline">Close</Button><Button onClick={() => window.location.reload()} className="bg-cyan-500 text-black">Retry</Button></div></Overlay>

  const inWatchlist = isInWatchlist(symbol)
  const fmt = (value: number | null | undefined) => value == null || !Number.isFinite(value) ? "—" : value.toFixed(2)
  return <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto"><div className="min-h-screen flex items-start justify-center p-4 py-8"><div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-cyan-500/30 rounded-lg max-w-6xl w-full shadow-2xl">
    <div className="sticky top-0 z-10 bg-gray-950/90 p-4 border-b border-cyan-500/30 flex items-center justify-between"><h2 className="text-xl font-bold text-white">Analysis for {symbol}</h2><div className="flex gap-2"><Button onClick={() => inWatchlist ? removeFromWatchlist(symbol) : addToWatchlist(symbol)} variant="outline" size="sm">{inWatchlist ? "In Watchlist" : "Add to Watchlist"}</Button><ExportAnalysis symbol={symbol} data={analysisData} /><Button onClick={onClose} variant="ghost" size="icon"><X className="h-5 w-5" /></Button></div></div>
    <div className="p-4 space-y-4"><SimplePriceDisplay symbol={symbol} currentPrice={analysisData.currentPrice} /><div className="p-4 rounded-lg border border-cyan-500/30 bg-cyan-500/5"><div className="flex justify-between"><div><div className="text-2xl font-bold">{analysisData.aiRecommendation}</div><div className="text-sm text-gray-400">Deterministic Market State · {analysisData.signalStrength}% confidence</div></div><div className="text-right"><div className="text-3xl font-bold text-cyan-400">${fmt(analysisData.currentPrice)}</div><div className={analysisData.change24h >= 0 ? "text-green-400" : "text-red-400"}>{analysisData.change24h >= 0 ? "+" : ""}{fmt(analysisData.change24h)}% (24h)</div></div></div></div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3"><Metric title="RSI" value={fmt(analysisData.technicalIndicators.rsi)} /><Metric title="Trend" value={analysisData.indicators.trend} /><Metric title="MACD" value={analysisData.indicators.macd} /><Metric title="Support" value={`$${fmt(analysisData.technicalIndicators.support)}`} /></div>
    <div className="bg-black/50 border border-cyan-500/20 rounded-lg p-4"><h3 className="text-sm font-semibold mb-3">Timeframe Alignment</h3><div className="grid grid-cols-2 md:grid-cols-5 gap-2">{Object.entries(analysisData.multiTimeframe).map(([tf, d]) => <div key={tf} className="text-center"><div className="text-xs text-gray-400 mb-1">{tf}</div><div className={`rounded-lg border p-3 ${d.signal === "Buy" ? "border-green-500/50 bg-green-500/10" : d.signal === "Sell" ? "border-red-500/50 bg-red-500/10" : "border-gray-500/50 bg-gray-500/10"}`}><div className="font-bold">{d.signal}</div><div className="text-xs text-gray-400">{d.confidence}%</div></div></div>)}</div></div>
    <div className="bg-black/50 border border-cyan-500/20 rounded-lg p-4"><h3 className="text-sm font-semibold mb-2">Market Intelligence</h3><p className="text-sm text-gray-300 leading-relaxed">{analysisData.marketInsight}</p></div><div className="grid grid-cols-2 gap-3"><Metric title="Resistance" value={`$${fmt(analysisData.technicalIndicators.resistance)}`} /><Metric title="Stoch RSI" value={fmt(analysisData.technicalIndicators.stochasticRsi)} /></div>
    </div></div></div>
}
function Overlay({ children }: { children: React.ReactNode }) { return <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"><div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-8 text-center max-w-md">{children}</div></div> }
function Metric({ title, value }: { title: string; value: string }) { return <div className="bg-black/50 border border-cyan-500/20 rounded-lg p-3"><div className="text-xs text-gray-400">{title}</div><div className="text-lg font-bold text-cyan-400 truncate">{value}</div></div> }
