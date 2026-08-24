import { NextRequest,NextResponse } from "next/server"
import { getCalibration } from "@/lib/intelligence/forecast-store"
export const dynamic="force-dynamic"
export async function GET(req:NextRequest){try{const symbol=req.nextUrl.searchParams.get("symbol")||undefined;const calibration=await getCalibration(symbol);return NextResponse.json({symbol:symbol??"ALL",calibration,updatedAt:new Date().toISOString()})}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"calibration_error"},{status:500})}}
