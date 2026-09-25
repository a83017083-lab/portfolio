import { audit } from "../../../../lib/audit";
import { NextResponse } from "next/server";
import { isAuthed } from "../../../../lib/admin-guard";
import { kvGet,kvSet } from "../../../../lib/kv";
type Coupon={code:string;note:string;discount:string;enabled:boolean;expiresAt:string};
const KEY="admin:coupons:v1";
export async function GET(){if(!isAuthed())return NextResponse.json({error:"Unauthorized"},{status:401});return NextResponse.json({coupons:await kvGet<Coupon[]>(KEY)||[]});}
export async function PUT(req:Request){if(!isAuthed())return NextResponse.json({error:"Unauthorized"},{status:401});const body=await req.json().catch(()=>null);const coupons=body?.coupons;if(!Array.isArray(coupons)||coupons.length>100||coupons.some((c:Coupon)=>!c||typeof c.code!=="string"||! /^[A-Z0-9_-]{3,32}$/.test(c.code)||typeof c.note!=="string"||c.note.length>500||typeof c.discount!=="string"||c.discount.length>80||typeof c.enabled!=="boolean"||typeof c.expiresAt!=="string"|| (c.expiresAt!==""&&!/^\d{4}-\d{2}-\d{2}$/.test(c.expiresAt))))return NextResponse.json({error:"Invalid coupons"},{status:400});if(new Set(coupons.map((c:Coupon)=>c.code)).size!==coupons.length)return NextResponse.json({error:"Duplicate codes"},{status:400});if(!await kvSet(KEY,coupons))return NextResponse.json({error:"Storage unavailable"},{status:503});await audit("coupons", "Private coupon list saved");return NextResponse.json({ok:true});}
