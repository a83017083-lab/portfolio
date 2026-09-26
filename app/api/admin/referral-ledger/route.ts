import {NextResponse} from "next/server";
import crypto from "crypto";
import {isAuthed} from "../../../../lib/admin-guard";
import {readClients} from "../../../../lib/client-portal";
import {readLedger,LEDGER_KEY,minorOk,currencyOk,award,kvAppendUniqueLedger,type LedgerEntry} from "../../../../lib/referral-wallet";
import {audit} from "../../../../lib/audit";
const noStore={"Cache-Control":"private, no-store"};
export async function GET(){if(!isAuthed())return NextResponse.json({error:"Unauthorized"},{status:401});const [ledger,clients]=await Promise.all([readLedger(),readClients()]);if(!ledger.ok||!clients.ok)return NextResponse.json({error:"Storage unavailable"},{status:503});return NextResponse.json({entries:ledger.entries,clients:clients.clients.map(c=>({id:c.id,name:c.name,project:c.project}))},{headers:noStore});}
export async function POST(req:Request){if(!isAuthed())return NextResponse.json({error:"Unauthorized"},{status:401});const b=await req.json().catch(()=>null);if(!b||!(["earned","redeemed"] as unknown[]).includes(b.kind)||typeof b.clientId!=="string"||typeof b.invoiceRef!=="string"||!/^[-A-Za-z0-9_/]{3,80}$/.test(b.invoiceRef)||typeof b.note!=="string"||b.note.length>250||!currencyOk(b.currency))return NextResponse.json({error:"Invalid ledger entry"},{status:400});
 const [clients,ledger]=await Promise.all([readClients(),readLedger()]);if(!clients.ok||!ledger.ok)return NextResponse.json({error:"Storage unavailable"},{status:503});if(!clients.clients.some(c=>c.id===b.clientId))return NextResponse.json({error:"Referrer/client record not found"},{status:404});
 let record:LedgerEntry;
 if(b.kind==="earned"){
  if(typeof b.buyerId!=="string"||b.buyerId===b.clientId||!clients.clients.some(c=>c.id===b.buyerId)||!(["Starter","Growth","Custom"] as unknown[]).includes(b.plan)||!minorOk(b.planPriceMinor)||award(b.planPriceMinor).referrerCreditMinor===0)return NextResponse.json({error:"A distinct referred buyer, plan and agreed invoice price are required"},{status:400});
  const values=award(b.planPriceMinor);record={id:crypto.randomUUID(),clientId:b.clientId,buyerId:b.buyerId,kind:"earned",plan:b.plan,planPriceMinor:b.planPriceMinor,amountMinor:values.referrerCreditMinor,buyerDiscountMinor:values.buyerDiscountMinor,currency:b.currency,invoiceRef:b.invoiceRef,note:b.note.trim(),at:Date.now()};
 }else{
  if(!minorOk(b.amountMinor))return NextResponse.json({error:"Invalid redemption amount"},{status:400});
  const balance=ledger.entries.filter(e=>e.clientId===b.clientId&&e.currency===b.currency).reduce((n,e)=>n+(e.kind==="earned"?e.amountMinor:-e.amountMinor),0);
  if(b.amountMinor>balance)return NextResponse.json({error:"Not enough confirmed credit in this currency"},{status:400});
  record={id:crypto.randomUUID(),clientId:b.clientId,kind:"redeemed",amountMinor:b.amountMinor,currency:b.currency,invoiceRef:b.invoiceRef,note:b.note.trim(),at:Date.now()};
 }
 const added=await kvAppendUniqueLedger(LEDGER_KEY,record,500);if(added===null)return NextResponse.json({error:"Storage unavailable"},{status:503});if(!added)return NextResponse.json({error:"Duplicate invoice adjustment or ledger limit reached"},{status:409});await audit("referral-ledger",`Private ${record.kind} adjustment ${record.id.slice(0,8)}`);return NextResponse.json({ok:true,entry:record},{headers:noStore});
}
