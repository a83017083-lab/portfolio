import { NextResponse } from "next/server";
import { isAuthed } from "../../../../lib/admin-guard";
import { getWebhookUrl, setWebhookUrl } from "../../../../lib/leads";

export async function GET() {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ n8nWebhookUrl: await getWebhookUrl() });
}

export async function PUT(req: Request) {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const url = typeof body.n8nWebhookUrl === "string" ? body.n8nWebhookUrl.trim() : "";
  if (url && !/^https:\/\//.test(url)) {
    return NextResponse.json({ error: "Webhook URL must start with https://" }, { status: 400 });
  }
  await setWebhookUrl(url);
  return NextResponse.json({ ok: true });
}
