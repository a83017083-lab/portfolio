// Chatbot conversation logging + lightweight site stats. Privacy-safe:
// visitors are only a random client-generated id, no IPs stored.
import { kvGet, kvSet, kvLPushTrim, kvLRange, kvIncr, kvSAdd, kvSCard } from "./kv";

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  ts: number;
}

export interface ConvMeta {
  sid: string;
  started: number;
  lastTs: number;
  count: number;
  preview: string;
}

const CONVS = "chat:convs:v1";
const metaKey = (sid: string) => `chat:meta:${sid}`;
const convKey = (sid: string) => `chat:conv:${sid}`;

function cleanSid(sid: unknown): string | null {
  if (typeof sid !== "string") return null;
  const s = sid.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 64);
  return s.length >= 8 ? s : null;
}

export async function logChatExchange(rawSid: unknown, userText: string, botText: string): Promise<void> {
  const sid = cleanSid(rawSid);
  if (!sid) return;
  const now = Date.now();
  const msgs: ChatMessage[] = [
    { role: "user", text: userText.slice(0, 1000), ts: now },
    { role: "assistant", text: botText.slice(0, 2000), ts: now + 1 },
  ];
  for (const m of msgs) await kvLPushTrim(convKey(sid), m, 200);

  const existing = await kvGet<ConvMeta>(metaKey(sid));
  const meta: ConvMeta = {
    sid,
    started: existing?.started ?? now,
    lastTs: now,
    count: (existing?.count ?? 0) + 1,
    preview: existing?.preview ?? userText.slice(0, 80),
  };
  await kvSet(metaKey(sid), meta);
  if (!existing) await kvLPushTrim(CONVS, sid, 100);

  await kvIncr("stats:chat:messages", 1);
  await kvSAdd("stats:chat:sessions", sid);
}

export async function listConversations(): Promise<ConvMeta[]> {
  const sids = await kvLRange<string>(CONVS, 0, -1);
  const metas: ConvMeta[] = [];
  for (const sid of sids) {
    const m = await kvGet<ConvMeta>(metaKey(sid));
    if (m) metas.push(m);
  }
  return metas.sort((a, b) => b.lastTs - a.lastTs);
}

export async function getConversation(rawSid: unknown): Promise<ChatMessage[]> {
  const sid = cleanSid(rawSid);
  if (!sid) return [];
  const items = await kvLRange<ChatMessage>(convKey(sid), 0, -1);
  return items.reverse(); // stored newest-first
}

export async function trackPageview(rawSid: unknown): Promise<void> {
  const sid = cleanSid(rawSid);
  await kvIncr("stats:pv:total", 1);
  if (sid) await kvSAdd("stats:pv:visitors", sid);
}

export async function getStats() {
  const [pageviews, visitors, chatSessions, chatMessages] = await Promise.all([
    kvGet<number>("stats:pv:total"),
    kvSCard("stats:pv:visitors"),
    kvSCard("stats:chat:sessions"),
    kvGet<number>("stats:chat:messages"),
  ]);
  return {
    pageviews: pageviews ?? 0,
    visitors: visitors ?? 0,
    chatSessions: chatSessions ?? 0,
    chatMessages: chatMessages ?? 0,
  };
}
