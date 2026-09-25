"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const WELCOME =
  "Hey! I'm the AI assistant on Abhinav's site. Ask me anything about his work, projects or services - or how to start a project with him.";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "assistant", content: WELCOME }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy, open]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const next = [...msgs, { role: "user" as const, content: text }];
    setMsgs(next);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: next.slice(-13, -1) }),
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        setMsgs([...next, { role: "assistant", content: data.reply }]);
      } else {
        setMsgs([
          ...next,
          {
            role: "assistant",
            content:
              "Sorry, I'm having trouble right now. You can reach Abhinav directly at a83017083@gmail.com.",
          },
        ]);
      }
    } catch {
      setMsgs([
        ...next,
        {
          role: "assistant",
          content:
            "Sorry, I'm having trouble right now. You can reach Abhinav directly at a83017083@gmail.com.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        className="chat-fab"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? "✕" : "✦"}
      </button>
      {open && (
        <div className="chat-panel">
          <div className="chat-head">
            <div>
              <b>Ask me anything</b>
              <span>AI assistant · knows Abhinav&apos;s work</span>
            </div>
          </div>
          <div className="chat-body" ref={listRef}>
            {msgs.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}>
                {m.content}
              </div>
            ))}
            {busy && <div className="chat-msg assistant chat-typing">Typing…</div>}
          </div>
          <div className="chat-input-row">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type your message…"
              maxLength={1000}
              aria-label="Chat message"
            />
            <button onClick={send} disabled={busy || !input.trim()} aria-label="Send">
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
