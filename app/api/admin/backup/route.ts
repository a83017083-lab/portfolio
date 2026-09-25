import {NextResponse} from "next/server";
import {isAuthed} from "../../../../lib/admin-guard";
import {getContent,getChatbotSettings} from "../../../../lib/content";
import {kvLRange,kvGet} from "../../../../lib/kv";
import {getAudit} from "../../../../lib/audit";
import type {Inquiry} from "../../../../lib/mail";
export async function GET(){
 if(!isAuthed())return NextResponse.json({error:"Unauthorized"},{status:401});
 const [content,chatbot,inquiries,subscribers,coupons,audit]=await Promise.all([getContent(),getChatbotSettings(),kvLRange<Inquiry>("inquiries",0,199),kvLRange("newsletter:subscribers",0,1999),kvGet("admin:coupons:v1"),getAudit()]);
 const backup={exportedAt:new Date().toISOString(),schema:"portfolio-backup-v1",content,chatbot,inquiries,subscribers,coupons,audit};
 return new NextResponse(JSON.stringify(backup,null,2),{headers:{"Content-Type":"application/json; charset=utf-8","Content-Disposition":"attachment; filename=portfolio-backup.json","Cache-Control":"private, no-store"}})
}
