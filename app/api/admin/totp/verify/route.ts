import { NextResponse } from "next/server";
import { isPreAuthed } from "../../../../../lib/admin-pre";
import { totpEnrollmentState, getOrCreatePending, verifyTotp, enrollPending } from "../../../../../lib/totp";
import { signSession, adminConfigured, SESSION_COOKIE, SESSION_MAX_AGE } from "../../../../../lib/auth";

import crypto from "crypto";
import {kvRateLimit} from "../../../../../lib/kv";
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const key=`admin:totp:limit:${Math.floor(Date.now()/600000)}:${crypto.createHash("sha256").update(ip).digest("hex")}`;
  const allowed=await kvRateLimit(key,10,600);
  if(allowed===null)return NextResponse.json({error:"Admin storage unavailable"},{status:503});
  if(!allowed)return NextResponse.json({error:"Too many attempts - wait a few minutes."},{status:429});
  if (!adminConfigured()) return NextResponse.json({ error: "Admin is not configured yet." }, { status: 503 });
  if (!isPreAuthed()) return NextResponse.json({ error: "Session expired - sign in again." }, { status: 401 });
  let body: { code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  if (!code) return NextResponse.json({ error: "Enter the 6-digit code." }, { status: 400 });

  const enrollment = await totpEnrollmentState();
  if(!enrollment.ok)return NextResponse.json({error:"Admin storage unavailable"},{status:503});
  const secret = enrollment.record?.secret || await getOrCreatePending();
  if(!secret)return NextResponse.json({error:"Admin storage unavailable"},{status:503});
  if (!verifyTotp(secret, code)) {
    return NextResponse.json({ error: "That code did not match - try the latest one." }, { status: 401 });
  }
  if(!enrollment.record && !await enrollPending(secret))return NextResponse.json({error:"Could not save authenticator enrollment"},{status:503});

  const res = NextResponse.json({ ok: true, enrolled: true });
  res.cookies.set(SESSION_COOKIE, signSession("full"), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
