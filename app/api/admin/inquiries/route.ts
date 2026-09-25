import {audit} from "../../../../lib/audit";
import { NextResponse } from "next/server";
import { isAuthed } from "../../../../lib/admin-guard";
import { kvLRange, kvLSet, kvLRemIndex, kvConfigured } from "../../../../lib/kv";
import type { Inquiry } from "../../../../lib/mail";

async function readAll(): Promise<Inquiry[]> {
  return kvLRange<Inquiry>("inquiries", 0, 199);
}

export async function GET() {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!kvConfigured()) return NextResponse.json({ inquiries: [], storage: false });
  const inquiries = await readAll();
  return NextResponse.json({ inquiries, storage: true });
}

export async function PATCH(req: Request) {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { id, read, status, notes, followUpAt, tags } = body as { id?: string; read?: boolean; status?: string; notes?: string; followUpAt?: string; tags?: string[] };
  const okStatus = status === undefined || ["new", "replied", "won", "lost"].includes(status);
  if (!id || (tags !== undefined && (!Array.isArray(tags)||tags.length>10||tags.some(t=>typeof t!=="string"||t.length>30))) || (read !== undefined && typeof read !== "boolean") || !okStatus || (notes !== undefined && (typeof notes !== "string" || notes.length > 2000)) || (followUpAt !== undefined && (typeof followUpAt !== "string" || (followUpAt !== "" && !/^\d{4}-\d{2}-\d{2}$/.test(followUpAt))))) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const all = await readAll();
  const idx = all.findIndex((i) => i.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (typeof read === "boolean") all[idx].read = read;
  if (status) all[idx].status = status as Inquiry["status"];
  if (notes !== undefined) all[idx].notes = notes;
  if (tags !== undefined) all[idx].tags = tags;
  if (followUpAt !== undefined) all[idx].followUpAt = followUpAt;
  await kvLSet("inquiries", idx, all[idx]);
  await audit("inquiry-update", `Lead ${id.slice(0,8)} updated (${status||"details"})`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { id } = body as { id?: string };
  if (!id) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const all = await readAll();
  const idx = all.findIndex((i) => i.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await kvLRemIndex("inquiries", idx);
  await audit("inquiry-delete", `Lead ${id.slice(0,8)} deleted`);
  return NextResponse.json({ ok: true });
}
