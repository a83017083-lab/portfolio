import crypto from "crypto";
import { cookies } from "next/headers";
import { kvGet,kvSet } from "./kv";
export type ClientRecord={id:string;name:string;project:string;status:string;update:string;createdAt:number;tokenHash:string};
const KEY="clients:v1";
export async function listClients():Promise<ClientRecord[]>{return await kvGet<ClientRecord[]>(KEY)||[]}
export async function saveClients(records:ClientRecord[]){return kvSet(KEY,records)}
export const tokenHash=(code:string)=>crypto.createHash("sha256").update(code).digest("hex");
const secret=()=>process.env.ADMIN_PASSWORD||"";
export function makeClientCookie(id:string){const payload=Buffer.from(JSON.stringify({id,exp:Date.now()+86400000})).toString("base64url");const sig=crypto.createHmac("sha256",secret()).update(payload).digest("base64url");return `${payload}.${sig}`}
export function clientId(){if(!secret())return null;const raw=cookies().get("portfolio_client")?.value||"";const [payload,sig]=raw.split(".");if(!payload||!sig)return null;const expected=crypto.createHmac("sha256",secret()).update(payload).digest("base64url");const a=Buffer.from(sig),b=Buffer.from(expected);if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return null;try{const data=JSON.parse(Buffer.from(payload,"base64url").toString());return data.exp>Date.now()&&typeof data.id==="string"?data.id:null}catch{return null}}
