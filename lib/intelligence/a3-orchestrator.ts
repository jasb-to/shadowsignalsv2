import type { MarketState } from "@/lib/market-state/types"
import { runA3Engine, type A3EngineResult, type A3Factor } from "@/lib/intelligence/a3-engine"
import { scoreIntelligence } from "@/lib/intelligence/scoring"
import type { DerivativesSnapshot } from "@/lib/intelligence/derivatives"
import type { FlowSnapshot } from "@/lib/intelligence/flows"
import type { HistoricalIntelligence } from "@/lib/intelligence/historical"

export interface A3Context { derivatives?:DerivativesSnapshot|null; flow?:FlowSnapshot|null; historical?:HistoricalIntelligence|null; breadthScore?:number|null; cycleScore?:number|null; strategicScore?:number|null }
export interface A3Intelligence extends A3EngineResult { context:{derivatives:DerivativesSnapshot|null;flow:FlowSnapshot|null;historical:HistoricalIntelligence|null}; dataQuality:{available:number;total:number;completeness:number}; evidence:string[] }
const clamp=(n:number,min=-100,max=100)=>Math.max(min,Math.min(max,n))
const valid=(n:number|null|undefined)=>typeof n==="number"&&Number.isFinite(n)

export function buildA3Intelligence(market:MarketState,ctx:A3Context={}):A3Intelligence {
 const base=runA3Engine(market); const derivative=ctx.derivatives??null; const flow=ctx.flow??null
 const tactical=scoreIntelligence({trend:market.trend,rsi:market.indicators.rsi,macd:market.indicators.macd,macdSignal:market.indicators.macdSignal,fundingRate:derivative?.fundingRate,longShortRatio:derivative?.longShortRatio,volumePriceDivergence:flow?.volumePriceDivergence})
 const external:[string,number|undefined][]=[["breadth",ctx.breadthScore??undefined],["cycle",ctx.cycleScore??undefined],["strategic",ctx.strategicScore??undefined]]
 const availableExternal=external.filter(([,v])=>valid(v)).map(([,v])=>v as number)
 const contextualParts=[tactical.score*.4]
 if(valid(ctx.breadthScore))contextualParts.push(((ctx.breadthScore as number)-50)*.25)
 if(valid(ctx.cycleScore))contextualParts.push(((ctx.cycleScore as number)-50)*.2)
 if(valid(ctx.strategicScore))contextualParts.push(((ctx.strategicScore as number)-50)*.15)
 const contextual=clamp(contextualParts.reduce((a,b)=>a+b,0))
 const contextWeight=.35*Math.min(1,contextualParts.length/4)
 const mergedScore=Math.round(clamp(base.score*(1-contextWeight)+contextual*contextWeight))
 const signal=mergedScore>=35?"Buy":mergedScore<=-35?"Sell":"Hold"
 const completenessInputs=[market,market.indicators,derivative,flow,ctx.historical,ctx.breadthScore,ctx.cycleScore,ctx.strategicScore]
 const available=completenessInputs.filter(x=>x!=null).length; const total=completenessInputs.length; const completeness=Math.round(available/total*100)
 const confidenceBase=base.confidence*.65+tactical.confidence*.35; const confidence=Math.round(Math.max(40,Math.min(92,confidenceBase*(.75+.25*completeness/100))))
 const evidence=[...base.factors.filter((f:A3Factor)=>f.state!=="neutral").map((f:A3Factor)=>`${f.name}: ${f.state}`),...tactical.factors]
 if(derivative?.fundingRate!=null)evidence.push(`Funding ${derivative.fundingRate>0?"positive":"negative"}`)
 if(derivative?.longShortRatio!=null)evidence.push(`Long/short ratio ${derivative.longShortRatio.toFixed(2)}`)
 if(flow?.volumeChangePct!=null)evidence.push(`Volume ${flow.volumeChangePct>=0?"up":"down"} ${Math.abs(flow.volumeChangePct).toFixed(1)}%`)
 if(ctx.historical)evidence.push("Historical analogue available")
 if(valid(ctx.breadthScore))evidence.push(`Breadth score ${Math.round(ctx.breadthScore as number)}`)
 if(valid(ctx.cycleScore))evidence.push(`Cycle score ${Math.round(ctx.cycleScore as number)}`)
 if(valid(ctx.strategicScore))evidence.push(`Strategic score ${Math.round(ctx.strategicScore as number)}`)
 return {...base,score:mergedScore,signal,confidence,confluence:Math.round((base.confluence+tactical.confidence)/2),context:{derivatives:derivative,flow,historical:ctx.historical??null},dataQuality:{available,total,completeness},evidence}
}
