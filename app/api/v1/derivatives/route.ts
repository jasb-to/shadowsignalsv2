import { NextRequest, NextResponse } from "next/server"
import { getDerivativesSnapshot } from "@/lib/intelligence/derivatives"
export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.toUpperCase()
  if (!symbol) return NextResponse.json({ error: "symbol is required" }, { status: 400 })
  return NextResponse.json(await getDerivativesSnapshot(symbol))
}
