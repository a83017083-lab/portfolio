import { audit } from "../../../../lib/audit";
import { NextResponse } from "next/server";
import { isAuthed } from "../../../../lib/admin-guard";
import { getChatbotSettings, saveChatbotSettings, ChatbotSettings } from "../../../../lib/content";

export async function GET() {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await getChatbotSettings();
  return NextResponse.json({ settings });
}

export async function PUT(req: Request) {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { settings?: ChatbotSettings } | null;
  if (!body?.settings || typeof body.settings.enabled !== "boolean") {
    return NextResponse.json({ error: "Bad settings shape" }, { status: 400 });
  }
  const s = body.settings;
  const ok = await saveChatbotSettings({
    enabled: s.enabled,
    greeting: String(s.greeting || "").slice(0, 500),
    extraInstructions: String(s.extraInstructions || "").slice(0, 2000),
    disabledMessage: String(s.disabledMessage || "").slice(0, 300),
  });
  if (!ok) return NextResponse.json({ error: "Storage unavailable - is KV connected?" }, { status: 503 });
  await audit("chatbot-settings", "Chatbot settings saved");
  return NextResponse.json({ ok: true });
}
