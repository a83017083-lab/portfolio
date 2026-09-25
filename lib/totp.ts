// Admin two-factor state: fail closed if Redis is unavailable.
import {generateSecret,generateURI,verifySync} from "otplib";
import {kvReadResult,kvSet} from "./kv";
const KEY="admin:totp:v1";
const PENDING="admin:totp:pending:v1";
export interface TotpRecord{secret:string;enrolledAt:number}
export async function totpEnrollmentState():Promise<{ok:boolean;record:TotpRecord|null}>{
 const r=await kvReadResult<TotpRecord>(KEY);
 return {ok:r.ok,record:r.value?.secret?r.value:null};
}
export async function getOrCreatePending():Promise<string|null>{
 const r=await kvReadResult<{secret:string;exp:number}>(PENDING);
 if(!r.ok)return null;
 if(r.value?.secret&&r.value.exp>Date.now())return r.value.secret;
 const secret=generateSecret();
 return await kvSet(PENDING,{secret,exp:Date.now()+15*60*1000})?secret:null;
}
export function verifyTotp(secret:string,code:string):boolean{
 try{const r=verifySync({token:code.replace(/\s/g,""),secret,epochTolerance:30});return Boolean(r?.valid)}catch{return false}
}
export async function enrollPending(secret:string):Promise<boolean>{
 if(!await kvSet(KEY,{secret,enrolledAt:Date.now()} satisfies TotpRecord))return false;
 await kvSet(PENDING,null);return true;
}
export function totpUri(secret:string){const issuer="Build With Abhinav",account="admin";return {uri:generateURI({secret,issuer,label:account}),issuer,account}}
