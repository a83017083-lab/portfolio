import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE } from "./auth";

export function isAuthed(): boolean {
  const c = cookies().get(SESSION_COOKIE);
  return verifySession(c?.value);
}
