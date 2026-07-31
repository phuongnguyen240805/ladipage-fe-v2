export type PlanName = "BASIC"|"STARTER"|"STANDARD"|"ADVANCED"|"BUSINESS"|"ENTERPRISE";
const ranks: PlanName[]=["BASIC","STARTER","STANDARD","ADVANCED","BUSINESS","ENTERPRISE"];
export function normalizePlan(plan?: string, days?: number): PlanName { if(!plan||plan==="BASIC")return "BASIC"; if(ranks.includes(plan as PlanName))return plan as PlanName; const value=days??0; return value<=30?"STARTER":value<=90?"STANDARD":value<=180?"ADVANCED":value<=365?"BUSINESS":"ENTERPRISE"; }
export function isPlanActive(user?:{plan?:string;planExpiry?:string}){ if(!user?.plan||user.plan==="BASIC")return false; return user.planExpiry?new Date(user.planExpiry)>new Date():true; }
export function hasPlan(user: {plan?:string;planExpiry?:string}|undefined, minimum: PlanName){ return isPlanActive(user)&&ranks.indexOf(normalizePlan(user?.plan))>=ranks.indexOf(minimum); }
