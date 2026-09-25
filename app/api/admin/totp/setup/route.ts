import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { isPreAuthed } from "../../../../../lib/admin-pre";
import { totpEnrollmentState, getOrCreatePending, totpUri } from "../../../../../lib/totp";
import { adminConfigured } from "../../../../../lib/auth";

export async function GET() {
  if (!adminConfigured()) return NextResponse.json({ error: "Admin is not configured yet." }, { status: 503 });
  if (!isPreAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const enrollment = await totpEnrollmentState();
  if (!enrollment.ok) return NextResponse.json({error:"Admin storage unavailable"},{status:503});
  if (enrollment.record) return NextResponse.json({ enrolled: true });
  const secret = await getOrCreatePending();
  if(!secret)return NextResponse.json({error:"Admin storage unavailable"},{status:503});
  const { uri, issuer, account } = totpUri(secret);
  const qr = await QRCode.toDataURL(uri, { margin: 1, width: 220, color: { dark: "#0b0b12", light: "#ffffff" } });
  return NextResponse.json({ enrolled: false, qr, manual: secret, issuer, account });
}
