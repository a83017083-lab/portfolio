import {NextResponse} from "next/server";
import {isAuthed} from "../../../../lib/admin-guard";
import {listConversations,getConversation} from "../../../../lib/chatlog";
export async function GET(){if(!isAuthed())return NextResponse.json({error:"Unauthorized"},{status:401});const convs=(await listConversations()).slice(0,40);const messages=await Promise.all(convs.map(c=>getConversation(c.sid)));const questions=messages.flat().filter(m=>m.role==="user").map(m=>({text:m.text.slice(0,300),ts:m.ts})).sort((a,b)=>b.ts-a.ts).slice(0,100);return NextResponse.json({questions,coverage:"Most recent 40 conversations; recent 100 questions"})}
