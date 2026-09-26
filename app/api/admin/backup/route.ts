import {NextResponse} from "next/server";
import {isAuthed} from "../../../../lib/admin-guard";
import {kvListResult,kvReadResult,kvConfigured} from "../../../../lib/kv";
import type {Inquiry} from "../../../../lib/mail";
import {DEFAULT_CONTENT,DEFAULT_CHATBOT} from "../../../../lib/content";
import type {SiteContent,ChatbotSettings} from "../../../../lib/content";
import type {AuditEvent} from "../../../../lib/audit";
import {readAuthAccounts} from "../../../../lib/client-auth";
import {readLedger} from "../../../../lib/referral-wallet";
export async function GET(){
 if(!isAuthed())return NextResponse.json({error:"Unauthorized"},{status:401});
 if(!kvConfigured())return NextResponse.json({error:"Storage unavailable"},{status:503});
 const [content,chatbot,inquiries,subscribers,coupons,audit,clients,reviews,integrations,ledger,authAccounts]=await Promise.all([
  kvReadResult<SiteContent>("content:v1"),kvReadResult<ChatbotSettings>("chatbot:settings:v1"),
  kvListResult<Inquiry>("inquiries",0,199),kvListResult("newsletter:subscribers",0,1999),
  kvReadResult("admin:coupons:v1"),kvListResult<AuditEvent>("admin:audit:v1",0,199),
  kvReadResult<{id:string;tokenHash:string}[]>("clients:v1"),kvListResult("reviews:pending:v1",0,99),kvReadResult<{n8nWebhookUrl?:string}>("integrations:v1"),readLedger(),readAuthAccounts()
 ]);
 if(!content.ok||!chatbot.ok||!inquiries.ok||!subscribers.ok||!coupons.ok||!audit.ok||!clients.ok||(clients.value!==null&&!Array.isArray(clients.value))||!reviews.ok||!integrations.ok||!ledger.ok||!authAccounts.ok)return NextResponse.json({error:"Storage read failed; no incomplete backup generated"},{status:503});
 const backup={exportedAt:new Date().toISOString(),schema:"portfolio-backup-v3",note:"Export snapshot only. Restore is not implemented. Referral invoice records and account emails are sensitive and included; store this file securely. Account metadata is included, but password hashes and email sign-in secrets are omitted; password users must reset access after storage loss. Client access-code hashes are omitted; client logins must be reissued separately if storage is lost.",content:content.value||DEFAULT_CONTENT,chatbot:chatbot.value||DEFAULT_CHATBOT,inquiries:inquiries.items,subscribers:subscribers.items,coupons:coupons.value,audit:audit.items,clients:(clients.value||[]).map(({tokenHash,...c})=>c),pendingReviews:reviews.items,referralLedger:ledger.entries,authAccounts:authAccounts.accounts.map(({passwordHash,...a})=>a),n8nWebhookUrl:integrations.value?.n8nWebhookUrl||""};
 return new NextResponse(JSON.stringify(backup,null,2),{headers:{"Content-Type":"application/json; charset=utf-8","Content-Disposition":"attachment; filename=portfolio-backup.json","X-Content-Type-Options":"nosniff","Cache-Control":"private, no-store"}})
}
