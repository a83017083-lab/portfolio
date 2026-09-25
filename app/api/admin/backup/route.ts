import {NextResponse} from "next/server";
import {isAuthed} from "../../../../lib/admin-guard";
import {kvListResult,kvReadResult,kvConfigured} from "../../../../lib/kv";
import type {Inquiry} from "../../../../lib/mail";
import {DEFAULT_CONTENT,DEFAULT_CHATBOT} from "../../../../lib/content";
import type {SiteContent,ChatbotSettings} from "../../../../lib/content";
import type {AuditEvent} from "../../../../lib/audit";
export async function GET(){
 if(!isAuthed())return NextResponse.json({error:"Unauthorized"},{status:401});
 if(!kvConfigured())return NextResponse.json({error:"Storage unavailable"},{status:503});
 const [content,chatbot,inquiries,subscribers,coupons,audit,clients,reviews]=await Promise.all([
  kvReadResult<SiteContent>("content:v1"),kvReadResult<ChatbotSettings>("chatbot:settings:v1"),
  kvListResult<Inquiry>("inquiries",0,199),kvListResult("newsletter:subscribers",0,1999),
  kvReadResult("admin:coupons:v1"),kvListResult<AuditEvent>("admin:audit:v1",0,199),
  kvReadResult<{id:string;tokenHash:string}[]>("clients:v1"),kvListResult("reviews:pending:v1",0,99)
 ]);
 if(!content.ok||!chatbot.ok||!inquiries.ok||!subscribers.ok||!coupons.ok||!audit.ok||!clients.ok||(clients.value!==null&&!Array.isArray(clients.value))||!reviews.ok)return NextResponse.json({error:"Storage read failed; no incomplete backup generated"},{status:503});
 const backup={exportedAt:new Date().toISOString(),schema:"portfolio-backup-v1",note:"Export snapshot only. Restore is not implemented. Client access-code hashes are omitted; client logins must be reissued separately if storage is lost.",content:content.value||DEFAULT_CONTENT,chatbot:chatbot.value||DEFAULT_CHATBOT,inquiries:inquiries.items,subscribers:subscribers.items,coupons:coupons.value,audit:audit.items,clients:(clients.value||[]).map(({tokenHash,...c})=>c),pendingReviews:reviews.items};
 return new NextResponse(JSON.stringify(backup,null,2),{headers:{"Content-Type":"application/json; charset=utf-8","Content-Disposition":"attachment; filename=portfolio-backup.json","X-Content-Type-Options":"nosniff","Cache-Control":"private, no-store"}})
}
