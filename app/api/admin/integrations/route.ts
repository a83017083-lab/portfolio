import { NextResponse } from "next/server";
import { isAuthed } from "../../../../lib/admin-guard";
import { getWebhookSetting, setWebhookUrl } from "../../../../lib/leads";

export async function GET() {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const setting=await getWebhookSetting();
  if(!setting.ok)return NextResponse.json({error:"Storage unavailable"},{status:503});
  return NextResponse.json({n8nWebhookUrl:setting.url},{headers:{"Cache-Control":"no-store"}});
}

export async function PUT(req: Request) {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if(typeof body?.n8nWebhookUrl !== "string")return NextResponse.json({error:"Webhook URL must be a string"},{status:400});
  const url = body.n8nWebhookUrl.trim();
  if (url && !/^https:\/\//.test(url)) {
    return NextResponse.json({ error: "Webhook URL must start with https://" }, { status: 400 });
  }
  if(!await setWebhookUrl(url))return NextResponse.json({error:"Storage unavailable"},{status:503});
  return NextResponse.json({ ok: true });
}
