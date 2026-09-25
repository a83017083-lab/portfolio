import { NextResponse } from "next/server";
import { isAuthed } from "../../../../lib/admin-guard";
import { kvListResult,kvRemoveListRecord } from "../../../../lib/kv";
type Subscriber={email:string;joinedAt:number;consent:boolean};
export async function GET(){if(!isAuthed())return NextResponse.json({error:"Unauthorized"},{status:401});const result=await kvListResult<Subscriber>("newsletter:subscribers",0,1999);if(!result.ok)return NextResponse.json({error:"Storage unavailable"},{status:503});return NextResponse.json({subscribers:result.items},{headers:{"Cache-Control":"no-store"}});}
export async function DELETE(req:Request){if(!isAuthed())return NextResponse.json({error:"Unauthorized"},{status:401});const body=await req.json().catch(()=>null);const email=body?.email;if(typeof email!=="string")return NextResponse.json({error:"Bad email"},{status:400});const removed=await kvRemoveListRecord("newsletter:subscribers","email",email.toLowerCase().trim());if(removed===null)return NextResponse.json({error:"Storage failure"},{status:503});if(!removed)return NextResponse.json({error:"Not found"},{status:404});return NextResponse.json({ok:true});}
