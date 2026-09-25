// Lead scoring: AI first (existing free Gemini/OpenRouter keys), rule-based fallback.
import { kvGet, kvSet } from "./kv";

export type LeadScore = "hot" | "warm" | "cold";

export interface LeadAssessment {
  score: LeadScore;
  reason: string;
  scorer?: "jev" | "gemini" | "openrouter" | "rules";
}

const HOT_WORDS = ["urgent", "asap", "immediately", "this week", "right away", "jaldi", "turant", "ready to pay", "budget approved", "hire", "start now"];
const COLD_SIGNS = ["just curious", "sometime later", "no budget", "free mein", "for free", "student project help"];

function ruleScore(projectType: string, budget: string, message: string): LeadAssessment {
  const text = `${projectType} ${budget} ${message}`.toLowerCase();
  const hasMoney = /(\$\s?\d|₹\s?\d|\d+\s?(k|inr|usd|dollars|rupees))|(\d{4,})/i.test(budget) && !/not specified|no budget/i.test(budget);
  const urgent = HOT_WORDS.some((w) => text.includes(w));
  const cold = COLD_SIGNS.some((w) => text.includes(w)) || message.trim().length < 25;
  if (cold && !hasMoney && !urgent) return { score: "cold", reason: "Vague or very short inquiry with no budget signal." };
  if ((hasMoney && urgent) || (hasMoney && message.length > 120)) return { score: "hot", reason: "Clear budget and strong intent in the message." };
  if (hasMoney) return { score: "hot", reason: "Budget mentioned - serious buyer signal." };
  if (urgent) return { score: "warm", reason: "Urgent timeline but no budget mentioned." };
  return { score: "warm", reason: "Genuine inquiry, needs a conversation to qualify." };
}


// Jev AI (jev-ai.pro) typed-question scoring - primary when JEV_API_KEY is set.
// Not OpenAI-compatible: POST {state, model, questions} -> typed answers.
async function jevScore(projectType: string, budget: string, message: string): Promise<LeadAssessment | null> {
  const key = process.env.JEV_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://jev-ai.pro/api/v1/systemone", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        state: `Service requested: ${projectType}\nBudget stated: ${budget}\nMessage: ${message}`,
        model: "jev-latest",
        questions: {
          fit: {
            type: "choice",
            instructions: "How strong is this sales inquiry for a freelance web developer?",
            criteria: {
              hot: "Clear budget or strong buying intent; ready to hire soon",
              warm: "Genuine inquiry but unqualified, early, or unclear budget",
              cold: "Vague, freebie-seeking, spam, or not serious",
            },
          },
        },
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const a = data?.answers?.fit;
    const choice = a?.choice;
    if (choice === "hot" || choice === "warm" || choice === "cold") {
      const conf = typeof a?.confidence === "number" ? Math.round(a.confidence * 100) : null;
      const probs = a?.probabilities ? ` (hot ${Math.round((a.probabilities.hot ?? 0) * 100)}%, warm ${Math.round((a.probabilities.warm ?? 0) * 100)}%, cold ${Math.round((a.probabilities.cold ?? 0) * 100)}%)` : "";
      return { score: choice, reason: `Jev AI typed-decision score${conf !== null ? `, ${conf}% confidence` : ""}${probs}.`, scorer: "jev" };
    }
  } catch {
    // fall through to Gemini/OpenRouter
  }
  return null;
}

async function aiScore(projectType: string, budget: string, message: string): Promise<LeadAssessment | null> {
  const prompt = `You score leads for a freelance web developer. Reply with ONLY compact JSON like {"score":"hot","reason":"one short sentence"}. score is one of hot, warm, cold. hot = clear budget or strong buying intent; warm = genuine but unqualified; cold = vague, freebie-seeking, or spam.`;
  const content = `Service: ${projectType}\nBudget: ${budget}\nMessage: ${message}`;
  const gkey = process.env.GEMINI_API_KEY;
  if (gkey) {
    const models = ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.1-flash-lite"];
    for (const model of models) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${gkey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: prompt }] },
            contents: [{ role: "user", parts: [{ text: content }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 120 },
          }),
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) continue;
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("").trim();
        const parsed = parseScore(text);
        if (parsed) return { ...parsed, scorer: "gemini" };
      } catch {
        // next model
      }
    }
  }
  const okey = process.env.OPENROUTER_API_KEY;
  if (okey) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${okey}` },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || "openai/gpt-oss-20b:free",
          messages: [{ role: "system", content: prompt }, { role: "user", content }],
          max_tokens: 120,
          temperature: 0.2,
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const data = await res.json();
        const parsed = parseScore(data?.choices?.[0]?.message?.content?.trim());
        if (parsed) return { ...parsed, scorer: "openrouter" };
      }
    } catch {
      // fall through
    }
  }
  return null;
}

function parseScore(text: string | undefined | null): LeadAssessment | null {
  if (!text) return null;
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    const j = JSON.parse(m[0]) as { score?: string; reason?: string };
    if (j.score === "hot" || j.score === "warm" || j.score === "cold") {
      return { score: j.score, reason: (j.reason || "").slice(0, 160) || "AI assessment." };
    }
  } catch {
    // ignore
  }
  return null;
}

export async function scoreLead(projectType: string, budget: string, message: string): Promise<LeadAssessment> {
  const jev = await jevScore(projectType, budget, message);
  if (jev) return jev;
  const ai = await aiScore(projectType, budget, message);
  if (ai) return ai;
  return { ...ruleScore(projectType, budget, message), scorer: "rules" };
}

// ---- n8n webhook integration setting ----
const INT_KEY = "integrations:v1";

export async function getWebhookUrl(): Promise<string> {
  const rec = await kvGet<{ n8nWebhookUrl?: string }>(INT_KEY);
  return rec?.n8nWebhookUrl || "";
}

export async function setWebhookUrl(url: string): Promise<void> {
  await kvSet(INT_KEY, { n8nWebhookUrl: url });
}

export async function fireLeadWebhook(payload: unknown): Promise<void> {
  const url = await getWebhookUrl();
  if (!url || !/^https:\/\//.test(url)) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(6000),
    });
  } catch (e) {
    console.error("n8n webhook failed", e);
  }
}
