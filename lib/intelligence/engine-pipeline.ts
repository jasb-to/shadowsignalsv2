import type { MarketState } from "@/lib/market-state/types"
import { buildA3Intelligence, type A3Context, type A3Intelligence } from "./a3-orchestrator"
import { evaluateForecast, type Forecast, type Outcome } from "./calibration"
import { getCalibration } from "./forecast-store"
import { calibrateConfidence } from "./calibrated-confidence"
export interface A3ForecastRecord extends Forecast{engineScore:number;engineConfidence:number;scenario:string;regime:string;createdAt:number;calibratedConfidence?:number;calibrationSampleSize?:number}
export interface A3PipelineResult{intelligence:A3Intelligence;forecast:A3ForecastRecord}
export function runA3Pipeline(market:MarketState,context:A3Context={},horizon="1d"):A3PipelineResult{const intelligence=buildA3Intelligence(market,context);return{intelligence,forecast:{symbol:market.symbol,capturedAt:Date.now(),signal:intelligence.signal,confidence:intelligence.confidence,score:intelligence.score,horizon,engineScore:intelligence.score,engineConfidence:intelligence.confidence,scenario:intelligence.scenarios.slice().sort((a,b)=>b.probability-a.probability)[0]?.name??"base",regime:intelligence.regime,createdAt:Date.now()}}}
export async function runCalibratedA3Pipeline(market:MarketState,context:A3Context={},horizon="1d"):Promise<A3PipelineResult>{const result=runA3Pipeline(market,context,horizon);try{const bins=await getCalibration(market.symbol);const calibration=calibrateConfidence(result.forecast.confidence,bins);result.forecast.calibratedConfidence=calibration.calibrated;result.forecast.calibrationSampleSize=calibration.sampleSize;result.forecast.confidence=calibration.calibrated;result.intelligence={...result.intelligence,confidence:calibration.calibrated}}catch{ }return result}
export function resolveA3Forecast(forecast:A3ForecastRecord,actualReturnPct:number):Outcome{return evaluateForecast(forecast,actualReturnPct)}
