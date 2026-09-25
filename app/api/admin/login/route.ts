import { NextResponse } from "next/server";
import { checkPassword, signSession, adminConfigured, SESSION_COOKIE, SESSION_MAX_AGE } from "../../../../lib/auth";
import { totpEnrollmentState } from "../../../../lib/totp";

import crypto from "crypto";
import {kvRateLimit} from "../../../../lib/kv";
/* Shared rate limit keeps guesses bounded across serverless instances. */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const key=`admin:login:limit:${Math.floor(Date.now()/600000)}:${crypto.createHash("sha256").update(ip).digest("hex")}`;
  const allowed=await kvRateLimit(key,10,600);
  if(allowed===null)return NextResponse.json({error:"Admin storage unavailable"},{status:503});
  if(!allowed)return NextResponse.json({error:"Too many attempts - wait a few minutes."},{status:429});
  if (!adminConfigured()) {
    return NextResponse.json({ error: "Admin is not configured yet." }, { status: 503 });
  }
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  if (!body.password || !checkPassword(body.password)) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }
  const enrollment = await totpEnrollmentState();
  if (!enrollment.ok) return NextResponse.json({error:"Admin storage unavailable"},{status:503});
  if (enrollment.record) {
    // Password OK - second factor still needed.
    const res = NextResponse.json({ ok: true, needTotp: true });
    res.cookies.set(SESSION_COOKIE, signSession("pre", 10 * 60 * 1000), {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 600,
    });
    return res;
  }
  // First login ever - enroll the authenticator next.
  const res = NextResponse.json({ ok: true, needEnroll: true });
  res.cookies.set(SESSION_COOKIE, signSession("pre", 15 * 60 * 1000), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 900,
  });
  return res;
}
