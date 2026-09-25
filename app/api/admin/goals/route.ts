import {NextResponse} from "next/server";
import {isAuthed} from "../../../../lib/admin-guard";
import {kvReadResult,kvSet} from "../../../../lib/kv";
import {audit} from "../../../../lib/audit";

const monthOk=(month:unknown):month is string => typeof month==="string"&&/^\d{4}-(0[1-9]|1[0-2])$/.test(month)&&Number(month.slice(0,4))>=2020&&Number(month.slice(0,4))<=2100;
const key=(month:string)=>`admin:lead-goal:${month}`;
export async function GET(req:Request){
 if(!isAuthed())return NextResponse.json({error:"Unauthorized"},{status:401});
 const month=new URL(req.url).searchParams.get("month");
 if(!monthOk(month))return NextResponse.json({error:"Invalid month"},{status:400});
 const result=await kvReadResult<number>(key(month));
 if(!result.ok)return NextResponse.json({error:"Storage unavailable"},{status:503});
 const target=result.value;
 if(target!==null&&(!Number.isSafeInteger(target)||target<0||target>100000))return NextResponse.json({error:"Goal data invalid"},{status:503});
 return NextResponse.json({target},{headers:{"Cache-Control":"no-store"}});
}
export async function PUT(req:Request){
 if(!isAuthed())return NextResponse.json({error:"Unauthorized"},{status:401});
 const body=await req.json().catch(()=>null);
 const month=body?.month,target=body?.target;
 if(!monthOk(month)||!Number.isSafeInteger(target)||target<0||target>100000)return NextResponse.json({error:"Invalid goal"},{status:400});
 if(!await kvSet(key(month),target))return NextResponse.json({error:"Storage unavailable"},{status:503});
 await audit("lead-goal",`Monthly inquiry target saved for ${month}`);
 return NextResponse.json({ok:true,target});
}
