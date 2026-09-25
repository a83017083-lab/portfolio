"use client";
import { useState } from "react";
export default function ShareLink() {
  const [copied,setCopied]=useState(false);
  async function share() {
    const url=window.location.href;
    if(navigator.share) { try { await navigator.share({title:"Build With Abhinav - Work",url}); return; } catch {} }
    await navigator.clipboard.writeText(url);setCopied(true);setTimeout(()=>setCopied(false),2000);
  }
  return <button className="v2-share" type="button" onClick={share}>{copied ? "Link copied ✓" : "Share this work ↗"}</button>;
}
