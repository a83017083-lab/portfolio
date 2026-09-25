import {NextResponse} from "next/server";
import crypto from "crypto";
import {kvRateLimit,kvLPushTrim} from "../../../lib/kv";
export async function POST(req:Request){
 const ip=req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||"unknown";
 const key=`review:limit:${Math.floor(Date.now()/86400000)}:${crypto.createHash("sha256").update(ip).digest("hex")}`;
 const body=await req.json().catch(()=>null);
 if(body?.company)return NextResponse.json({ok:true});
 const name=typeof body?.name==="string"?body.name.trim():"";
 const email=typeof body?.email==="string"?body.email.trim().toLowerCase():"";
 const project=typeof body?.project==="string"?body.project.trim():"";
 const quote=typeof body?.quote==="string"?body.quote.trim():"";
 if(name.length<2||name.length>80||email.length>200||! /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)||project.length<2||project.length>120||quote.length<20||quote.length>1000||body?.consent!==true)return NextResponse.json({error:"Fill in the required fields and publication consent"},{status:400});
 const allowed=await kvRateLimit(key,3,86400);
 if(allowed===null)return NextResponse.json({error:"Review submission unavailable"},{status:503});
 if(!allowed)return NextResponse.json({error:"Too many submissions today"},{status:429});
 const record={id:crypto.randomUUID(),ts:Date.now(),name,email,project,quote,consent:true};
 if(!await kvLPushTrim("reviews:pending:v1",record,100))return NextResponse.json({error:"Submission unavailable; try again later"},{status:503});
 return NextResponse.json({ok:true});
}
