import { NextResponse } from "next/server";
import { isAuthed } from "../../../../lib/admin-guard";
import { getContent, saveContent, DEFAULT_CONTENT, SiteContent } from "../../../../lib/content";

export async function GET() {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const content = await getContent();
  return NextResponse.json({ content, defaults: DEFAULT_CONTENT });
}

export async function PUT(req: Request) {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { content?: SiteContent } | null;
  if (!body?.content || !Array.isArray(body.content.projects) || !Array.isArray(body.content.services)) {
    return NextResponse.json({ error: "Bad content shape" }, { status: 400 });
  }
  const ok = await saveContent(body.content);
  if (!ok) return NextResponse.json({ error: "Storage unavailable - is KV connected?" }, { status: 503 });
  return NextResponse.json({ ok: true });
}
