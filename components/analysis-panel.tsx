"use client"

import { X, TrendingUp, TrendingDown, Activity, BarChart3, Target } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AnalysisPanelProps {
  symbol: string
  analysis: string
  indicators: string[]
  onClose: () => void
}

export function AnalysisPanel({ symbol, analysis, indicators, onClose }: AnalysisPanelProps) {
  const sentiment = analysis.toLowerCase().includes("bullish")
    ? "bullish"
    : analysis.toLowerCase().includes("bearish")
      ? "bearish"
      : "neutral"

  const confluenceScore = Math.floor(Math.random() * 30) + 70 // Mock score

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-black via-gray-900 to-black border border-cyan-500/30 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl shadow-cyan-500/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500/20 to-transparent p-6 border-b border-cyan-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-cyan-400" />
              <div>
                <h2 className="text-2xl font-bold text-white">{symbol} Analysis</h2>
                <p className="text-sm text-gray-400">AI-Powered Confluence Analysis</p>
              </div>
            </div>
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

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Analysis */}
            <div className="lg:col-span-2 space-y-6">
              {/* Sentiment & Score */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/50 border border-cyan-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {sentiment === "bullish" ? (
                      <TrendingUp className="h-5 w-5 text-green-400" />
                    ) : sentiment === "bearish" ? (
                      <TrendingDown className="h-5 w-5 text-red-400" />
                    ) : (
                      <Activity className="h-5 w-5 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-400">Market Sentiment</span>
                  </div>
                  <p
                    className={`text-2xl font-bold ${
                      sentiment === "bullish"
                        ? "text-green-400"
                        : sentiment === "bearish"
                          ? "text-red-400"
                          : "text-gray-400"
                    }`}
                  >
                    {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                  </p>
                </div>

                <div className="bg-black/50 border border-cyan-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-cyan-400" />
                    <span className="text-sm text-gray-400">Confluence Score</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-cyan-400">{confluenceScore}</p>
                    <span className="text-gray-500">/100</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-500"
                      style={{ width: `${confluenceScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Analysis Text */}
              <div className="bg-black/50 border border-cyan-500/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-cyan-400" />
                  Detailed Analysis
                </h3>
                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap space-y-3">{analysis}</div>
              </div>
            </div>

            {/* Indicators Sidebar */}
            <div className="space-y-4">
              <div className="bg-black/50 border border-cyan-500/20 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Indicators Used</h3>
                <div className="space-y-2">
                  {indicators.map((indicator, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-cyan-500/5 border border-cyan-500/20 rounded"
                    >
                      <div className="h-2 w-2 bg-cyan-400 rounded-full" />
                      <span className="text-sm text-gray-300">{indicator}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-xs text-yellow-200/80 leading-relaxed">
                  <strong>Disclaimer:</strong> This analysis is for educational purposes only. ShadowSignals is not FCA
                  regulated and does not provide financial advice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
