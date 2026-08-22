import { NextRequest, NextResponse } from "next/server"
import { statesFor } from "../../../../lib/market-state/store"
export async function GET(req: NextRequest) { const symbol=req.nextUrl.searchParams.get("symbol"); if(!symbol)return NextResponse.json({error:"symbol is required"},{status:400}); return NextResponse.json({symbol:symbol.toUpperCase(),states:statesFor(symbol,Number(req.nextUrl.searchParams.get("limit")||100))}) }
