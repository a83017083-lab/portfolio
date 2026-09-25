import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { isPreAuthed } from "../../../../../lib/admin-pre";
import { totpEnrolled, getOrCreatePending, totpUri } from "../../../../../lib/totp";
import { adminConfigured } from "../../../../../lib/auth";

export async function GET() {
  if (!adminConfigured()) return NextResponse.json({ error: "Admin is not configured yet." }, { status: 503 });
  if (!isPreAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const enrolled = await totpEnrolled();
  if (enrolled) return NextResponse.json({ enrolled: true });
  const secret = await getOrCreatePending();
  const { uri, issuer, account } = totpUri(secret);
  const qr = await QRCode.toDataURL(uri, { margin: 1, width: 220, color: { dark: "#0b0b12", light: "#ffffff" } });
  return NextResponse.json({ enrolled: false, qr, manual: secret, issuer, account });
}
