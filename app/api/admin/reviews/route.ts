import {NextResponse} from "next/server";
import {isAuthed} from "../../../../lib/admin-guard";
import {kvListResult,kvRemoveListRecord} from "../../../../lib/kv";
import {audit} from "../../../../lib/audit";
const KEY="reviews:pending:v1";
type Review={id:string;ts:number;name:string;email:string;project:string;quote:string;consent:boolean};
export async function GET(){if(!isAuthed())return NextResponse.json({error:"Unauthorized"},{status:401});const r=await kvListResult<Review>(KEY,0,99);if(!r.ok)return NextResponse.json({error:"Storage unavailable"},{status:503});return NextResponse.json({reviews:r.items},{headers:{"Cache-Control":"no-store"}})}
export async function DELETE(req:Request){if(!isAuthed())return NextResponse.json({error:"Unauthorized"},{status:401});const body=await req.json().catch(()=>null);if(typeof body?.id!=="string"||! /^[a-f0-9-]{36}$/.test(body.id))return NextResponse.json({error:"Invalid review ID"},{status:400});const removed=await kvRemoveListRecord(KEY,"id",body.id);if(removed===null)return NextResponse.json({error:"Storage unavailable"},{status:503});if(!removed)return NextResponse.json({error:"Review not found"},{status:404});await audit("review-delete","Pending review removed");return NextResponse.json({ok:true})}
