"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

interface ExportAnalysisProps {
  symbol: string
  data: any
}

export function ExportAnalysis({ symbol, data }: ExportAnalysisProps) {
  const { toast } = useToast()

  const exportAsJSON = () => {
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `shadowsignals-${symbol}-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Export Successful",
      description: `${symbol} analysis exported as JSON`,
    })
  }

  const exportAsCSV = () => {
    const csvRows = [
      ["Metric", "Value"],
      ["Symbol", symbol],
      ["Current Price", data.currentPrice],
      ["24h Change", `${data.change24h}%`],
      ["AI Recommendation", data.aiRecommendation],
      ["Signal Strength", `${data.signalStrength}%`],
      ["RSI", data.technicalIndicators.rsi],
      ["Stochastic RSI", data.technicalIndicators.stochasticRsi],
      ["Support", data.technicalIndicators.support],
      ["Resistance", data.technicalIndicators.resistance],
      ["Trend", data.indicators.trend],
      ["MACD Signal", data.indicators.macd],
    ]

    const csvString = csvRows.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvString], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `shadowsignals-${symbol}-${Date.now()}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Export Successful",
      description: `${symbol} analysis exported as CSV`,
    })
  }

  const shareAnalysis = async () => {
    const shareText = `ShadowSignals Analysis for ${symbol}:\n\nPrice: $${data.currentPrice.toFixed(2)} (${data.change24h >= 0 ? "+" : ""}${data.change24h.toFixed(2)}%)\nAI Recommendation: ${data.aiRecommendation} (${data.signalStrength}% confidence)\n\nAnalyse your assets at shadowsignals.live`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `ShadowSignals - ${symbol} Analysis`,
          text: shareText,
        })
        toast({
          title: "Shared Successfully",
          description: `${symbol} analysis shared`,
        })
        return
      } catch (error: any) {
        // User cancelled or share not supported, fall through to clipboard
        if (error.name !== "AbortError") {
          console.log("[v0] Web Share not available, using clipboard fallback")
        }
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareText)
      toast({
        title: "Copied to Clipboard",
        description: `${symbol} analysis copied. Share it anywhere!`,
      })
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Unable to copy to clipboard. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 bg-transparent"
        >
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-gray-900 border-cyan-500/30">
        <DropdownMenuItem onClick={exportAsJSON} className="text-white hover:bg-cyan-500/10 cursor-pointer">
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m3 4h6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsCSV} className="text-white hover:bg-cyan-500/10 cursor-pointer">
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareAnalysis} className="text-white hover:bg-cyan-500/10 cursor-pointer">
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          Share Analysis
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
