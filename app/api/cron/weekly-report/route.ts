import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { kvReadResult, kvSet, kvListResult } from "../../../../lib/kv";
import { getStats } from "../../../../lib/chatlog";
import type { Inquiry } from "../../../../lib/mail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!process.env.CRON_SECRET || req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({error:"Unauthorized"},{status:401});
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return NextResponse.json({error:"Mail not configured"},{status:503});
  const today = new Date();
  const day = new Intl.DateTimeFormat("en-US", {timeZone:"Asia/Kolkata",weekday:"short"}).format(today);
  if (day !== "Mon") return NextResponse.json({skipped:"Not Monday in India"});
  const dayKey = new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(today);
  const sentKey = `weekly-report:sent:${dayKey}`;
  const sent=await kvReadResult<boolean>(sentKey);if(!sent.ok)return NextResponse.json({error:"Storage unavailable"},{status:503});if(sent.value)return NextResponse.json({skipped:"Already sent this week"});
  const records=await kvListResult<Inquiry>("inquiries",0,199);if(!records.ok)return NextResponse.json({error:"Storage unavailable"},{status:503});const inquiries=records.items;
  const weekAgo = today.getTime() - 7*86400000;
  const weekly = inquiries.filter(i => i.ts >= weekAgo);
  const due = inquiries.filter(i => i.followUpAt && i.followUpAt <= dayKey && !["won","lost"].includes(i.status || "new"));
  const stats = await getStats();
  const text = `Portfolio weekly snapshot - ${dayKey}\n\nNew inquiries this week: ${weekly.length}\nHot leads this week: ${weekly.filter(i => i.score === "hot").length}\nFollow-ups due: ${due.length}\nTotal page views: ${stats.pageviews}\nUnique visitors (cumulative): ${stats.visitors}\n\nSee the admin panel for details. Page views and visitors are lifetime totals, not weekly figures.`;
  try {
    const transporter = nodemailer.createTransport({host:"smtp.gmail.com",port:465,secure:true,auth:{user:process.env.GMAIL_USER,pass:process.env.GMAIL_APP_PASSWORD}});
    await transporter.sendMail({from:`"Portfolio Site" <${process.env.GMAIL_USER}>`,to:process.env.GMAIL_USER,subject:`Portfolio weekly report - ${dayKey}`,text});
    const marked=await kvSet(sentKey,true);
    if(!marked)return NextResponse.json({ok:true,week:dayKey,warning:"Email sent, but deduplication could not be saved. A later retry may send another copy."});
    return NextResponse.json({ok:true,week:dayKey});
  } catch(e) { console.error("Weekly report failed",e); return NextResponse.json({error:"Mail failed"},{status:502}); }
}
