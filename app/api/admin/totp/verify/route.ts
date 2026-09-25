import { NextResponse } from "next/server";
import { isPreAuthed } from "../../../../../lib/admin-pre";
import { totpEnrolled, getOrCreatePending, verifyTotp, enrollPending } from "../../../../../lib/totp";
import { signSession, adminConfigured, SESSION_COOKIE, SESSION_MAX_AGE } from "../../../../../lib/auth";

const buckets = new Map<string, { count: number; reset: number }>();
function limited(ip: string) {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now > b.reset) {
    buckets.set(ip, { count: 1, reset: now + 10 * 60 * 1000 });
    return false;
  }
  b.count += 1;
  return b.count > 10;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) return NextResponse.json({ error: "Too many attempts - wait a few minutes." }, { status: 429 });
  if (!adminConfigured()) return NextResponse.json({ error: "Admin is not configured yet." }, { status: 503 });
  if (!isPreAuthed()) return NextResponse.json({ error: "Session expired - sign in again." }, { status: 401 });
  let body: { code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const code = (body.code || "").trim();
  if (!code) return NextResponse.json({ error: "Enter the 6-digit code." }, { status: 400 });

  const enrolled = await totpEnrolled();
  const secret = enrolled ? enrolled.secret : await getOrCreatePending();
  if (!verifyTotp(secret, code)) {
    return NextResponse.json({ error: "That code did not match - try the latest one." }, { status: 401 });
  }
  if (!enrolled) await enrollPending(secret);

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
