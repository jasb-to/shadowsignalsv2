export type CyclePhase="bear_market"|"accumulation"|"early_bull"|"bull_expansion"|"distribution"
export interface CycleInput{price:number;ath:number;athDate?:string|null;drawdownPct?:number|null;monthsFromHalving?:number|null;rsi?:number|null;btcDominance?:number|null;ethBtc?:number|null}
export interface CycleResult{phase:CyclePhase;score:number;bottomProbability:number;topProbability:number;bearMarketEnd:string;nextBullTop:string;signals:string[]}
const clamp=(n:number,a=0,b=100)=>Math.max(a,Math.min(b,n))
export function runCycleEngine(i:CycleInput):CycleResult{
 const dd=i.drawdownPct??(i.ath>0?(i.price/i.ath-1)*100:0);let score=50;const signals:string[]=[]
 if(dd<=-70){score-=35;signals.push("deep ATH drawdown") } else if(dd<=-45){score-=20;signals.push("material ATH drawdown")} else if(dd>=-15){score+=25;signals.push("near cycle highs")}
 if(i.rsi!=null){if(i.rsi<35){score-=15;signals.push("weak momentum")}if(i.rsi>70){score+=15;signals.push("elevated momentum")}}
 if(i.btcDominance!=null){if(i.btcDominance>60){signals.push("BTC dominance elevated")}else if(i.btcDominance<50){score+=8;signals.push("lower BTC dominance")}}
 const phase:CyclePhase=score<25?"bear_market":score<42?"accumulation":score<58?"early_bull":score<78?"bull_expansion":"distribution"
 const bottomProbability=clamp(phase==="bear_market"?70-score:phase==="accumulation"?55:20)
 const topProbability=clamp(phase==="distribution"?75:phase==="bull_expansion"?35:10)
 const bearMarketEnd=phase==="bear_market"||phase==="accumulation"?"Accumulation/bear-end confirmation required":"Bear-market phase likely complete"
 const nextBullTop=topProbability>60?"Cycle-top conditions developing":"Not a cycle-top regime"
 return{phase,score:Math.round(score),bottomProbability:Math.round(bottomProbability),topProbability:Math.round(topProbability),bearMarketEnd,nextBullTop,signals}
}
