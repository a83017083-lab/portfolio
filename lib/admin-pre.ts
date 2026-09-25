import { cookies } from "next/headers";
import { sessionStage, SESSION_COOKIE } from "./auth";

export function isPreAuthed(): boolean {
  const c = cookies().get(SESSION_COOKIE);
  const stage = sessionStage(c?.value);
  return stage === "pre" || stage === "full";
}
