import {NextResponse} from "next/server";
import {isAuthed} from "../../../../lib/admin-guard";
import {kvReadResult,kvSet} from "../../../../lib/kv";
import {audit} from "../../../../lib/audit";
const KEY="admin:referral-notes:v1";
const noStore={"Cache-Control":"private, no-store"};
type Referral={id:string;reference:string;note:string;stage:"idea"|"contacted"|"qualified"|"closed";createdAt:number};
export async function GET(){if(!isAuthed())return NextResponse.json({error:"Unauthorized"},{status:401});const result=await kvReadResult<Referral[]>(KEY);if(!result.ok)return NextResponse.json({error:"Storage unavailable"},{status:503});return NextResponse.json({referrals:Array.isArray(result.value)?result.value:[]},{headers:noStore});}
export async function PUT(req:Request){if(!isAuthed())return NextResponse.json({error:"Unauthorized"},{status:401});const data=await req.json().catch(()=>null);const items=data?.referrals;if(!Array.isArray(items)||items.length>100||items.some((x:Referral)=>!x||typeof x.id!=="string"||!/^[-a-f0-9]{36}$/.test(x.id)||typeof x.reference!=="string"||x.reference.length<2||x.reference.length>100||typeof x.note!=="string"||x.note.length>1000||!(["idea","contacted","qualified","closed"] as unknown[]).includes(x.stage)||!Number.isSafeInteger(x.createdAt)||x.createdAt<0)||new Set(items.map((x:Referral)=>x.id)).size!==items.length)return NextResponse.json({error:"Invalid referrals"},{status:400});if(!await kvSet(KEY,items))return NextResponse.json({error:"Storage unavailable"},{status:503});await audit("referral-notes",`Private referral notes saved (${items.length} records)`);return NextResponse.json({ok:true},{headers:noStore});}
