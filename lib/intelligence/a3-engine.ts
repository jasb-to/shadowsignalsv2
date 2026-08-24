import type { MarketState, MarketRegime, MarketSignal } from "@/lib/market-state/types"

export type ScenarioName="bull"|"base"|"bear"
export interface A3Scenario{name:ScenarioName;probability:number;trigger:string;thesis:string}
export interface A3Factor{name:string;score:number;weight:number;contribution:number;state:"bullish"|"bearish"|"neutral"}
export interface A3EngineResult{score:number;confidence:number;signal:MarketSignal;regime:MarketRegime;factors:A3Factor[];confluence:number;scenarios:A3Scenario[];risk:"low"|"medium"|"high";invalidation:string;thesis:string;dataQuality:number;regimeTransition:"strengthening"|"weakening"|"stable";marketStructure:"breakout"|"breakdown"|"range"}
const clamp=(n:number,min=-100,max=100)=>Math.max(min,Math.min(max,n))
const state=(n:number):A3Factor["state"]=>n>10?"bullish":n<-10?"bearish":"neutral"
const factor=(name:string,score:number,weight:number):A3Factor=>{const s=clamp(score);return{name,score:s,weight,contribution:s*weight,state:state(s)}}
function normalise(v:number[]){const t=v.reduce((a,b)=>a+b,0)||1;return v.map(x=>x/t*100)}
export function runA3Engine(m:MarketState):A3EngineResult{
 const ema=m.indicators.ema8!=null&&m.indicators.ema21!=null?(m.indicators.ema8>m.indicators.ema21?35:-35):0
 const trend=m.trend==="Trending Up"?45:m.trend==="Trending Down"?-45:0
 const macd=m.indicators.macd!=null&&m.indicators.macdSignal!=null?(m.indicators.macd>m.indicators.macdSignal?35:-35):0
 const rsi=m.indicators.rsi==null?0:m.indicators.rsi<30?20:m.indicators.rsi<45?8:m.indicators.rsi>75?-20:m.indicators.rsi>60?12:0
 const momentum=Number.isFinite(m.momentum)?clamp(m.momentum):0
 const vol=Number.isFinite(m.volatility)?(m.volatility>=12?-15:m.volatility>=8?-8:m.volatility<3?5:0):0
 const regimeScore=m.regime==="bullish_expansion"?35:m.regime==="bearish_expansion"?-35:m.regime==="accumulation"?20:m.regime==="distribution"?-20:0
 const factors=[factor("Trend",trend,.18),factor("EMA structure",ema,.14),factor("Momentum",momentum,.14),factor("MACD",macd,.13),factor("RSI",rsi,.09),factor("Volatility",vol,.06),factor("Market regime",regimeScore,.16)]
 const active=factors.filter(f=>f.score!==0);const activeWeight=active.reduce((s,f)=>s+f.weight,0)||1
 const score=Math.round(clamp(factors.reduce((s,f)=>s+f.contribution,0)/activeWeight))
 const signal:MarketSignal=score>=35?"Buy":score<=-35?"Sell":"Hold"
 const directional=active;const aligned=directional.filter(f=>f.state===state(score)).length
 const confluence=directional.length?Math.round(aligned/directional.length*100):0
 const dataQuality=Math.round(activeWeight/.90*100)
 const support=m.supportResistance.support1;const resistance=m.supportResistance.resistance1;const price=m.price
 const breakout=price!=null&&resistance!=null&&price>resistance
 const breakdown=price!=null&&support!=null&&price<support
 const structure: A3EngineResult["marketStructure"]=breakout?"breakout":breakdown?"breakdown":"range"
 const transition: A3EngineResult["regimeTransition"]=score>20&&m.regime!=="bullish_expansion"?"strengthening":score<-20&&m.regime!=="bearish_expansion"?"weakening":"stable"
 const agreement=confluence/100
 const confidence=Math.round(Math.max(40,Math.min(94,48+Math.abs(score)*.30+agreement*15-(100-Math.min(100,dataQuality))*.08)))
 const risk=m.volatility>=12?"high":m.volatility>=6?"medium":"low"
 const bull=Math.max(8,35+Math.max(score,0)*.45+Math.max(confluence-50,0)*.15+(breakout?10:0))
 const bear=Math.max(8,35+Math.max(-score,0)*.45+Math.max(confluence-50,0)*.15+(breakdown?10:0))
 const [bp,basep,rp]=normalise([bull,35,bear]).map(Math.round);const base=Math.max(1,100-bp-rp)
 const scenarios:A3Scenario[]=[
  {name:"bull",probability:bp,trigger:resistance!=null?`Sustained close above ${resistance}`:"Confirmed structural breakout",thesis:"Trend and momentum extend with buyers retaining control."},
  {name:"base",probability:base,trigger:"Price remains inside the current structure",thesis:"The market consolidates while conflicting evidence resolves."},
  {name:"bear",probability:rp,trigger:support!=null?`Decisive close below ${support}`:"Confirmed structural breakdown",thesis:"Loss of structure increases downside pressure and weakens the bullish case."}
 ]
 const invalidation=support!=null?`Bullish thesis weakens on a decisive close below ${support}.`:"Bullish thesis weakens on confirmed structural support failure."
 const thesis=signal==="Buy"?`${m.symbol} has a positive A³ state: directional evidence currently outweighs opposing factors.`:signal==="Sell"?`${m.symbol} has a negative A³ state: downside evidence currently outweighs bullish factors.`:`${m.symbol} is mixed: evidence is not sufficiently aligned for a strong directional thesis.`
 return{score,confidence,signal,regime,factors,confluence,scenarios,risk,invalidation,thesis,dataQuality,regimeTransition:transition,marketStructure:structure}
}
