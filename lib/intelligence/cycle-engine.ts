export type CyclePhase="bear_market"|"accumulation"|"early_bull"|"bull_expansion"|"distribution"
export interface CycleInput{price:number;ath:number;athDate?:string|null;drawdownPct?:number|null;monthsFromHalving?:number|null;rsi?:number|null;btcDominance?:number|null;ethBtc?:number|null}
export interface CycleResult{phase:CyclePhase;score:number;bottomProbability:number;topProbability:number;bearMarketEnd:string;nextBullTop:string;signals:string[]}
const clamp=(n:number,a=0,b=100)=>Math.max(a,Math.min(b,n))
export function runCycleEngine(i:CycleInput):CycleResult{
 const dd=i.drawdownPct??(i.ath>0?(i.price/i.ath-1)*100:0);let score=50;const signals:string[]=[]
 if(dd<=-70){score-=32;signals.push("deep ATH drawdown")}else if(dd<=-55){score-=24;signals.push("severe ATH drawdown")}else if(dd<=-40){score-=14;signals.push("material ATH drawdown")}else if(dd>=-12){score+=22;signals.push("near cycle highs")}
 if(i.rsi!=null){if(i.rsi<30){score-=18;signals.push("oversold momentum")}else if(i.rsi<40){score-=8;signals.push("weak momentum")}else if(i.rsi>75){score+=18;signals.push("extreme momentum")}else if(i.rsi>68){score+=9;signals.push("elevated momentum")}
 if(i.btcDominance!=null){if(i.btcDominance>62){score-=4;signals.push("BTC dominance elevated")}else if(i.btcDominance<50){score+=8;signals.push("lower BTC dominance")}}
 if(i.ethBtc!=null){if(i.ethBtc<0.035){score-=3;signals.push("ETH/BTC depressed")}else if(i.ethBtc>0.06){score+=7;signals.push("ETH/BTC strong")}}
 if(i.monthsFromHalving!=null){if(i.monthsFromHalving>=16&&i.monthsFromHalving<=24){score+=12;signals.push("historical late-cycle window")}else if(i.monthsFromHalving>=28){score-=10;signals.push("extended post-halving cycle")}}
 score=clamp(score,0,100)
 const phase:CyclePhase=score<25?"bear_market":score<43?"accumulation":score<60?"early_bull":score<80?"bull_expansion":"distribution"
 const bottomProbability=clamp(phase==="bear_market"?Math.max(45,70-score):phase==="accumulation"?55+Math.max(0,(45-score)*.8):phase==="early_bull"?25:10)
 const topProbability=clamp(phase==="distribution"?75+Math.max(0,(score-80)*1.2):phase==="bull_expansion"?30+Math.max(0,(score-60)*.7):10)
 const bearMarketEnd=phase==="bear_market"?"Bear market remains active; require capitulation/recovery confirmation":phase==="accumulation"?"Accumulation phase; require structural recovery confirmation":"Bear-market phase likely complete"
 const nextBullTop=topProbability>=60?"Cycle-top conditions developing":"Not a cycle-top regime"
 return{phase,score:Math.round(score),bottomProbability:Math.round(bottomProbability),topProbability:Math.round(topProbability),bearMarketEnd,nextBullTop,signals}
}
