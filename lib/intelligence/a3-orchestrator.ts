import type { MarketState } from "@/lib/market-state/types"
import { runA3Engine, type A3EngineResult, type A3Factor } from "@/lib/intelligence/a3-engine"
import { scoreIntelligence } from "@/lib/intelligence/scoring"
import { runDivergenceEngine, type DivergenceResult } from "@/lib/intelligence/divergence-engine"
import { runCycleEngine, type CycleResult } from "@/lib/intelligence/cycle-engine"
import type { DerivativesSnapshot } from "@/lib/intelligence/derivatives"
import type { FlowSnapshot } from "@/lib/intelligence/flows"
import type { HistoricalIntelligence } from "@/lib/intelligence/historical"

export interface A3Context { derivatives?:DerivativesSnapshot|null; flow?:FlowSnapshot|null; historical?:HistoricalIntelligence|null; breadthScore?:number|null; cycleScore?:number|null; strategicScore?:number|null; cycle?:CycleResult|null; divergence?:DivergenceResult|null }
export interface A3Intelligence extends A3EngineResult { context:{derivatives:DerivativesSnapshot|null;flow:FlowSnapshot|null;historical:HistoricalIntelligence|null;cycle:CycleResult|null;divergence:DivergenceResult|null}; dataQuality:{available:number;total:number;completeness:number}; evidence:string[] }
const clamp=(n:number,min=-100,max=100)=>Math.max(min,Math.min(max,n));const valid=(n:number|null|undefined)=>typeof n==="number"&&Number.isFinite(n)
export function buildA3Intelligence(market:MarketState,ctx:A3Context={}):A3Intelligence {
 const base=runA3Engine(market), derivative=ctx.derivatives??null, flow=ctx.flow??null
 const tactical=scoreIntelligence({trend:market.trend,rsi:market.indicators.rsi,macd:market.indicators.macd,macdSignal:market.indicators.macdSignal,fundingRate:derivative?.fundingRate,longShortRatio:derivative?.longShortRatio,volumePriceDivergence:flow?.volumePriceDivergence})
 const divergence=ctx.divergence??null, cycle=ctx.cycle??null
 const parts=[tactical.score*.35]
 if(divergence)parts.push(divergence.score*.20)
 if(valid(ctx.breadthScore))parts.push(((ctx.breadthScore as number)-50)*.15)
 if(valid(ctx.cycleScore))parts.push(((ctx.cycleScore as number)-50)*.10)
 if(valid(ctx.strategicScore))parts.push(((ctx.strategicScore as number)-50)*.10)
 if(cycle)parts.push((cycle.score-50)*.10)
 const contextual=clamp(parts.reduce((a,b)=>a+b,0));const contextWeight=.35*Math.min(1,parts.length/6)
 const mergedScore=Math.round(clamp(base.score*(1-contextWeight)+contextual*contextWeight));const signal=mergedScore>=35?"Buy":mergedScore<=-35?"Sell":"Hold"
 const checks=[market,market.indicators,derivative,flow,ctx.historical,divergence,cycle,ctx.breadthScore,ctx.cycleScore,ctx.strategicScore];const available=checks.filter(x=>x!=null).length;const total=checks.length;const completeness=Math.round(available/total*100)
 const confidenceBase=base.confidence*.55+tactical.confidence*.25+(divergence?Math.min(95,50+Math.abs(divergence.score)*.4)*.10:0)+(cycle?Math.min(95,50+Math.abs(cycle.score-50)*.5)*.10:0);const confidence=Math.round(Math.max(40,Math.min(94,confidenceBase*(.72+.28*completeness/100))))
 const evidence=[...base.factors.filter((f:A3Factor)=>f.state!=="neutral").map((f:A3Factor)=>`${f.name}: ${f.state}`),...tactical.factors];if(divergence)evidence.push(...divergence.signals);if(cycle)evidence.push(...cycle.signals.map(s=>`Cycle: ${s}`));if(derivative?.fundingRate!=null)evidence.push(`Funding ${derivative.fundingRate>0?"positive":"negative"}`);if(derivative?.longShortRatio!=null)evidence.push(`Long/short ${derivative.longShortRatio.toFixed(2)}`);if(flow?.volumeChangePct!=null)evidence.push(`Volume ${flow.volumeChangePct>=0?"up":"down"} ${Math.abs(flow.volumeChangePct).toFixed(1)}%`);if(ctx.historical)evidence.push(`Historical analogue: ${ctx.historical.matches} matches`);if(valid(ctx.breadthScore))evidence.push(`Breadth ${Math.round(ctx.breadthScore as number)}`);if(valid(ctx.strategicScore))evidence.push(`Strategic ${Math.round(ctx.strategicScore as number)}`)
 return {...base,score:mergedScore,signal,confidence,confluence:Math.round((base.confluence+tactical.confidence+(divergence?Math.abs(divergence.score):0))/3),context:{derivatives:derivative,flow,historical:ctx.historical??null,cycle,divergence},dataQuality:{available,total,completeness},evidence}
}
