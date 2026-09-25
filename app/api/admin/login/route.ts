import { NextResponse } from "next/server";
import { checkPassword, signSession, adminConfigured, SESSION_COOKIE, SESSION_MAX_AGE } from "../../../../lib/auth";

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
  if (limited(ip)) {
    return NextResponse.json({ error: "Too many attempts - wait a few minutes." }, { status: 429 });
  }
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
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, signSession(), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
