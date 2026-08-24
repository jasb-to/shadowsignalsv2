import type { MarketState } from "@/lib/market-state/types"
import { runA3Engine, type A3EngineResult, type A3Factor } from "@/lib/intelligence/a3-engine"
import { scoreIntelligence } from "@/lib/intelligence/scoring"
import type { DerivativesSnapshot } from "@/lib/intelligence/derivatives"
import type { FlowSnapshot } from "@/lib/intelligence/flows"
import type { HistoricalIntelligence } from "@/lib/intelligence/historical"

export interface A3Context {
  derivatives?: DerivativesSnapshot | null
  flow?: FlowSnapshot | null
  historical?: HistoricalIntelligence | null
  breadthScore?: number | null
  cycleScore?: number | null
  strategicScore?: number | null
}
export interface A3Intelligence extends A3EngineResult {
  context: { derivatives: DerivativesSnapshot|null; flow: FlowSnapshot|null; historical: HistoricalIntelligence|null }
  dataQuality: { available: number; total: number; completeness: number }
  evidence: string[]
}

const clamp=(n:number,min=-100,max=100)=>Math.max(min,Math.min(max,n))
export function buildA3Intelligence(market: MarketState, ctx:A3Context={}):A3Intelligence {
  const base=runA3Engine(market)
  const derivative=ctx.derivatives
  const flow=ctx.flow
  const tactical=scoreIntelligence({trend:market.trend,rsi:market.indicators.rsi,macd:market.indicators.macd,macdSignal:market.indicators.macdSignal,fundingRate:derivative?.fundingRate,longShortRatio:derivative?.longShortRatio,volumePriceDivergence:flow?.volumePriceDivergence})
  const breadth=ctx.breadthScore ?? 50
  const cycle=ctx.cycleScore ?? 50
  const strategic=ctx.strategicScore ?? (base.score+100)/2
  const contextual=Math.round(clamp((tactical.score*.4)+((breadth-50)*.25)+((cycle-50)*.2)+((strategic-50)*.15),-100,100))
  const mergedScore=Math.round(clamp(base.score*.65+contextual*.35))
  const signal=mergedScore>=35?"Buy":mergedScore<=-35?"Sell":"Hold"
  const confidence=Math.min(94,Math.max(45,Math.round(base.confidence*.7+tactical.confidence*.3)))
  const evidence=[...base.factors.filter((f:A3Factor)=>f.state!=="neutral").map((f:A3Factor)=>`${f.name}: ${f.state}`),...tactical.factors]
  if(derivative?.fundingRate!=null)evidence.push(`Funding ${derivative.fundingRate>0?"positive":"negative"}`)
  if(derivative?.longShortRatio!=null)evidence.push(`Long/short ratio ${derivative.longShortRatio.toFixed(2)}`)
  if(flow?.volumeChangePct!=null)evidence.push(`Volume ${flow.volumeChangePct>=0?"up":"down"} ${Math.abs(flow.volumeChangePct).toFixed(1)}%`)
  const available=[market,market.indicators,derivative,flow,ctx.historical,ctx.breadthScore,ctx.cycleScore].filter(x=>x!=null).length
  const total=7
  const completeness=Math.round(available/total*100)
  return {...base,score:mergedScore,signal,confidence,confluence:Math.round((base.confluence+tactical.confidence)/2),context:{derivatives:derivative??null,flow:flow??null,historical:ctx.historical??null},dataQuality:{available,total,completeness},evidence}
}
