import {audit} from "../../../../lib/audit";
import { NextResponse } from "next/server";
import { isAuthed } from "../../../../lib/admin-guard";
import { kvListResult, kvPatchListRecord, kvRemoveListRecord, kvConfigured } from "../../../../lib/kv";
import type { Inquiry } from "../../../../lib/mail";

async function readAll() {
  return kvListResult<Inquiry>("inquiries", 0, 199);
}

export async function GET() {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!kvConfigured()) return NextResponse.json({ inquiries: [], storage: false });
  const result = await readAll();
  if(!result.ok)return NextResponse.json({error:"Storage unavailable",inquiries:[],storage:false},{status:503});
  return NextResponse.json({ inquiries:result.items, storage:true },{headers:{"Cache-Control":"no-store"}});
}

export async function PATCH(req: Request) {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { id, read, status, notes, followUpAt, tags } = body as { id?: string; read?: boolean; status?: string; notes?: string; followUpAt?: string; tags?: string[] };
  const okStatus = status === undefined || ["new", "replied", "won", "lost"].includes(status);
  if (!id || (tags !== undefined && (!Array.isArray(tags)||tags.length>10||tags.some(t=>typeof t!=="string"||t.length>30))) || (read !== undefined && typeof read !== "boolean") || !okStatus || (notes !== undefined && (typeof notes !== "string" || notes.length > 2000)) || (followUpAt !== undefined && (typeof followUpAt !== "string" || (followUpAt !== "" && !/^\d{4}-\d{2}-\d{2}$/.test(followUpAt))))) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const patch: Record<string,unknown>={};
  if(typeof read === "boolean")patch.read=read;
  if(status)patch.status=status;
  if(notes!==undefined)patch.notes=notes;
  if(tags!==undefined)patch.tags=tags;
  if(followUpAt!==undefined)patch.followUpAt=followUpAt;
  const changed=await kvPatchListRecord("inquiries",id,patch);
  if(changed===null)return NextResponse.json({error:"Storage unavailable"},{status:503});
  if(!changed)return NextResponse.json({error:"Not found"},{status:404});
  await audit("inquiry-update", `Lead ${id.slice(0,8)} updated (${status||"details"})`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { id } = body as { id?: string };
  if (!id) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const removed=await kvRemoveListRecord("inquiries","id",id);
  if(removed===null)return NextResponse.json({error:"Storage unavailable"},{status:503});
  if(!removed)return NextResponse.json({error:"Not found"},{status:404});
  await audit("inquiry-delete", `Lead ${id.slice(0,8)} deleted`);
  return NextResponse.json({ ok: true });
}
