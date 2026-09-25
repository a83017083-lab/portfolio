import { NextResponse } from "next/server";
import { isAuthed } from "../../../../lib/admin-guard";
import { kvGet } from "../../../../lib/kv";
export async function GET() {
  if (!isAuthed()) return NextResponse.json({error:"Unauthorized"},{status:401});
  const today=new Date();
  const days=Array.from({length:14},(_,i)=>new Date(today.getTime()-(13-i)*86400000).toISOString().slice(0,10));
  const counts=await Promise.all(days.map(day=>kvGet<number>(`stats:daily:${day}`)));
  const sources=["Direct","Google","Instagram","Other"];
  const refcounts=await Promise.all(sources.map(source=>kvGet<number>(`stats:source:${source}`)));
  return NextResponse.json({days:days.map((date,i)=>({date,views:counts[i]||0})),sources:sources.map((name,i)=>({name,views:refcounts[i]||0}))});
}
