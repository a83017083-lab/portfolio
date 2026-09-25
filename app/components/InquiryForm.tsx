"use client";

import { useState } from "react";

const TYPES = [
  "Business website",
  "AI automation (n8n)",
  "WhatsApp / Instagram automation",
  "Coaching centre system",
  "Something else",
  "Demo call request",
];

const BUDGETS = ["Under ₹5,000", "₹5,000 - ₹15,000", "₹15,000 - ₹50,000", "Not sure yet"];

type State = "idle" | "sending" | "done" | "error";

export default function InquiryForm() {
  const [step,setStep]=useState(1);
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");
  const [savedOnly,setSavedOnly]=useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "sending") return;
    const form=e.currentTarget;
    const f = new FormData(form);
    const payload = {
      name: String(f.get("name") || ""),
      email: String(f.get("email") || ""),
      projectType: String(f.get("projectType") || ""),
      budget: String(f.get("budget") || ""),
      message: [String(f.get("message") || ""), f.get("timeline") ? `Timeline: ${String(f.get("timeline"))}` : ""].filter(Boolean).join("\n"),
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
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setSavedOnly(data.savedOnly===true);
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
        <h3>{savedOnly?"Saved, but email delivery is unconfirmed":"Got it - thank you!"}</h3>
        <p>{savedOnly?"Your request is saved privately, but we could not confirm the email notification. If it is time-sensitive, email a83017083@gmail.com directly. This is not a confirmed booking.":"Your request has been sent. This is not a confirmed booking; Abhinav will reply to arrange a time."}</p>
      </div>
    );
  }

  return (
    <form className="inq-form" onSubmit={onSubmit}>
      <p className="v2-form-step">Step {step} of 2: {step===1?"Your contact and project":"A little more detail"}</p>
      <div style={{display:step===1?"block":"none"}}>
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
      </div>
      <div style={{display:step===2?"block":"none"}}>
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
      <label>When would you like to start? (optional)
        <select name="timeline"><option value="">Not sure yet</option><option>As soon as possible</option><option>In the next month</option><option>Flexible</option></select>
      </label>
      </div>
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
      {step===1 ? <button className="btn btn-primary inq-submit" type="button" onClick={(e)=>{const form=e.currentTarget.form;if(form){const required=Array.from(form.querySelectorAll<HTMLInputElement|HTMLSelectElement>("input[name=name],input[name=email],select[name=projectType]"));if(required.every(el=>el.reportValidity()))setStep(2)}}}>Next: describe your project →</button> : <button className="btn btn-ghost" type="button" onClick={()=>setStep(1)}>← Back</button>}
      {step===2 && <button className="btn btn-primary inq-submit" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Send project details →"}
      </button>}
      <p className="inq-note">
        Sends an inquiry to Abhinav. It does not reserve a call time.
      </p>
    </form>
  );
}
