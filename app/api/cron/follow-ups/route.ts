import {NextResponse} from "next/server";
import nodemailer from "nodemailer";
import {kvReadResult,kvSet,kvListResult} from "../../../../lib/kv";
import type {Inquiry} from "../../../../lib/mail";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(req:Request){
 if(!process.env.CRON_SECRET||req.headers.get("authorization")!==`Bearer ${process.env.CRON_SECRET}`)return NextResponse.json({error:"Unauthorized"},{status:401});
 if(!process.env.GMAIL_USER||!process.env.GMAIL_APP_PASSWORD)return NextResponse.json({error:"Mail not configured"},{status:503});
 const today=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
 const key=`followup:sent:${today}`;const sent=await kvReadResult<boolean>(key);if(!sent.ok)return NextResponse.json({error:"Storage unavailable"},{status:503});if(sent.value)return NextResponse.json({skipped:"Already sent today"});
 const records=await kvListResult<Inquiry>("inquiries",0,199);if(!records.ok)return NextResponse.json({error:"Storage unavailable"},{status:503});
 const due=records.items.filter(i=>i.followUpAt&&i.followUpAt<=today&&!["won","lost"].includes(i.status||"new"));
 if(!due.length)return NextResponse.json({ok:true,due:0});
 const text=`Portfolio follow-ups due (${today})\n\n${due.map(i=>`- ${i.name} · ${i.projectType} · due ${i.followUpAt} · ${i.status||"new"}`).join("\n")}\n\nOpen the private admin panel for contact details and notes. This email contains no visitor messages.`;
 try{const transporter=nodemailer.createTransport({host:"smtp.gmail.com",port:465,secure:true,auth:{user:process.env.GMAIL_USER,pass:process.env.GMAIL_APP_PASSWORD}});await transporter.sendMail({from:`"Portfolio Site" <${process.env.GMAIL_USER}>`,to:process.env.GMAIL_USER,subject:`Portfolio follow-ups due - ${today}`,text});await kvSet(key,true);return NextResponse.json({ok:true,due:due.length})}catch(e){console.error("follow-up reminder failed",e);return NextResponse.json({error:"Mail failed"},{status:502})}
}
