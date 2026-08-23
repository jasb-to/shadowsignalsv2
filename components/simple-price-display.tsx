"use client"

import { Card } from "@/components/ui/card"

interface SimplePriceDisplayProps {
  symbol: string
  currentPrice: number | null | undefined
}

export function SimplePriceDisplay({ symbol, currentPrice }: SimplePriceDisplayProps) {
  const price = typeof currentPrice === "number" && Number.isFinite(currentPrice) ? currentPrice : null

  return (
    <Card className="border-black/10 bg-white p-5 text-[#11110f] shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[.22em] text-[#e85d04]">Current price</div>
          <div className="mt-1 text-sm font-medium text-black/45">{symbol}</div>
        </div>
        <div className="h-2 w-2 rounded-full bg-emerald-500" />
      </div>
      <div className="mt-4 text-3xl font-semibold tabular-nums tracking-[-.04em]">
        {price === null ? "—" : `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
      </div>
      <div className="mt-1 text-xs text-black/40">Live market price · aggregated sources</div>
    </Card>
  )
}
