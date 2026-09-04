import {NextRequest,NextResponse} from "next/server"

const cryptoIds:Record<string,string>={BTC:"bitcoin",ETH:"ethereum",SOL:"solana",BNB:"binancecoin",XRP:"ripple",ADA:"cardano",DOGE:"dogecoin",AVAX:"avalanche-2",DOT:"polkadot",LINK:"chainlink",MATIC:"matic-network",PEPE:"pepe",SHIB:"shiba-inu",WIF:"dogwifcoin",BONK:"bonk",AAVE:"aave",UNI:"uniswap",CRV:"curve-dao-token",ARB:"arbitrum",OP:"optimism",HYPE:"hyperliquid"}
const cryptoSymbols=new Set(Object.keys(cryptoIds))
const commodity:Record<string,string>={GOLD:"XAU/USD",XAU:"XAU/USD",SILVER:"XAG/USD",XAG:"XAG/USD",OIL:"USOIL",CRUDE:"USOIL"}
const indexSymbols=new Set(["SPX","NDX"])
const CACHE_60={next:{revalidate:60} as const}
const CACHE_300={next:{revalidate:300} as const}
const staleCache=new Map<string,{data:any,timestamp:number}>()
const MAX_STALE_MS=15*60*1000

const sleep=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms))

async function fetchJSON(url:string,init:RequestInit={},attempts=2){
  let lastError:unknown
  for(let attempt=0;attempt<attempts;attempt++){
    try{
      const r=await fetch(url,init)
      let body:any=null
      try{body=await r.json()}catch{}
      if(r.ok)return body
      const status=r.status
      const message=typeof body?.message==="string"?body.message:""
      throw Error(`HTTP ${status}${message?` ${message}`:""}`)
    }catch(e){
      lastError=e
      if(attempt<attempts-1)await sleep(250*(attempt+1))
    }
  }
  throw lastError instanceof Error?lastError:Error("Provider request failed")
}

function remember(symbol:string,data:any){staleCache.set(symbol,{data,timestamp:Date.now()})}
function stale(symbol:string){const cached=staleCache.get(symbol);return cached&&Date.now()-cached.timestamp<=MAX_STALE_MS?{...cached.data,stale:true}:null}

async function gecko(symbol:string){
  const id=cryptoIds[symbol]
  if(!id)throw Error("Crypto asset not configured")
  const d=await fetchJSON(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(id)}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`,CACHE_60)
  const coin=d?.[id]
  if(!coin)throw Error("CoinGecko quote unavailable")
  const price=Number(coin.usd)
  if(!Number.isFinite(price))throw Error("CoinGecko returned no price")
  return{symbol,price,change24h:Number(coin.usd_24h_change)||0,volume24h:Number(coin.usd_24h_vol)||0,source:"CoinGecko",timestamp:Date.now()}
}

async function resolveIndex(symbol:string,key:string){
  const d=await fetchJSON(`https://api.twelvedata.com/symbol_search?symbol=${encodeURIComponent(symbol)}&apikey=${key}`,CACHE_300)
  const matches=Array.isArray(d?.data)?d.data:[]
  const hit=matches.find((x:any)=>String(x.type||x.instrument_type||"").toLowerCase()==="index")||matches[0]
  if(!hit?.symbol)throw Error("Index symbol not found")
  return{symbol:String(hit.symbol),exchange:typeof hit.exchange==="string"?hit.exchange:""}
}

async function twelve(symbol:string){
  const key=process.env.TWELVE_DATA_API_KEY
  if(!key)throw Error("TwelveData not configured")
  const resolved=indexSymbols.has(symbol)?await resolveIndex(symbol,key):{symbol:commodity[symbol]||symbol,exchange:""}
  const exchange=resolved.exchange?`&exchange=${encodeURIComponent(resolved.exchange)}`:""
  const d=await fetchJSON(`https://api.twelvedata.com/quote?symbol=${encodeURIComponent(resolved.symbol)}${exchange}&apikey=${key}`,CACHE_60)
  if(d?.status==="error")throw Error(typeof d.message==="string"?d.message:"TwelveData error")
  const price=Number(d?.close)
  if(!Number.isFinite(price))throw Error("TwelveData returned no price")
  const volume=Number(d?.volume)
  return{symbol,price,change24h:Number(d?.percent_change)||0,volume24h:Number.isFinite(volume)?volume:null,volumeAvailable:Number.isFinite(volume),source:"TwelveData",timestamp:Date.now()}
}

async function massive(symbol:string){
  const key=process.env.MASSIVE_API_KEY
  if(!key)throw Error("Massive not configured")
  let url:string
  let type:"stock"|"index"|"forex"|"crypto"
  if(indexSymbols.has(symbol)){type="index";url=`https://api.massive.com/v3/snapshot/indices?ticker=${encodeURIComponent(`I:${symbol}`)}&apiKey=${key}`}
  else if(symbol.includes("/")){type="forex";const [from,to]=symbol.split("/");url=`https://api.massive.com/v2/snapshot/locale/global/markets/forex/tickers/${encodeURIComponent(`C:${from}${to}`)}?apiKey=${key}`}
  else if(cryptoSymbols.has(symbol)){type="crypto";url=`https://api.massive.com/v2/snapshot/locale/global/markets/crypto/tickers/${encodeURIComponent(`X:${symbol}USD`)}?apiKey=${key}`}
  else{type="stock";url=`https://api.massive.com/v2/snapshot/locale/us/markets/stocks/tickers/${encodeURIComponent(symbol)}?apiKey=${key}`}
  const d=await fetchJSON(url,CACHE_60)
  if(d?.status&&String(d.status).toLowerCase()==="error")throw Error(typeof d.message==="string"?d.message:"Massive error")
  const item=Array.isArray(d?.results)?d.results[0]:d?.ticker
  if(!item)throw Error("Massive returned no data")
  if(type==="index"){
    const price=Number(item.value)
    if(!Number.isFinite(price))throw Error("Massive returned no index value")
    return{symbol,price,change24h:Number(item?.session?.change_percent)||0,volume24h:null,volumeAvailable:false,source:"Massive",timestamp:Date.now()}
  }
  const session=item.session||item.day||{}
  const price=Number(item?.lastTrade?.p??item?.lastQuote?.P??item?.lastQuote?.a??session?.price??session?.close??item?.min?.c??item?.day?.c)
  if(!Number.isFinite(price))throw Error("Massive returned no price")
  const volume=Number(session.volume??item?.day?.v??item?.min?.v)
  return{symbol,price,change24h:Number(item?.todaysChangePerc??session?.change_percent)||0,volume24h:Number.isFinite(volume)?volume:null,volumeAvailable:Number.isFinite(volume),source:"Massive",timestamp:Date.now()}
}

export async function GET(req:NextRequest){
  const raw=req.nextUrl.searchParams.get("symbol")?.trim()||""
  if(!raw)return NextResponse.json({error:"Symbol is required"},{status:400})
  const symbol=raw.toUpperCase()
  const isCrypto=cryptoSymbols.has(symbol)
  const providers=isCrypto?[gecko,twelve,massive]:[twelve,massive]
  for(const provider of providers){
    try{
      const data=await provider(symbol)
      remember(symbol,data)
      return NextResponse.json(data)
    }catch(e){
      console.warn(`[A3] market-data-smart provider failed for ${symbol}`,e instanceof Error?e.message:"unknown error")
    }
  }
  const cached=stale(symbol)
  if(cached)return NextResponse.json(cached)
  return NextResponse.json({error:"Market data unavailable",symbol},{status:503})
}
