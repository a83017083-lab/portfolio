"use client";

import { useState } from "react";

const TYPES = [
  "Business website",
  "AI automation (n8n)",
  "WhatsApp / Instagram automation",
  "Coaching centre system",
  "Something else",
];

const BUDGETS = ["Under ₹5,000", "₹5,000 - ₹15,000", "₹15,000 - ₹50,000", "Not sure yet"];

type State = "idle" | "sending" | "done" | "error";

export default function InquiryForm() {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "sending") return;
    const f = new FormData(e.currentTarget);
    const payload = {
      name: String(f.get("name") || ""),
      email: String(f.get("email") || ""),
      projectType: String(f.get("projectType") || ""),
      budget: String(f.get("budget") || ""),
      message: String(f.get("message") || ""),
      company: String(f.get("company") || ""), // honeypot
    };
    // honeypot: bots fill hidden fields - pretend success, send nothing
    if (payload.company) {
      setState("done");
      return;
    }
    setState("sending");
    setError("");
    try {
      const res = await fetch("https://formsubmit.co/ajax/74b4436968c5e3cace33c7040d07e091", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `New project inquiry: ${payload.projectType} - ${payload.name}`,
          _template: "table",
          _captcha: "false",
          _replyto: payload.email,
          name: payload.name,
          email: payload.email,
          project_type: payload.projectType,
          budget: payload.budget || "Not specified",
          message: payload.message,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success === "true") {
        setState("done");
      } else {
        setError("Something went wrong - please email a83017083@gmail.com directly.");
        setState("error");
      }
    } catch {
      setError("Network issue - please try again, or email a83017083@gmail.com directly.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="form-done">
        <span className="tick">✓</span>
        <h3>Got it - thank you!</h3>
        <p>
          Your project details just landed in Abhinav&apos;s inbox. He replies personally,
          usually within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form className="inq-form" onSubmit={onSubmit}>
      <div className="inq-row">
        <label>
          Your name *
          <input name="name" required minLength={2} maxLength={80} placeholder="Rahul Sharma" />
        </label>
        <label>
          Email *
          <input name="email" type="email" required placeholder="you@example.com" />
        </label>
      </div>
      <div className="inq-row">
        <label>
          What do you need? *
          <select name="projectType" required defaultValue="">
            <option value="" disabled>
              Choose one
            </option>
            {TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          Budget (optional)
          <select name="budget" defaultValue="">
            <option value="">Not specified</option>
            {BUDGETS.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        Tell me about your project *
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          placeholder="What are you building, who is it for, and when do you need it?"
        />
      </label>
      {/* honeypot - hidden from humans */}
      <input
        name="company"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        className="hp"
        aria-hidden="true"
      />
      {state === "error" && <p className="form-error">{error}</p>}
      <button className="btn btn-primary inq-submit" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Send project details →"}
      </button>
      <p className="inq-note">
        Goes straight to Abhinav&apos;s inbox - he reads and replies himself.
      </p>
    </form>
  );
}
