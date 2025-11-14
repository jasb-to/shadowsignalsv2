"use client"

import { X, Activity, Target, AlertCircle, CheckCircle2, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { ExportAnalysis } from "@/components/export-analysis"
import { useWatchlist } from "@/hooks/use-watchlist"
import { SimplePriceDisplay } from "@/components/simple-price-display"

interface AnalysisData {
  symbol: string
  currentPrice: number
  change24h: number
  timeframes: {
    "1-4h": TimeframeAnalysis
    "4-24h": TimeframeAnalysis
  }
  aiRecommendation: "Buy" | "Sell" | "Hold"
  signalStrength: number
  indicators: {
    rsi: { value: number; signal: string }
    trend: string
    macd: string
  }
  technicalIndicators: {
    rsi: number
    stochasticRsi: number
    support: number
    resistance: number
  }
  supportResistance: {
    support1: number
    support2: number
    support3: number
    resistance1: number
    resistance2: number
    resistance3: number
  }
  marketInsight: string
  multiTimeframe: {
    "1h": { signal: "Buy" | "Sell" | "Hold"; confidence: number }
    "4h": { signal: "Buy" | "Sell" | "Hold"; confidence: number }
    "1d": { signal: "Buy" | "Sell" | "Hold"; confidence: number }
    "7d": { signal: "Buy" | "Sell" | "Hold"; confidence: number }
    "1m": { signal: "Buy" | "Sell" | "Hold"; confidence: number }
  }
}

interface TimeframeAnalysis {
  signal: "Buy" | "Sell" | "Hold"
  confidence: number
  momentumScore: number
  support: number
  resistance: number
  alignedIndicators: string[]
  conflictingSignals: string[]
  summary: string
}

interface ComprehensiveAnalysisPanelProps {
  symbol: string
  onClose: () => void
}

export function ComprehensiveAnalysisPanel({ symbol, onClose }: ComprehensiveAnalysisPanelProps) {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch(`/api/comprehensive-analysis?symbol=${symbol}`)
        const data = await response.json()
        setAnalysisData(data)
      } catch (error) {
        console.error("[v0] Failed to fetch analysis:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysis()
  }, [symbol])

  if (loading || !analysisData) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-white">Loading analysis...</div>
      </div>
    )
  }

  const inWatchlist = isInWatchlist(symbol)

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center p-4 py-8">
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-cyan-500/30 rounded-lg max-w-6xl w-full shadow-2xl shadow-cyan-500/20">
          <div className="sticky top-0 z-10 bg-gradient-to-r from-cyan-500/20 to-transparent p-4 border-b border-cyan-500/30 flex items-center justify-between backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white">Analysis for {symbol}</h2>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  console.log("[v0] Watchlist button clicked for:", symbol)
                  console.log("[v0] Currently in watchlist:", inWatchlist)
                  if (inWatchlist) {
                    removeFromWatchlist(symbol)
                  } else {
                    addToWatchlist(symbol)
                  }
                }}
                variant="outline"
                size="sm"
                className={`border-cyan-500/30 ${inWatchlist ? "text-yellow-400 bg-yellow-500/10" : "text-cyan-400"} hover:bg-cyan-500/10`}
              >
                <svg
                  className="h-4 w-4 mr-2"
                  fill={inWatchlist ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
                {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
              </Button>
              <ExportAnalysis symbol={symbol} data={analysisData} />
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white hover:bg-cyan-500/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <SimplePriceDisplay symbol={symbol} currentPrice={analysisData.currentPrice} />

            <div
              className={`p-4 rounded-lg border ${
                analysisData.aiRecommendation === "Buy"
                  ? "bg-green-500/10 border-green-500/30"
                  : analysisData.aiRecommendation === "Sell"
                    ? "bg-red-500/10 border-red-500/30"
                    : "bg-gray-500/10 border-gray-500/30"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">
                      AI Recommendation: {analysisData.aiRecommendation}
                    </div>
                    <div className="text-sm text-gray-400">{analysisData.signalStrength}% Confidence</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-cyan-400">${analysisData.currentPrice.toFixed(2)}</div>
                  <div
                    className={`text-sm flex items-center gap-1 justify-end ${analysisData.change24h >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {analysisData.change24h >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {analysisData.change24h >= 0 ? "+" : ""}
                    {analysisData.change24h.toFixed(2)}% (24h)
                  </div>
                </div>
              </div>

              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Signal Strength</span>
                  <span className="text-sm font-bold text-white">{analysisData.signalStrength}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3">
                  <div
                    className={`h-full rounded-full ${
                      analysisData.aiRecommendation === "Buy"
                        ? "bg-gradient-to-r from-green-600 to-green-400"
                        : analysisData.aiRecommendation === "Sell"
                          ? "bg-gradient-to-r from-red-600 to-red-400"
                          : "bg-gradient-to-r from-gray-600 to-gray-400"
                    }`}
                    style={{ width: `${analysisData.signalStrength}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-black/50 border border-cyan-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Timeframe Alignment</h3>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(analysisData.multiTimeframe).map(([timeframe, data]) => (
                  <div key={timeframe} className="text-center">
                    <div className="text-xs text-gray-400 mb-1">{timeframe}</div>
                    <div
                      className={`h-20 rounded-lg border-2 flex flex-col items-center justify-center ${
                        data.signal === "Buy"
                          ? "bg-green-500/20 border-green-500"
                          : data.signal === "Sell"
                            ? "bg-red-500/20 border-red-500"
                            : "bg-gray-500/20 border-gray-500"
                      }`}
                    >
                      <div
                        className={`text-lg font-bold ${
                          data.signal === "Buy"
                            ? "text-green-400"
                            : data.signal === "Sell"
                              ? "text-red-400"
                              : "text-gray-400"
                        }`}
                      >
                        {data.signal}
                      </div>
                      <div className="text-xs text-gray-400">{data.confidence}%</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs text-center text-gray-400">
                {Object.values(analysisData.multiTimeframe).every((tf) => tf.signal === analysisData.aiRecommendation)
                  ? "✓ All timeframes aligned"
                  : "⚠ Mixed signals across timeframes"}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <CompactTimeframeCard title="1-4 Hour" data={analysisData.timeframes["1-4h"]} accentColor="cyan" />
              <CompactTimeframeCard title="4-24 Hour" data={analysisData.timeframes["4-24h"]} accentColor="blue" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="bg-black/50 border border-cyan-500/20 rounded-lg p-3">
                <div className="text-xs text-gray-400">Current Price</div>
                <div className="text-2xl font-bold text-cyan-400">${analysisData.currentPrice.toFixed(2)}</div>
                <div
                  className={`text-xs flex items-center gap-1 ${analysisData.change24h >= 0 ? "text-green-400" : "text-red-400"}`}
                >
                  {analysisData.change24h >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {analysisData.change24h >= 0 ? "+" : ""}
                  {analysisData.change24h.toFixed(2)}%
                </div>
              </div>

              <div className="bg-black/50 border border-cyan-500/20 rounded-lg p-3">
                <div className="text-xs text-gray-400">RSI Signal</div>
                <div className="text-lg font-bold text-yellow-400">{analysisData.indicators.rsi.signal}</div>
              </div>

              <div className="bg-black/50 border border-cyan-500/20 rounded-lg p-3">
                <div className="text-xs text-gray-400">Trend</div>
                <div className="text-lg font-bold text-green-400">{analysisData.indicators.trend}</div>
              </div>

              <div className="bg-black/50 border border-cyan-500/20 rounded-lg p-3">
                <div className="text-xs text-gray-400">MACD Signal</div>
                <div className="text-lg font-bold text-green-400">{analysisData.indicators.macd}</div>
              </div>
            </div>

            <div className="bg-black/50 border border-cyan-500/20 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Technical Indicators</h3>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">RSI (14)</span>
                    <span className="text-sm font-bold text-cyan-400">{analysisData.technicalIndicators.rsi}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full"
                      style={{ width: `${analysisData.technicalIndicators.rsi}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                    <span>Oversold (30)</span>
                    <span>Overbought (70)</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Stochastic RSI</span>
                    <span className="text-sm font-bold text-cyan-400">
                      {analysisData.technicalIndicators.stochasticRsi}
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                      style={{ width: `${analysisData.technicalIndicators.stochasticRsi}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                    <span>Oversold (20)</span>
                    <span>Overbought (80)</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2">
                  <div className="text-[10px] text-green-400">Support</div>
                  <div className="text-sm font-bold text-green-400">
                    ${analysisData.technicalIndicators.support.toFixed(2)}
                  </div>
                </div>

                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2">
                  <div className="text-[10px] text-red-400">Resistance</div>
                  <div className="text-sm font-bold text-red-400">
                    ${analysisData.technicalIndicators.resistance.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-1.5 w-1.5 bg-cyan-400 rounded-full" />
                  <span className="text-xs font-semibold text-white">Confluence Indicators Used in Analysis</span>
                </div>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>
                    <strong>Technical Indicators:</strong> RSI (14), Stochastic RSI, MACD Signal, 8/21 EMA Cross, Volume
                    Trend, Price Action, Support/Resistance, Momentum
                  </div>
                  <div>
                    <strong>Analysis Timeframes:</strong> 1-4 Hour (Short-term) • 4-24 Hour (Long-term)
                  </div>
                  <div>
                    <strong>Confluence Method:</strong> AI-weighted indicator alignment with confidence scoring
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black/50 border border-cyan-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Support & Resistance Levels</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Support Levels */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-green-400 mb-2">Support Levels</div>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-green-400">S1 (Strong)</span>
                      <span className="text-sm font-bold text-green-400">
                        ${analysisData.supportResistance.support1.toFixed(4)}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {(
                        ((analysisData.currentPrice - analysisData.supportResistance.support1) /
                          analysisData.currentPrice) *
                        100
                      ).toFixed(2)}
                      % below current
                    </div>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-green-400">S2 (Moderate)</span>
                      <span className="text-sm font-bold text-green-400">
                        ${analysisData.supportResistance.support2.toFixed(4)}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {(
                        ((analysisData.currentPrice - analysisData.supportResistance.support2) /
                          analysisData.currentPrice) *
                        100
                      ).toFixed(2)}
                      % below current
                    </div>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-green-400">S3 (Weak)</span>
                      <span className="text-sm font-bold text-green-400">
                        ${analysisData.supportResistance.support3.toFixed(4)}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {(
                        ((analysisData.currentPrice - analysisData.supportResistance.support3) /
                          analysisData.currentPrice) *
                        100
                      ).toFixed(2)}
                      % below current
                    </div>
                  </div>
                </div>

                {/* Resistance Levels */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-red-400 mb-2">Resistance Levels</div>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-red-400">R1 (Strong)</span>
                      <span className="text-sm font-bold text-red-400">
                        ${analysisData.supportResistance.resistance1.toFixed(4)}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {(
                        ((analysisData.supportResistance.resistance1 - analysisData.currentPrice) /
                          analysisData.currentPrice) *
                        100
                      ).toFixed(2)}
                      % above current
                    </div>
                  </div>

                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-red-400">R2 (Moderate)</span>
                      <span className="text-sm font-bold text-red-400">
                        ${analysisData.supportResistance.resistance2.toFixed(4)}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {(
                        ((analysisData.supportResistance.resistance2 - analysisData.currentPrice) /
                          analysisData.currentPrice) *
                        100
                      ).toFixed(2)}
                      % above current
                    </div>
                  </div>

                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-red-400">R3 (Weak)</span>
                      <span className="text-sm font-bold text-red-400">
                        ${analysisData.supportResistance.resistance3.toFixed(4)}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {(
                        ((analysisData.supportResistance.resistance3 - analysisData.currentPrice) /
                          analysisData.currentPrice) *
                        100
                      ).toFixed(2)}
                      % above current
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual price position indicator */}
              <div className="mt-4 bg-gray-900/50 border border-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-2">Current Price Position</div>
                <div className="relative h-2 bg-gray-800 rounded-full">
                  <div className="absolute inset-0 flex items-center justify-between px-1">
                    <div className="h-1 w-1 bg-green-500 rounded-full" />
                    <div className="h-1 w-1 bg-red-500 rounded-full" />
                  </div>
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-4 w-1 bg-cyan-400 rounded-full"
                    style={{
                      left: `${Math.min(Math.max(((analysisData.currentPrice - analysisData.supportResistance.support3) / (analysisData.supportResistance.resistance3 - analysisData.supportResistance.support3)) * 100, 0), 100)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                  <span>Support Zone</span>
                  <span>Resistance Zone</span>
                </div>
              </div>
            </div>

            <div className="bg-black/50 border border-cyan-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">AI Market Insight</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">{analysisData.marketInsight}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CompactTimeframeCard({
  title,
  data,
  accentColor,
}: {
  title: string
  data: TimeframeAnalysis
  accentColor: "cyan" | "blue"
}) {
  const borderColor = accentColor === "cyan" ? "border-cyan-500/30" : "border-blue-500/30"
  const textColor = accentColor === "cyan" ? "text-cyan-400" : "text-blue-400"

  return (
    <div className={`bg-black/50 border ${borderColor} rounded-lg p-3`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <div
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            data.signal === "Sell"
              ? "bg-red-500/20 text-red-400"
              : data.signal === "Buy"
                ? "bg-green-500/20 text-green-400"
                : "bg-gray-500/20 text-gray-400"
          }`}
        >
          {data.signal} {data.confidence}%
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-400">Momentum Score</span>
          <span className="text-sm font-bold text-white">{data.momentumScore}/100</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className={`h-full bg-gradient-to-r ${accentColor === "cyan" ? "from-cyan-500 to-cyan-400" : "from-blue-500 to-blue-400"} rounded-full`}
            style={{ width: `${data.momentumScore}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2">
          <div className="text-[10px] text-green-400">Support</div>
          <div className="text-sm font-bold text-green-400">${data.support.toFixed(2)}</div>
        </div>

        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2">
          <div className="text-[10px] text-red-400">Resistance</div>
          <div className="text-sm font-bold text-red-400">${data.resistance.toFixed(2)}</div>
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <CheckCircle2 className="h-3 w-3 text-green-400" />
            <span className="text-xs font-semibold text-white">
              Aligned Indicators ({data.alignedIndicators.length})
            </span>
          </div>
          <ul className="space-y-0.5 ml-4">
            {data.alignedIndicators.map((indicator, index) => (
              <li key={index} className="text-[10px] text-gray-400">
                • {indicator}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center gap-1 mb-1">
            <AlertCircle className="h-3 w-3 text-red-400" />
            <span className="text-xs font-semibold text-white">
              Conflicting Signals ({data.conflictingSignals.length})
            </span>
          </div>
          <ul className="space-y-0.5 ml-4">
            {data.conflictingSignals.map((signal, index) => (
              <li key={index} className="text-[10px] text-gray-400">
                • {signal}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        className={`mt-2 p-2 bg-gradient-to-r ${accentColor === "cyan" ? "from-cyan-500/20" : "from-blue-500/20"} to-transparent border-l-2 ${accentColor === "cyan" ? "border-cyan-500" : "border-blue-500"} rounded`}
      >
        <p className="text-xs text-gray-300">{data.summary}</p>
      </div>
    </div>
  )
}
