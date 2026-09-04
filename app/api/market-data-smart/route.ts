import { NextRequest, NextResponse } from "next/server"
import { unstable_cache } from "next/cache"

export const runtime = "nodejs"

const cryptoIds: Record<string,string> = { BTC:"bitcoin", ETH:"ethereum", SOL:"solana", BNB:"binancecoin", XRP:"ripple", ADA:"cardano", DOGE:"dogecoin", AVAX:"avalanche-2", DOT:"polkadot", LINK:"chainlink", MATIC:"matic-network", PEPE:"pepe", SHIB:"shiba-inu", WIF:"dogwifcoin", BONK:"bonk", AAVE:"aave", UNI:"uniswap", CRV:"curve-dao-token", ARB:"arbitrum", OP:"optimism", HYPE:"hyperliquid" }
const cryptoSymbols = new Set(Object.keys(cryptoIds))
const commodity: Record<string,string> = { GOLD:"XAU/USD", XAU:"XAU/USD", SILVER:"XAG/USD", XAG:"XAG/USD", OIL:"USOIL", CRUDE:"USOIL" }
const indexSymbols = new Set(["SPX","NDX"])
const SYMBOL_PATTERN = /^[A-Z0-9][A-Z0-9._:/-]{0,31}$/
const PROVIDER_TIMEOUT_MS = 3500
const CACHE_SECONDS = 60
const STALE_IF_ERROR_SECONDS = 900

const sleep = (ms:number) => new Promise(resolve => setTimeout(resolve, ms))

async function fetchJSON(url:string, attempts = 2) {
  let lastError: unknown
  for (let attempt=0; attempt<attempts; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS)
    try {
      const response = await fetch(url, { signal:controller.signal, redirect:"error", cache:"no-store" })
      let body:any = null
      try { body = await response.json() } catch {}
      if (response.ok) return body
      const message = typeof body?.message === "string" ? body.message : ""
      throw Error(`HTTP ${response.status}${message ? ` ${message}` : ""}`)
    } catch (error) {
      lastError = error instanceof Error && error.name === "AbortError" ? Error("Provider request timed out") : error
      if (attempt < attempts-1) await sleep(250 * (attempt+1))
    } finally { clearTimeout(timer) }
  }
  throw lastError instanceof Error ? lastError : Error("Provider request failed")
}

async function geckoFresh(symbol:string) {
  const id = cryptoIds[symbol]
  if (!id) throw Error("Crypto asset not configured")
  const data = await fetchJSON(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(id)}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`)
  const coin = data?.[id]
  const price = Number(coin?.usd)
  if (!Number.isFinite(price) || price <= 0) throw Error("CoinGecko returned no valid price")
  return { symbol, price, change24h:Number(coin.usd_24h_change)||0, volume24h:Number(coin.usd_24h_vol)||0, source:"CoinGecko", timestamp:Date.now(), stale:false }
}

async function resolveIndex(symbol:string,key:string) {
  const data = await fetchJSON(`https://api.twelvedata.com/symbol_search?symbol=${encodeURIComponent(symbol)}&apikey=${key}`)
  const matches = Array.isArray(data?.data) ? data.data : []
  const hit = matches.find((x:any) => String(x.type||x.instrument_type||"").toLowerCase() === "index") || matches[0]
  if (!hit?.symbol) throw Error("Index symbol not found")
  return { symbol:String(hit.symbol), exchange:typeof hit.exchange === "string" ? hit.exchange : "" }
}

async function twelveFresh(symbol:string) {
  const key = process.env.TWELVE_DATA_API_KEY
  if (!key) throw Error("TwelveData not configured")
  const resolved = indexSymbols.has(symbol) ? await resolveIndex(symbol,key) : { symbol:commodity[symbol]||symbol, exchange:"" }
  const exchange = resolved.exchange ? `&exchange=${encodeURIComponent(resolved.exchange)}` : ""
  const data = await fetchJSON(`https://api.twelvedata.com/quote?symbol=${encodeURIComponent(resolved.symbol)}${exchange}&apikey=${key}`)
  if (data?.status === "error") throw Error("TwelveData quote unavailable")
  const price = Number(data?.close)
  if (!Number.isFinite(price) || price <= 0) throw Error("TwelveData returned no valid price")
  const volume = Number(data?.volume)
  return { symbol, price, change24h:Number(data?.percent_change)||0, volume24h:Number.isFinite(volume)?volume:null, volumeAvailable:Number.isFinite(volume), source:"TwelveData", timestamp:Date.now(), stale:false }
}

async function massiveFresh(symbol:string) {
  const key = process.env.MASSIVE_API_KEY
  if (!key) throw Error("Massive not configured")
  let url:string
  let type:"stock"|"index"|"forex"|"crypto"
  if (indexSymbols.has(symbol)) { type="index"; url=`https://api.massive.com/v3/snapshot/indices?ticker=${encodeURIComponent(`I:${symbol}`)}&apiKey=${key}` }
  else if (symbol.includes("/")) { type="forex"; const [from,to]=symbol.split("/"); url=`https://api.massive.com/v2/snapshot/locale/global/markets/forex/tickers/${encodeURIComponent(`C:${from}${to}`)}?apiKey=${key}` }
  else if (cryptoSymbols.has(symbol)) { type="crypto"; url=`https://api.massive.com/v2/snapshot/locale/global/markets/crypto/tickers/${encodeURIComponent(`X:${symbol}USD`)}?apiKey=${key}` }
  else { type="stock"; url=`https://api.massive.com/v2/snapshot/locale/us/markets/stocks/tickers/${encodeURIComponent(symbol)}?apiKey=${key}` }
  const data = await fetchJSON(url)
  const item = Array.isArray(data?.results) ? data.results[0] : data?.ticker
  if (!item) throw Error("Massive returned no data")
  if (type === "index") {
    const price = Number(item.value)
    if (!Number.isFinite(price) || price <= 0) throw Error("Massive returned no valid index value")
    return { symbol, price, change24h:Number(item?.session?.change_percent)||0, volume24h:null, volumeAvailable:false, source:"Massive", timestamp:Date.now(), stale:false }
  }
  const session = item.session || item.day || {}
  const price = Number(item?.lastTrade?.p ?? item?.lastQuote?.P ?? item?.lastQuote?.a ?? session?.price ?? session?.close ?? item?.min?.c ?? item?.day?.c)
  if (!Number.isFinite(price) || price <= 0) throw Error("Massive returned no valid price")
  const volume = Number(session.volume ?? item?.day?.v ?? item?.min?.v)
  return { symbol, price, change24h:Number(item?.todaysChangePerc ?? session?.change_percent)||0, volume24h:Number.isFinite(volume)?volume:null, volumeAvailable:Number.isFinite(volume), source:"Massive", timestamp:Date.now(), stale:false }
}

function durable<T>(provider:string, symbol:string, loader:(symbol:string)=>Promise<T>) {
  return unstable_cache(() => loader(symbol), ["a3-market-data", provider, symbol], { revalidate:CACHE_SECONDS, tags:[`a3-market-data:${symbol}`] })()
}

export async function GET(req:NextRequest) {
  const raw = req.nextUrl.searchParams.get("symbol")?.trim() || ""
  if (!raw) return NextResponse.json({error:"Symbol is required"},{status:400,headers:{"Cache-Control":"no-store"}})
  const symbol = raw.toUpperCase()
  if (!SYMBOL_PATTERN.test(symbol)) return NextResponse.json({error:"Invalid symbol"},{status:400,headers:{"Cache-Control":"no-store"}})

  const isCrypto = cryptoSymbols.has(symbol)
  const providers = isCrypto
    ? [{name:"CoinGecko",load:(s:string)=>durable("coingecko",s,geckoFresh)},{name:"TwelveData",load:(s:string)=>durable("twelve",s,twelveFresh)},{name:"Massive",load:(s:string)=>durable("massive",s,massiveFresh)}]
    : [{name:"TwelveData",load:(s:string)=>durable("twelve",s,twelveFresh)},{name:"Massive",load:(s:string)=>durable("massive",s,massiveFresh)}]

  for (const provider of providers) {
    try {
      const data:any = await provider.load(symbol)
      const ageSeconds = Math.max(0, Math.floor((Date.now()-Number(data.timestamp||Date.now()))/1000))
      return NextResponse.json({...data, dataAgeSeconds:ageSeconds},{headers:{"Cache-Control":`public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${STALE_IF_ERROR_SECONDS}, stale-if-error=${STALE_IF_ERROR_SECONDS}`,"X-A3-Data-Status":ageSeconds<=CACHE_SECONDS?"fresh":"stale"}})
    } catch (error) {
      console.warn(`[A3] market-data-smart provider failed for ${symbol} via ${provider.name}`, error instanceof Error ? error.message : "unknown error")
    }
  }

  return NextResponse.json({error:"Market data unavailable",symbol},{status:503,headers:{"Cache-Control":"no-store"}})
}
