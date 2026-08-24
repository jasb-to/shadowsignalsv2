import type { MarketState, MarketRegime, MarketSignal } from "@/lib/market-state/types"

export type ScenarioName = "bull" | "base" | "bear"
export interface A3Scenario { name: ScenarioName; probability: number; trigger: string; thesis: string }
export interface A3Factor { name: string; score: number; weight: number; contribution: number; state: "bullish" | "bearish" | "neutral" }
export interface A3EngineResult {
  score: number
  confidence: number
  signal: MarketSignal
  regime: MarketRegime
  factors: A3Factor[]
  confluence: number
  scenarios: A3Scenario[]
  risk: "low" | "medium" | "high"
  invalidation: string
  thesis: string
}

const clamp=(n:number,min=-100,max=100)=>Math.max(min,Math.min(max,n))
const state=(n:number):A3Factor["state"]=>n>10?"bullish":n<-10?"bearish":"neutral"
function factor(name:string,score:number,weight:number):A3Factor { const s=clamp(score); return {name,score:s,weight,contribution:s*weight,state:state(s)} }

/**
 * Deterministic A³ engine. It converts market-state evidence into a thesis,
 * scenarios and risk context. It deliberately contains no personalised
 * portfolio advice and never treats one indicator as decisive.
 */
export function runA3Engine(m: MarketState): A3EngineResult {
  const ema = m.indicators.ema8!=null && m.indicators.ema21!=null ? (m.indicators.ema8>m.indicators.ema21?35:-35) : 0
  const trend = m.trend==="Trending Up"?45:m.trend==="Trending Down"?-45:0
  const macd = m.indicators.macd!=null && m.indicators.macdSignal!=null ? (m.indicators.macd>m.indicators.macdSignal?35:-35):0
  const rsi = m.indicators.rsi==null?0:m.indicators.rsi<30?25:m.indicators.rsi<45?10:m.indicators.rsi>75?-25:m.indicators.rsi>60?15:0
  const momentum = clamp(m.momentum)
  const vol = m.volatility>10?-15:m.volatility<3?5:0
  const factors=[
    factor("Trend",trend,.20),
    factor("EMA structure",ema,.15),
    factor("Momentum",momentum,.15),
    factor("MACD",macd,.15),
    factor("RSI",rsi,.10),
    factor("Volatility",vol,.05),
    factor("Market regime",m.regime==="bullish_expansion"?35:m.regime==="bearish_expansion"?-35:m.regime==="accumulation"?20:m.regime==="distribution"?-20:0,.20),
  ]
  const score=Math.round(clamp(factors.reduce((s,f)=>s+f.contribution,0)))
  const signal:MarketSignal=score>=35?"Buy":score<=-35?"Sell":"Hold"
  const aligned=factors.filter(f=>f.state===state(score)&&f.state!=="neutral").length
  const confluence=Math.round((aligned/Math.max(1,factors.length))*100)
  const confidence=Math.min(92,Math.max(45,Math.round(50+Math.abs(score)*.42+Math.max(0,confluence-50)*.08)))
  const regime=m.regime
  const risk:m["volatility"] extends number ? A3EngineResult["risk"] : never = m.volatility>=12?"high":m.volatility>=6?"medium":"low"
  const support=m.supportResistance.support1
  const resistance=m.supportResistance.resistance1
  const scenarios:A3Scenario[]=[
    {name:"bull",probability:Math.round(Math.max(15,Math.min(70,50+score*.25))),trigger:resistance!=null?`Sustained close above ${resistance}`:"Confirmed break above nearby resistance",thesis:"Trend and momentum extend while buyers hold the breakout."},
    {name:"base",probability:Math.round(Math.max(15,Math.min(60,35-Math.abs(score)*.08))),trigger:"Price remains inside the current structure",thesis:"The market consolidates while conflicting evidence resolves."},
    {name:"bear",probability:0,trigger:support!=null?`Decisive close below ${support}`:"Break below structural support",thesis:"Loss of support weakens structure and increases downside risk."},
  ]
  scenarios[2].probability=Math.max(10,100-scenarios[0].probability-scenarios[1].probability)
  const total=scenarios.reduce((s,x)=>s+x.probability,0); if(total!==100)scenarios[1].probability=Math.max(1,scenarios[1].probability+(100-total))
  const invalidation=support!=null?`Thesis weakens on a decisive close below ${support}.`:"Thesis invalidation requires a confirmed break of structural support."
  const thesis=signal==="Buy"?`${m.symbol} has a positive A³ state: trend and momentum evidence currently outweigh opposing signals.`:signal==="Sell"?`${m.symbol} has a negative A³ state: downside evidence currently outweighs the bullish factors.`:`${m.symbol} is in a mixed A³ state: evidence is not sufficiently aligned for a strong directional thesis.`
  return {score,confidence,signal,regime,factors,confluence,scenarios,risk,invalidation,thesis}
}
