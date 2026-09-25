// TOTP 2FA state for the admin panel. Secret lives server-side in Redis only.
import { generateSecret, generateURI, verifySync } from "otplib";
import { kvGet, kvSet } from "./kv";

const KEY = "admin:totp:v1";
const PENDING = "admin:totp:pending:v1";

export interface TotpRecord {
  secret: string;
  enrolledAt: number;
}

export async function totpEnrolled(): Promise<TotpRecord | null> {
  const rec = await kvGet<TotpRecord>(KEY);
  return rec && rec.secret ? rec : null;
}

export async function getOrCreatePending(): Promise<string> {
  const p = await kvGet<{ secret: string; exp: number }>(PENDING);
  if (p && p.secret && p.exp > Date.now()) return p.secret;
  const secret = generateSecret();
  await kvSet(PENDING, { secret, exp: Date.now() + 15 * 60 * 1000 });
  return secret;
}

export function verifyTotp(secret: string, code: string): boolean {
  try {
    const r = verifySync({ token: code.replace(/\s/g, ""), secret, epochTolerance: 30 });
    return Boolean(r && r.valid);
  } catch {
    return false;
  }
}

export async function enrollPending(secret: string): Promise<void> {
  await kvSet(KEY, { secret, enrolledAt: Date.now() } satisfies TotpRecord);
  await kvSet(PENDING, null);
}

export function totpUri(secret: string): { uri: string; issuer: string; account: string } {
  const issuer = "Build With Abhinav";
  const account = "admin";
  return { uri: generateURI({ secret, issuer, label: account }), issuer, account };
}
