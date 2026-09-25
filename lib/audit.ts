import { kvLPushTrim,kvLRange } from "./kv";
export type AuditEvent={at:number;action:string;detail:string};
export async function audit(action:string,detail:string){await kvLPushTrim("admin:audit:v1",{at:Date.now(),action:action.slice(0,80),detail:detail.slice(0,180)} satisfies AuditEvent,200)}
export async function getAudit(){return kvLRange<AuditEvent>("admin:audit:v1",0,199)}
