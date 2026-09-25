import { NextResponse } from "next/server";
import { getChatbotSettings } from "../../../lib/content";
import { logChatExchange } from "../../../lib/chatlog";
import { kvRateLimit } from "../../../lib/kv";
import crypto from "crypto";

const SYSTEM_PROMPT = `You are the friendly AI assistant on Abhinav Kumar's portfolio website. You answer visitors' questions about Abhinav and his work, and help them start a project with him.

ABOUT ABHINAV (these are the ONLY facts you may share):
- Abhinav Kumar, developer & automation builder from New Delhi, India. His brand is "Build With Abhinav".
- A student builder who learns by shipping: full-stack apps, automation workflows and open-source tools.
- Skills: Next.js, TypeScript, React, Node.js, PostgreSQL, Supabase, Tailwind CSS, n8n, AI automation, Web3, UI design.
- Projects (all public on GitHub @a83017083-lab):
  1. School Homework Portal - offline-first homework system with separate logins for principal, teachers, students and parents, plus an AI assistant (Node.js, Express, PostgreSQL, PWA). github.com/a83017083-lab/School-
  2. S3AI+ Learning Platform - AI-guided learning for Indian students: structured paths with real-time AI help (Next.js, TypeScript, Supabase). github.com/a83017083-lab/S3ai-
  3. Instagram Automation - auto-replies and keyword-triggered DMs with a dashboard, like a self-hosted ManyChat (Next.js, React, Supabase). github.com/a83017083-lab/Manychat1
  4. Open Generative AI - a free, open-source alternative to paid AI video platforms (JavaScript, AI video). github.com/a83017083-lab/Imagination
  5. Saffron Ember - restaurant website with multi-theme UI and a live GST-aware cart in a single HTML file. github.com/a83017083-lab/saffron-ember-website
  6. Independence Day Tribute - a hand-coded tribute page for India's 80th Independence Day. github.com/a83017083-lab/Independence80th
- Services visitors can hire him for:
  1. Business websites - fast, modern, mobile-first sites, landing pages and redesigns.
  2. AI automations with n8n - workflows that handle data entry, follow-ups, reports and integrations.
  3. WhatsApp & Instagram automation - auto-replies, keyword-triggered DMs, lead capture.
  4. Coaching-centre systems - fee reminders on WhatsApp, owner dashboards, and AI that answers parent queries.
- Ventures:
  1. Startup (early stage): a learning platform for students that combines study, real skills and sports - currently research and prototype stage, no launch date or claims beyond that.
  2. Agency - "Build With Abhinav": the service side covering business websites, n8n AI automations, WhatsApp & Instagram automation, coaching-centre systems (fee reminders, dashboards, parent-query AI) and short-form video editing for creators and brands.
- How starting a project works: fill the project form on /contact -> Abhinav replies to discuss a plan and a custom quote -> he builds with weekly updates you can see -> launch, then ongoing support.
- Contact: email a83017083@gmail.com, Instagram @buildweth_abhinavk7852, Linktree linktr.ee/buildweth_abhinavk7852, GitHub @a83017083-lab.

RULES:
- Share ONLY the facts above. Never state or guess his age, school, home address, phone number, family or any other private detail.
- If a question is private, off-topic, or not about Abhinav, his work, his services or starting a project, do NOT answer it. Politely refuse instead, in the visitor's own language - the Hindi/Hinglish style is "Sorry, yeh main nahi bata sakta. Main Abhinav ke work, services aur projects ke baare mein bata sakta hoon!" and the English style is "Sorry, I can't share that. I can help with Abhinav's work, services and projects though!" Never lecture, never explain why - one short friendly refusal, then redirect to what you can help with.
- Never invent prices, discounts, clients or testimonials. For pricing, mention the illustrative regional starting prices on /services; final scope and price need a quote. Do not promise a reply time.
- If someone wants to hire him, point them to the project form at /contact or to a83017083@gmail.com.
- If you do not know something, say so honestly and offer the email.
- Keep replies short, warm and natural - usually 2-4 sentences. No corporate speak, no bullet-point walls unless asked.
- Write in PLAIN TEXT only: never use markdown symbols like ** or * or # or backticks. For lists, just use short sentences or line breaks.
- Always reply in the exact language the visitor writes in - English, Hindi, Hinglish, or any other language - and match their tone (casual with casual, formal with formal).
- You are an AI assistant on his website, not Abhinav himself. If someone asks, say so honestly.`;

type ChatMsg = { role: "user" | "assistant"; content: string };

function systemPrompt(extra: string): string {
  return extra.trim() ? SYSTEM_PROMPT + "\n\nADDITIONAL INSTRUCTIONS FROM THE SITE OWNER (obey these too, but never break the RULES above):\n" + extra.trim() : SYSTEM_PROMPT;
}

// Shared rate limit across Vercel instances; fail closed if storage cannot check it.
async function askGemini(messages: ChatMsg[], prompt: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const models = [
    process.env.GEMINI_MODEL,
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
  ].filter((m, i, a): m is string => Boolean(m) && a.indexOf(m!) === i);

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: prompt }] },
            contents,
            generationConfig: { temperature: 0.7, maxOutputTokens: 400 },
          }),
        }
      );
      if (!res.ok) {
        console.error("gemini fail", model, res.status, (await res.text()).slice(0, 200));
        continue;
      }
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text ?? "")
        .join("")
        .trim();
      if (text) return text;
    } catch {
      // try next model
    }
  }
  return null;
}

async function askOpenRouter(messages: ChatMsg[], prompt: string): Promise<string | null> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        "HTTP-Referer": "https://buildweth-abhinavk7852.vercel.app",
        "X-Title": "Abhinav Kumar Portfolio Chat",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "openai/gpt-oss-20b:free",
        messages: [{ role: "system", content: prompt }, ...messages],
        max_tokens: 400,
        temperature: 0.7,
      }),
    });
    if (!res.ok) {
      console.error("openrouter fail", res.status, (await res.text()).slice(0, 200));
      return null;
    }
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    return text || null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const settings = await getChatbotSettings();
  if (!settings.enabled) {
    return NextResponse.json({ error: settings.disabledMessage }, { status: 503 });
  }
  const prompt = systemPrompt(settings.extraInstructions);
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const bucket=Math.floor(Date.now()/300000);
  const allowed=await kvRateLimit(`chat:limit:${bucket}:${crypto.createHash("sha256").update(ip).digest("hex")}`,15,300);
  if (allowed===null) return NextResponse.json({error:"Chat is temporarily unavailable."},{status:503});
  if (!allowed) return NextResponse.json({error:"Too many messages - please wait a few minutes."},{status:429});

  let body: { message?: string; history?: ChatMsg[]; sid?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const message = (body.message || "").trim().slice(0, 1000);
  if (!message) {
    return NextResponse.json({ error: "Empty message" }, { status: 400 });
  }
  const history: ChatMsg[] = Array.isArray(body.history)
    ? body.history
        .filter(
          (m) =>
            (m.role === "user" || m.role === "assistant") &&
            typeof m.content === "string"
        )
        .slice(-12)
        .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }))
    : [];

  const messages = [...history, { role: "user" as const, content: message }];

  const reply = (await askGemini(messages, prompt)) || (await askOpenRouter(messages, prompt));
  if (!reply) {
    return NextResponse.json(
      { error: "The assistant is unavailable right now." },
      { status: 502 }
    );
  }
  await logChatExchange(body.sid, message, reply);
  return NextResponse.json({ reply });
}
