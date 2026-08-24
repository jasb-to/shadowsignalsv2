import type { MarketState, MarketRegime, MarketSignal } from "@/lib/market-state/types"

export type ScenarioName = "bull" | "base" | "bear"
export interface A3Scenario { name: ScenarioName; probability: number; trigger: string; thesis: string }
export interface A3Factor { name: string; score: number; weight: number; contribution: number; state: "bullish" | "bearish" | "neutral" }
export interface A3EngineResult { score:number; confidence:number; signal:MarketSignal; regime:MarketRegime; factors:A3Factor[]; confluence:number; scenarios:A3Scenario[]; risk:"low"|"medium"|"high"; invalidation:string; thesis:string; dataQuality:number }

const clamp=(n:number,min=-100,max=100)=>Math.max(min,Math.min(max,n))
const state=(n:number):A3Factor["state"]=>n>10?"bullish":n<-10?"bearish":"neutral"
function factor(name:string,score:number,weight:number):A3Factor { const s=clamp(score); return {name,score:s,weight,contribution:s*weight,state:state(s)} }
function pct(values:number[]){const total=values.reduce((a,b)=>a+b,0);return total?values.map(v=>v/total*100):values}

/** Deterministic A³ market-intelligence engine. Evidence is weighted, missing data reduces quality, and scenarios are mutually exclusive. */
export function runA3Engine(m:MarketState):A3EngineResult {
 const inputs:number[]=[]
 const ema=m.indicators.ema8!=null&&m.indicators.ema21!=null?(m.indicators.ema8>m.indicators.ema21?35:-35):0; if(m.indicators.ema8!=null&&m.indicators.ema21!=null)inputs.push(ema)
 const trend=m.trend==="Trending Up"?45:m.trend==="Trending Down"?-45:0; inputs.push(trend)
 const macd=m.indicators.macd!=null&&m.indicators.macdSignal!=null?(m.indicators.macd>m.indicators.macdSignal?35:-35):0; if(m.indicators.macd!=null&&m.indicators.macdSignal!=null)inputs.push(macd)
 const rsi=m.indicators.rsi==null?0:m.indicators.rsi<30?20:m.indicators.rsi<45?8:m.indicators.rsi>75?-20:m.indicators.rsi>60?12:0; if(m.indicators.rsi!=null)inputs.push(rsi)
 const momentum=Number.isFinite(m.momentum)?clamp(m.momentum):0; if(Number.isFinite(m.momentum))inputs.push(momentum)
 const vol=Number.isFinite(m.volatility)?(m.volatility>=12?-15:m.volatility>=8?-8:m.volatility<3?5:0):0; if(Number.isFinite(m.volatility))inputs.push(vol)
 const regimeScore=m.regime==="bullish_expansion"?35:m.regime==="bearish_expansion"?-35:m.regime==="accumulation"?20:m.regime==="distribution"?-20:0; inputs.push(regimeScore)
 const factors=[factor("Trend",trend,.20),factor("EMA structure",ema,.15),factor("Momentum",momentum,.15),factor("MACD",macd,.15),factor("RSI",rsi,.10),factor("Volatility",vol,.05),factor("Market regime",regimeScore,.20)]
 const activeWeight=factors.filter(f=>f.score!==0).reduce((s,f)=>s+f.weight,0)
 const raw=activeWeight?factors.reduce((s,f)=>s+f.contribution,0)/activeWeight:0
 const score=Math.round(clamp(raw))
 const signal:MarketSignal=score>=35?"Buy":score<=-35?"Sell":"Hold"
 const directional=factors.filter(f=>f.state!=="neutral"); const aligned=directional.filter(f=>f.state===state(score)).length
 const confluence=directional.length?Math.round(aligned/directional.length*100):0
 const dataQuality=Math.round(activeWeight/1*100)
 const agreement=Math.max(0,Math.min(1,confluence/100)); const confidence=Math.round(Math.max(45,Math.min(92,50+Math.abs(score)*.30+agreement*12)))
 const risk=m.volatility>=12?"high":m.volatility>=6?"medium":"low"
 const support=m.supportResistance.support1; const resistance=m.supportResistance.resistance1
 const bull=Math.max(10,Math.min(75,35+Math.max(score,0)*.38+Math.max(confluence-50,0)*.12))
 const bear=Math.max(10,Math.min(75,35+Math.max(-score,0)*.38+Math.max(confluence-50,0)*.12))
 let weights=pct([bull,35,bear]); const scenarios:A3Scenario[]=[
  {name:"bull",probability:Math.round(weights[0]),trigger:resistance!=null?`Sustained close above ${resistance}`:"Confirmed break above structural resistance",thesis:"Trend and momentum extend as buyers maintain control."},
  {name:"base",probability:Math.round(weights[1]),trigger:"Price remains within the current structure",thesis:"The market consolidates while conflicting evidence resolves."},
  {name:"bear",probability:Math.round(weights[2]),trigger:support!=null?`Decisive close below ${support}`:"Confirmed break below structural support",thesis:"Loss of structure increases downside pressure and invalidates the bullish case."}
 ]
 scenarios[2].probability=Math.max(1,100-scenarios[0].probability-scenarios[1].probability); scenarios[1].probability=Math.max(1,100-scenarios[0].probability-scenarios[2].probability)
 const invalidation=support!=null?`Bullish thesis weakens on a decisive close below ${support}.`:"Bullish thesis weakens on a confirmed break of structural support."
 const thesis=signal==="Buy"?`${m.symbol} has a positive A³ state: trend, momentum and regime evidence currently outweigh opposing factors.`:signal==="Sell"?`${m.symbol} has a negative A³ state: downside evidence currently outweighs the bullish factors.`:`${m.symbol} is in a mixed A³ state: evidence is not sufficiently aligned for a strong directional thesis.`
 return {score,confidence,signal,regime,factors,confluence,scenarios,risk,invalidation,thesis,dataQuality}
}
