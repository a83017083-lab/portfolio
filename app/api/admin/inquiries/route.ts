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
  const { id, read, status } = body as { id?: string; read?: boolean; status?: string };
  const okStatus = status === undefined || ["new", "replied", "won", "lost"].includes(status);
  if (!id || (read !== undefined && typeof read !== "boolean") || !okStatus) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const all = await readAll();
  const idx = all.findIndex((i) => i.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (typeof read === "boolean") all[idx].read = read;
  if (status) all[idx].status = status as Inquiry["status"];
  await kvLSet("inquiries", idx, all[idx]);
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
  return NextResponse.json({ ok: true });
}
