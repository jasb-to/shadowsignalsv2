import { NextRequest, NextResponse } from "next/server"
import { similarStates } from "../../../../lib/market-state/store"
import { buildMarketState, type OHLCVBar } from "../../../../lib/market-state"
export async function GET(req: NextRequest) { const symbol=req.nextUrl.searchParams.get("symbol")?.toUpperCase(); if(!symbol)return NextResponse.json({error:"symbol is required"},{status:400}); const r=await fetch(new URL(`/api/market-history?symbol=${symbol}&days=30`,req.url),{cache:"no-store"}); const d=await r.json(); if(!r.ok)return NextResponse.json(d,{status:r.status}); const state=buildMarketState(symbol,d.bars as OHLCVBar[]); return NextResponse.json({symbol,state,similar:similarStates(state,10)}) }
