import {NextRequest,NextResponse} from "next/server"
import {resolveAllForecasts} from "@/lib/intelligence/forecast-resolution"
export const dynamic="force-dynamic"
async function run(req:NextRequest){const secret=process.env.A3_CRON_SECRET;if(secret&&req.headers.get("authorization")!==`Bearer ${secret}`)return NextResponse.json({error:"Unauthorized"},{status:401});try{const result=await resolveAllForecasts(async(symbol)=>{const u=new URL("/api/market-data",req.url);u.searchParams.set("symbol",symbol);const r=await fetch(u,{cache:"no-store"});if(!r.ok)return null;const d=await r.json();const p=Number(d.price??d.currentPrice);return Number.isFinite(p)?p:null});return NextResponse.json(result)}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"resolution_error"},{status:500})}}
export async function GET(req:NextRequest){return run(req)}
export async function POST(req:NextRequest){return run(req)}
