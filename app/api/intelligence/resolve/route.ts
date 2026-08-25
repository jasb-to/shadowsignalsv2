import {NextResponse} from "next/server"
import {resolveAllForecasts} from "@/lib/intelligence/forecast-resolution"
export const dynamic="force-dynamic"
export async function POST(){try{const result=await resolveAllForecasts(async(symbol)=>{const u=new URL("/api/market-data",process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000");u.searchParams.set("symbol",symbol);const r=await fetch(u,{cache:"no-store"});if(!r.ok)return null;const d=await r.json();const p=Number(d.price??d.currentPrice);return Number.isFinite(p)?p:null});return NextResponse.json(result)}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"resolution_error"},{status:500})}}
