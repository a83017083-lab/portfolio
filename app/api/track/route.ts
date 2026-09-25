import { NextResponse } from "next/server";
import { trackPageview } from "../../../lib/chatlog";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { sid?: string };
    await trackPageview(body.sid);
  } catch {
    // ignore
  }
  return NextResponse.json({ ok: true });
}
