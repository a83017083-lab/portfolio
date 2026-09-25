import { NextResponse } from "next/server";
import { trackPageview } from "../../../lib/chatlog";
import { kvIncr } from "../../../lib/kv";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { sid?: string; referrer?: string };
    await trackPageview(body.sid);
    const day=new Date().toISOString().slice(0,10);
    await kvIncr(`stats:daily:${day}`);
    let source="Direct";
    try { const host=new URL(body.referrer||"").hostname.toLowerCase();
      if (host.endsWith("google.com") || host.startsWith("google.")) source="Google";
      else if (host.endsWith("instagram.com")) source="Instagram";
      else if (host && !host.endsWith("buildweth-abhinavk7852.vercel.app")) source="Other";
      else if (host) source="";
    } catch { /* direct visit */ }
    if (source) await kvIncr(`stats:source:${source}`);
  } catch {
    // ignore
  }
  return NextResponse.json({ ok: true });
}
