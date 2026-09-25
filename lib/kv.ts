// Redis client for the Vercel-connected Redis store (REDIS_URL).
// Falls back to Upstash-style REST vars if present. Returns null/no-op
// everywhere when unconfigured so the site runs fine without a store.

import { createClient, type RedisClientType } from "redis";

const REDIS_URL = process.env.REDIS_URL || process.env.STORAGE_URL;
const REST_URL = process.env.KV_REST_API_URL;
const REST_TOKEN = process.env.KV_REST_API_TOKEN;

export function kvConfigured() {
  return Boolean(REDIS_URL || (REST_URL && REST_TOKEN));
}

let client: RedisClientType | null = null;
let connecting: Promise<RedisClientType | null> | null = null;

async function getClient(): Promise<RedisClientType | null> {
  if (!REDIS_URL) return null;
  if (client?.isOpen) return client;
  if (connecting) return connecting;
  connecting = (async () => {
    try {
      const c = createClient({ url: REDIS_URL, socket: { connectTimeout: 4000 } });
      c.on("error", (e) => console.error("redis error", e));
      await c.connect();
      client = c as RedisClientType;
      return client;
    } catch (e) {
      console.error("redis connect failed", e);
      return null;
    } finally {
      connecting = null;
    }
  })();
  return connecting;
}

async function cmd<T>(command: (string | number)[]): Promise<T | null> {
  const c = await getClient();
  if (c) {
    try {
      return (await c.sendCommand(command.map(String))) as T;
    } catch (e) {
      console.error("redis cmd failed", e);
      return null;
    }
  }
  if (!REST_URL || !REST_TOKEN) return null;
  try {
    const res = await fetch(REST_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${REST_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(command),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("kv error", res.status, (await res.text()).slice(0, 200));
      return null;
    }
    const data = (await res.json()) as { result?: T };
    return data.result ?? null;
  } catch (e) {
    console.error("kv fetch failed", e);
    return null;
  }
}

export async function kvGet<T>(key: string): Promise<T | null> {
  const raw = await cmd<string | T>(["GET", key]);
  if (raw == null) return null;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  }
  return raw as T;
}

export async function kvSet(key: string, value: unknown): Promise<boolean> {
  const r = await cmd<string>(["SET", key, JSON.stringify(value)]);
  return r === "OK";
}

export async function kvLPushTrim(key: string, value: unknown, max: number): Promise<boolean> {
  const r1 = await cmd<number>(["LPUSH", key, JSON.stringify(value)]);
  if (r1 == null) return false;
  await cmd<string>(["LTRIM", key, 0, max - 1]);
  return true;
}

export async function kvLRange<T>(key: string, start: number, stop: number): Promise<T[]> {
  const r = await cmd<string[]>(["LRANGE", key, start, stop]);
  if (!r) return [];
  return r
    .map((s) => {
      try {
        return JSON.parse(s) as T;
      } catch {
        return null;
      }
    })
    .filter((v): v is T => v !== null);
}

export async function kvLSet(key: string, index: number, value: unknown): Promise<boolean> {
  const r = await cmd<string>(["LSET", key, index, JSON.stringify(value)]);
  return r === "OK";
}

export async function kvLRemIndex(key: string, index: number): Promise<boolean> {
  const items = await kvLRange<unknown>(key, 0, -1);
  if (index < 0 || index >= items.length) return false;
  items.splice(index, 1);
  await cmd<unknown>(["DEL", key]);
  for (let i = items.length - 1; i >= 0; i--) {
    await cmd<number>(["LPUSH", key, JSON.stringify(items[i])]);
  }
  return true;
}

export async function kvIncr(key: string, by = 1): Promise<number | null> {
  return cmd<number>(["INCRBY", key, by]);
}

export async function kvSAdd(key: string, member: string): Promise<boolean> {
  const r = await cmd<number>(["SADD", key, member]);
  return r !== null;
}

export async function kvSCard(key: string): Promise<number> {
  const r = await cmd<number>(["SCARD", key]);
  return r ?? 0;
}
