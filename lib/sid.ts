"use client";

export function getSid(): string {
  if (typeof window === "undefined") return "";
  try {
    let sid = window.localStorage.getItem("abhinav_sid");
    if (!sid) {
      sid = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`).replace(/[^a-zA-Z0-9-]/g, "");
      window.localStorage.setItem("abhinav_sid", sid);
    }
    return sid;
  } catch {
    return "";
  }
}
