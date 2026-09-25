import crypto from "crypto";

const COOKIE = "abhinav_admin";
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function secret(): string | null {
  return process.env.ADMIN_PASSWORD || null;
}

export function adminConfigured() {
  return Boolean(secret());
}

function hmac(payload: string): string {
  return crypto.createHmac("sha256", secret()!).update(payload).digest("base64url");
}

export function signSession(): string {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + TTL_MS })).toString("base64url");
  return `${payload}.${hmac(payload)}`;
}

export function verifySession(token: string | undefined | null): boolean {
  if (!token || !secret()) return false;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expect = hmac(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expect);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { exp?: number };
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

export function checkPassword(candidate: string): boolean {
  const s = secret();
  if (!s) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(s);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export const SESSION_COOKIE = COOKIE;
export const SESSION_MAX_AGE = TTL_MS / 1000;
