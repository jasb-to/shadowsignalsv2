import type { MarketState } from "@/lib/market-state/types"
import { runA3Engine, type A3EngineResult, type A3Factor } from "@/lib/intelligence/a3-engine"
import { scoreIntelligence } from "@/lib/intelligence/scoring"
import type { DivergenceResult } from "@/lib/intelligence/divergence-engine"
import type { CycleResult } from "@/lib/intelligence/cycle-engine"
import type { DerivativesResult } from "@/lib/intelligence/derivatives-engine"
import type { DerivativesSnapshot } from "@/lib/intelligence/derivatives"
import type { FlowSnapshot } from "@/lib/intelligence/flows"
import type { HistoricalIntelligence } from "@/lib/intelligence/historical"
import type { RegimeTransition } from "@/lib/intelligence/regime-transition"
import type { CrossAssetResult } from "@/lib/intelligence/cross-asset"

export interface A3Context { derivatives?:DerivativesSnapshot|null;derivativesResult?:DerivativesResult|null;flow?:FlowSnapshot|null;historical?:HistoricalIntelligence|null;crossAsset?:CrossAssetResult|null;breadthScore?:number|null;cycleScore?:number|null;strategicScore?:number|null;flowScore?:number|null;transitionScore?:number|null;cycle?:CycleResult|null;divergence?:DivergenceResult|null;transition?:RegimeTransition|null }
export interface A3Intelligence extends A3EngineResult { context:{derivatives:DerivativesSnapshot|null;derivativesResult:DerivativesResult|null;flow:FlowSnapshot|null;historical:HistoricalIntelligence|null;crossAsset:CrossAssetResult|null;cycle:CycleResult|null;divergence:DivergenceResult|null;transition:RegimeTransition|null}; dataQuality:{available:number;total:number;completeness:number}; evidence:string[] }
const clamp=(n:number,min=-100,max=100)=>Math.max(min,Math.min(max,n));const valid=(n:number|null|undefined)=>typeof n==="number"&&Number.isFinite(n)
export function buildA3Intelligence(market:MarketState,ctx:A3Context={}):A3Intelligence {
 const base=runA3Engine(market), derivative=ctx.derivatives??null, derivativeResult=ctx.derivativesResult??null, flow=ctx.flow??null, crossAsset=ctx.crossAsset??null
 const tactical=scoreIntelligence({trend:market.trend,rsi:market.indicators.rsi,macd:market.indicators.macd,macdSignal:market.indicators.macdSignal,fundingRate:derivative?.fundingRate,longShortRatio:derivative?.longShortRatio,volumePriceDivergence:flow?.volumePriceDivergence})
 const divergence=ctx.divergence??null, cycle=ctx.cycle??null, transition=ctx.transition??null
 const parts=[tactical.score*.25]
 if(derivativeResult)parts.push(derivativeResult.score*.12)
 if(divergence)parts.push(divergence.score*.12)
 if(crossAsset)parts.push(crossAsset.score*.12)
 if(valid(ctx.flowScore))parts.push(((ctx.flowScore as number)-50)*.12)
 if(valid(ctx.breadthScore))parts.push(((ctx.breadthScore as number)-50)*.08)
 if(valid(ctx.cycleScore))parts.push(((ctx.cycleScore as number)-50)*.08)
 if(valid(ctx.strategicScore))parts.push(((ctx.strategicScore as number)-50)*.06)
 if(valid(ctx.transitionScore))parts.push(((ctx.transitionScore as number)-50)*.05)
 const contextual=clamp(parts.reduce((a,b)=>a+b,0));const contextWeight=.50*Math.min(1,parts.length/9)
 const mergedScore=Math.round(clamp(base.score*(1-contextWeight)+contextual*contextWeight));const signal=mergedScore>=35?"Buy":mergedScore<=-35?"Sell":"Hold"
 const checks=[market,market.indicators,derivative,derivativeResult,flow,ctx.historical,crossAsset,divergence,cycle,transition,ctx.breadthScore,ctx.cycleScore,ctx.strategicScore,ctx.flowScore,ctx.transitionScore];const available=checks.filter(x=>x!=null).length;const total=checks.length;const completeness=Math.round(available/total*100)
 const confidenceBase=base.confidence*.42+tactical.confidence*.22+(derivativeResult?Math.min(95,50+Math.abs(derivativeResult.score)*.35)*.08:0)+(crossAsset?Math.min(95,50+Math.abs(crossAsset.score)*.35)*.07:0)+(divergence?Math.min(95,50+Math.abs(divergence.score)*.4)*.07:0)+(cycle?Math.min(95,50+Math.abs(cycle.score-50)*.5)*.07:0)+(transition?transition.confidence*.07:0);const confidence=Math.round(Math.max(40,Math.min(94,confidenceBase*(.72+.28*completeness/100))))
 const evidence=[...base.factors.filter((f:A3Factor)=>f.state!=="neutral").map((f:A3Factor)=>`${f.name}: ${f.state}`),...tactical.factors];if(derivativeResult)evidence.push(...derivativeResult.signals);if(crossAsset)evidence.push(...crossAsset.signals);if(divergence)evidence.push(...divergence.signals);if(cycle)evidence.push(...cycle.signals.map(s=>`Cycle: ${s}`));if(transition)evidence.push(...transition.signals.map(s=>`Transition: ${s}`));if(derivative?.fundingRate!=null)evidence.push(`Funding ${derivative.fundingRate>0?"positive":"negative"}`);if(derivative?.longShortRatio!=null)evidence.push(`Long/short ${derivative.longShortRatio.toFixed(2)}`);if(flow?.volumeChangePct!=null)evidence.push(`Volume ${flow.volumeChangePct>=0?"up":"down"} ${Math.abs(flow.volumeChangePct).toFixed(1)}%`);if(ctx.historical)evidence.push(`Historical analogue: ${ctx.historical.matches} matches`);if(valid(ctx.breadthScore))evidence.push(`Breadth ${Math.round(ctx.breadthScore as number)}`);if(valid(ctx.strategicScore))evidence.push(`Strategic ${Math.round(ctx.strategicScore as number)}`)
 const confluenceInputs=[base.confluence,tactical.confidence,derivativeResult?50+derivativeResult.score:50,crossAsset?50+crossAsset.score:50,divergence?50+divergence.score:50,ctx.flowScore??50,ctx.transitionScore??50];const confluence=Math.round(confluenceInputs.reduce((a,b)=>a+b,0)/confluenceInputs.length)
 return {...base,score:mergedScore,signal,confidence,confluence,context:{derivatives:derivative,derivativesResult:derivativeResult,flow,historical:ctx.historical??null,crossAsset,cycle,divergence,transition},dataQuality:{available,total,completeness},evidence}
}
