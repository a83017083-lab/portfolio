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
      const c = createClient({ url: REDIS_URL, socket: { connectTimeout: 4000, reconnectStrategy: false } });
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
  return (await cmd<string>(["LTRIM", key, 0, max - 1])) === "OK";
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

/** Replace a bounded list in one Redis command, used for private admin record deletion. */
export async function kvReplaceList(key:string,items:unknown[]):Promise<boolean>{
  const c=await getClient();
  if(c){try{const multi=c.multi().del(key);if(items.length)multi.rPush(key,items.map(x=>JSON.stringify(x)));await multi.exec();return true}catch(e){console.error("redis list replace failed",e);return false}}
  if(!REST_URL||!REST_TOKEN)return false;
  const deleted=await cmd<number>(["DEL",key]);if(deleted===null)return false;
  for(const item of items){if(await cmd<number>(["RPUSH",key,JSON.stringify(item)])===null)return false}
  return true;
}

/** Update an inquiry by ID atomically, so a concurrent submission cannot shift its list index. */
export async function kvPatchListRecord(key:string,id:string,patch:Record<string,unknown>):Promise<boolean|null>{
 const lua=`local rows=redis.call('LRANGE',KEYS[1],0,-1); for i,raw in ipairs(rows) do local ok,row=pcall(cjson.decode,raw); if not ok or type(row)~='table' then return -1 end; if row.id==ARGV[1] then local changes=cjson.decode(ARGV[2]); for k,v in pairs(changes) do row[k]=v end; redis.call('LSET',KEYS[1],i-1,cjson.encode(row)); return 1 end end; return 0`;
 const r=await cmd<number>(["EVAL",lua,1,key,id,JSON.stringify(patch)]);return r===null||r===-1?null:r===1;
}

/** Remove a list record by a stable string field in one Redis operation.
 * Unlike read/DEL/rewrite, this cannot erase a concurrent submission.
 */
export async function kvRemoveListRecord(key:string,field:"id"|"email",value:string):Promise<boolean|null>{
 const lua=`local rows=redis.call('LRANGE',KEYS[1],0,-1); local kept={}; local removed=0; for _,raw in ipairs(rows) do local ok,row=pcall(cjson.decode,raw); if not ok or type(row)~='table' then return -1 end; if row[ARGV[1]]==ARGV[2] then removed=removed+1 else table.insert(kept,raw) end end; if removed==0 then return 0 end; redis.call('DEL',KEYS[1]); if #kept>0 then redis.call('RPUSH',KEYS[1],unpack(kept)) end; return 1`;
 const r=await cmd<number>(["EVAL",lua,1,key,field,value]);return r===null||r===-1?null:r===1;
}

/** Shared, fixed-window limiter. Returns null if the store is unavailable (fail closed). */
export async function kvRateLimit(key:string, max:number, windowSeconds:number):Promise<boolean|null>{
  const count=await kvIncr(key);
  if(count===null)return null;
  if(count===1){const expiry=await cmd<number>(["EXPIRE",key,windowSeconds]);if(expiry===null)return null}
  return count<=max;
}

/** Read with an explicit success bit so privacy exports fail closed on Redis errors. */
async function getWithStatus<T>(key:string):Promise<{ok:boolean;raw:string|T|null}>{
 const c=await getClient();
 if(c){try{return {ok:true,raw:(await c.sendCommand(["GET",key])) as string|T|null}}catch(e){console.error("redis read failed",e);return {ok:false,raw:null}}}
 if(!REST_URL||!REST_TOKEN)return {ok:false,raw:null};
 try{const res=await fetch(REST_URL,{method:"POST",headers:{Authorization:`Bearer ${REST_TOKEN}`,"Content-Type":"application/json"},body:JSON.stringify(["GET",key]),cache:"no-store"});
  if(!res.ok)return {ok:false,raw:null};const data=await res.json() as {result?:string|T|null};return {ok:true,raw:data.result??null};
 }catch(e){console.error("redis REST read failed",e);return {ok:false,raw:null}}
}
export async function kvReadResult<T>(key:string):Promise<{ok:boolean;value:T|null}>{
 const result=await getWithStatus<T>(key);
 if(!result.ok)return {ok:false,value:null};
 const raw=result.raw;
 if(raw===null)return {ok:true,value:null};
 if(typeof raw==="string"){
  try{return {ok:true,value:JSON.parse(raw) as T}}catch{return {ok:false,value:null}}
 }
 return {ok:true,value:raw as T};
}

export async function kvListResult<T>(key:string,start:number,stop:number):Promise<{ok:boolean;items:T[]}>{
 const r=await cmd<string[]>(["LRANGE",key,start,stop]);
 if(r===null)return {ok:false,items:[]};
 const items:T[]=[];
 for(const v of r){try{items.push(JSON.parse(v) as T)}catch{return {ok:false,items:[]}}}
 return {ok:true,items};
}

/** Atomically add to a capped Redis list if a matching email is not already present. */
export async function kvAddUniqueEmail(key:string,email:string,record:unknown,max:number):Promise<boolean|null>{
 const lua=`local rows=redis.call('LRANGE',KEYS[1],0,-1); for _,row in ipairs(rows) do local ok,data=pcall(cjson.decode,row); if ok and data.email==ARGV[1] then return 0 end end; redis.call('LPUSH',KEYS[1],ARGV[2]); redis.call('LTRIM',KEYS[1],0,tonumber(ARGV[3])-1); return 1`;
 const r=await cmd<number>(["EVAL",lua,1,key,email,JSON.stringify(record),max]);
 return r===null?null:r===1;
}

/** Atomic JSON-array append. Used for private clients so concurrent admin changes cannot overwrite one another. */
export async function kvJsonAppend(key:string,record:unknown,max:number):Promise<boolean|null>{
 const lua=`local raw=redis.call('GET',KEYS[1]); local rows=cjson.decode('[]'); if raw then local ok,data=pcall(cjson.decode,raw); if not ok or type(data)~='table' or (raw:sub(1,1)~='[') then return -1 end; rows=data end; if #rows>=tonumber(ARGV[2]) then return 0 end; table.insert(rows,cjson.decode(ARGV[1])); redis.call('SET',KEYS[1],cjson.encode(rows)); return 1`;
 const r=await cmd<number>(["EVAL",lua,1,key,JSON.stringify(record),max]);return r===null||r===-1?null:r===1;
}

/** Atomic update/revocation of one client without racing concurrent admin actions. */
export async function kvJsonClientMutate(key:string,id:string,op:"update"|"delete",status="",update=""):Promise<boolean|null>{
 const lua=`local raw=redis.call('GET',KEYS[1]); if not raw then return 0 end; local ok,rows=pcall(cjson.decode,raw); if not ok or type(rows)~='table' or raw:sub(1,1)~='[' then return -1 end; for i,row in ipairs(rows) do if row.id==ARGV[1] then if ARGV[2]=='delete' then table.remove(rows,i) else row.status=ARGV[3]; row.update=ARGV[4] end; if #rows==0 then redis.call('SET',KEYS[1],'[]') else redis.call('SET',KEYS[1],cjson.encode(rows)) end; return 1 end end; return 0`;
 const r=await cmd<number>(["EVAL",lua,1,key,id,op,status,update]);return r===null||r===-1?null:r===1;
}

/** Append one immutable wallet adjustment atomically, rejecting duplicates and over-redemption. */
export async function kvAppendUniqueLedger(key:string,record:unknown,max:number):Promise<boolean|null>{
 const lua=`local raw=redis.call('GET',KEYS[1]); local rows=cjson.decode('[]'); if raw then local ok,data=pcall(cjson.decode,raw); if not ok or type(data)~='table' or raw:sub(1,1)~='[' then return -1 end; rows=data end; if #rows>=tonumber(ARGV[2]) then return 0 end; local new=cjson.decode(ARGV[1]); local balance=0; for _,row in ipairs(rows) do if row.id==new.id or (row.invoiceRef==new.invoiceRef and row.kind==new.kind and (row.clientId==new.clientId or new.kind=='earned')) then return 0 end; if row.clientId==new.clientId and row.currency==new.currency then if row.kind=='earned' then balance=balance+row.amountMinor else balance=balance-row.amountMinor end end end; if new.kind=='redeemed' and new.amountMinor>balance then return 0 end; table.insert(rows,new); redis.call('SET',KEYS[1],cjson.encode(rows)); return 1`;
 const r=await cmd<number>(["EVAL",lua,1,key,JSON.stringify(record),max]);return r===null||r===-1?null:r===1;
}
