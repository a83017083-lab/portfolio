import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are the friendly AI assistant on Abhinav Kumar's portfolio website. You answer visitors' questions about Abhinav and his work, and help them start a project with him.

ABOUT ABHINAV (these are the ONLY facts you may share):
- Abhinav Kumar, developer & automation builder from New Delhi, India. His brand is "Build With Abhinav".
- A student builder who learns by shipping: full-stack apps, automation workflows and open-source tools. 25+ public repositories on GitHub, everything built in public.
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
- How starting a project works: fill the project form at the bottom of this site -> Abhinav replies within 24 hours with a plan and a custom quote -> he builds with weekly updates you can see -> launch, then ongoing support.
- Contact: email a83017083@gmail.com, Instagram @buildweth_abhinavk7852, Linktree linktr.ee/buildweth_abhinavk7852, GitHub @a83017083-lab.

RULES:
- Share ONLY the facts above. Never state or guess his age, school, home address, phone number, family or any other private detail.
- If a question is private, off-topic, or not about Abhinav, his work, his services or starting a project, do NOT answer it. Politely refuse instead, in the visitor's own language - the Hindi/Hinglish style is "Sorry, yeh main nahi bata sakta. Main Abhinav ke work, services aur projects ke baare mein bata sakta hoon!" and the English style is "Sorry, I can't share that. I can help with Abhinav's work, services and projects though!" Never lecture, never explain why - one short friendly refusal, then redirect to what you can help with.
- Never invent prices, discounts, clients or testimonials. For pricing say every project gets a custom quote within 24 hours through the form.
- If someone wants to hire him, point them to the project form at the bottom of this page or to a83017083@gmail.com.
- If you do not know something, say so honestly and offer the email.
- Keep replies short, warm and natural - usually 2-4 sentences. No corporate speak, no bullet-point walls unless asked.
- Write in PLAIN TEXT only: never use markdown symbols like ** or * or # or backticks. For lists, just use short sentences or line breaks.
- Always reply in the exact language the visitor writes in - English, Hindi, Hinglish, or any other language - and match their tone (casual with casual, formal with formal).
- You are an AI assistant on his website, not Abhinav himself. If someone asks, say so honestly.`;

type ChatMsg = { role: "user" | "assistant"; content: string };

// best-effort per-IP rate limit (per serverless instance)
const buckets = new Map<string, { count: number; reset: number }>();
function rateLimited(ip: string) {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now > b.reset) {
    buckets.set(ip, { count: 1, reset: now + 5 * 60 * 1000 });
    return false;
  }
  b.count += 1;
  return b.count > 15;
}

async function askGemini(messages: ChatMsg[]): Promise<string | null> {
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
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
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

async function askOpenRouter(messages: ChatMsg[]): Promise<string | null> {
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
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
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
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many messages - please wait a few minutes." },
      { status: 429 }
    );
  }

  let body: { message?: string; history?: ChatMsg[] };
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

  const reply = (await askGemini(messages)) || (await askOpenRouter(messages));
  if (!reply) {
    return NextResponse.json(
      { error: "The assistant is unavailable right now." },
      { status: 502 }
    );
  }
  return NextResponse.json({ reply });
}
