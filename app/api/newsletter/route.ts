import {NextResponse} from "next/server";
import {kvAddUniqueEmail,kvRateLimit} from "../../../lib/kv";
import crypto from "crypto";
export async function POST(req:Request){
 const ip=req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||"unknown";
 const key=`newsletter:limit:${Math.floor(Date.now()/86400000)}:${crypto.createHash("sha256").update(ip).digest("hex")}`;
 const allowed=await kvRateLimit(key,10,86400);
 if(allowed===null)return NextResponse.json({error:"Signup unavailable"},{status:503});
 if(!allowed)return NextResponse.json({error:"Too many attempts"},{status:429});
 const body=await req.json().catch(()=>null);
 if(body?.company)return NextResponse.json({ok:true});
 const email=typeof body?.email==="string"?body.email.trim().toLowerCase():"";
 if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)||email.length>200||body?.consent!==true)return NextResponse.json({error:"Valid email and consent required"},{status:400});
 const record={email,joinedAt:Date.now(),consent:true};
 const added=await kvAddUniqueEmail("newsletter:subscribers",email,record,2000);
 if(added===null)return NextResponse.json({error:"Signup unavailable"},{status:503});
 return NextResponse.json({ok:true});
}
