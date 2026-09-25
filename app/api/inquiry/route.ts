import { NextResponse } from "next/server";
import crypto from "crypto";
import { kvLPushTrim } from "../../../lib/kv";
import { Inquiry, sendOwnerMail, sendAutoReply, sendViaFormsubmit, mailConfigured } from "../../../lib/mail";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  // honeypot: pretend success, store nothing
  if (typeof body.company === "string" && body.company) {
    return NextResponse.json({ ok: true });
  }

  const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const name = clean(body.name, 80);
  const email = clean(body.email, 120);
  const projectType = clean(body.projectType, 80);
  const budget = clean(body.budget, 60) || "Not specified";
  const message = clean(body.message, 2000);

  if (name.length < 2 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !projectType || message.length < 10) {
    return NextResponse.json({ error: "Please fill all required fields correctly." }, { status: 400 });
  }

  const inq: Inquiry = {
    id: crypto.randomUUID(),
    ts: Date.now(),
    name,
    email,
    projectType,
    budget,
    message,
    read: false,
  };

  // 1) archive for the admin panel (best effort)
  await kvLPushTrim("inquiries", inq, 200);

  // 2) notify: designed HTML mail via Gmail SMTP when configured, else Formsubmit
  let delivered = false;
  if (mailConfigured()) {
    delivered = await sendOwnerMail(inq);
    if (delivered) await sendAutoReply(inq);
  }
  if (!delivered) {
    delivered = await sendViaFormsubmit(inq);
  }

  if (!delivered) {
    return NextResponse.json(
      { error: "Could not send right now - please email a83017083@gmail.com directly." },
      { status: 502 }
    );
  }
  return NextResponse.json({ ok: true });
}
