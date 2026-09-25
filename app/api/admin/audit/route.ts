import {NextResponse} from "next/server";
import {isAuthed} from "../../../../lib/admin-guard";
import {getAudit} from "../../../../lib/audit";
export async function GET(){if(!isAuthed())return NextResponse.json({error:"Unauthorized"},{status:401});return NextResponse.json({events:await getAudit()})}
