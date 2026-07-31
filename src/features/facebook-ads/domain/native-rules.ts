export type RuleMetric="spent"|"results"|"cost_per_result"|"website_purchase_roas"|"frequency";
export type RuleOperator="gt"|"gte"|"lt"|"lte";
export type RuleAction="notify"|"pause_campaign"|"unpause"|"pause_adset"|"increase_budget"|"decrease_budget";
export type NativeRuleDraft={name:string;entityType:"CAMPAIGN"|"ADSET";metric:RuleMetric;operator:RuleOperator;value:number;secondCondition?:{metric:RuleMetric;operator:RuleOperator;value:number};timePreset:"today"|"last_3d"|"last_7d"|"last_30d";action:RuleAction;adjustment?:{type:"PERCENT"|"ABSOLUTE";value:number}};
const operatorMap:Record<RuleOperator,string>={gt:"GREATER_THAN",gte:"GREATER_THAN_OR_EQUAL",lt:"LESS_THAN",lte:"LESS_THAN_OR_EQUAL"};
export function buildNativeRulePayload(draft:NativeRuleDraft){ const filters=[{field:draft.metric,operator:operatorMap[draft.operator],value:draft.value}]; if(draft.secondCondition)filters.push({field:draft.secondCondition.metric,operator:operatorMap[draft.secondCondition.operator],value:draft.secondCondition.value}); return {name:draft.name,entityType:draft.entityType,filters,timePreset:draft.timePreset,action:{type:draft.action,...draft.adjustment},scheduleType:"SEMI_HOURLY"}; }
