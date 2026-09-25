import {NextResponse} from "next/server";
import {isAuthed} from "../../../../lib/admin-guard";
import {kvListResult} from "../../../../lib/kv";
import type {Inquiry} from "../../../../lib/mail";
export const dynamic="force-dynamic";
export async function GET(){
 if(!isAuthed())return NextResponse.json({error:"Unauthorized"},{status:401});
 const archive=await kvListResult<Inquiry>("inquiries",0,0);
 if(!archive.ok)return NextResponse.json({ok:false,storage:false,error:"Archive storage unavailable"},{status:503});
 return NextResponse.json({ok:true,storage:true},{headers:{"Cache-Control":"no-store"}});
}
