import { NextResponse } from "next/server";
import { kvGet,kvSet,kvLPushTrim } from "../../../lib/kv";
import crypto from "crypto";
export async function POST(req:Request){
 const body=await req.json().catch(()=>null);
 if(body?.company) return NextResponse.json({ok:true});
 const email=typeof body?.email==="string"?body.email.trim().toLowerCase():"";
 if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)||email.length>200||body?.consent!==true)return NextResponse.json({error:"Valid email and consent required"},{status:400});
 const key=`newsletter:subscriber:${crypto.createHash("sha256").update(email).digest("hex")}`;
 if(await kvGet(key))return NextResponse.json({ok:true});
 const record={email,joinedAt:Date.now(),consent:true};
 if(!await kvSet(key,record))return NextResponse.json({error:"Signup unavailable"},{status:503});
 if(!await kvLPushTrim("newsletter:subscribers",record,2000))return NextResponse.json({error:"Signup unavailable"},{status:503});
 return NextResponse.json({ok:true});
}
