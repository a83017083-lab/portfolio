"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, SendHorizonal, Sparkles } from "lucide-react";
import { getSid } from "../../lib/sid";

type Msg = { role: "user" | "assistant"; content: string };

const FALLBACK =
  "Sorry, I'm having trouble right now. You can reach Abhinav directly at a83017083@gmail.com.";

export default function ChatWidget({ greeting, enabled }: { greeting: string; enabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "assistant", content: greeting }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy, open]);

  if (!enabled) return null;

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
        body: JSON.stringify({ message: text, history: next.slice(-13, -1), sid: getSid() }),
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        setMsgs([...next, { role: "assistant", content: data.reply }]);
      } else {
        setMsgs([...next, { role: "assistant", content: data.error || FALLBACK }]);
      }
    } catch {
      setMsgs([...next, { role: "assistant", content: FALLBACK }]);
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
        {open ? <X size={22} /> : <MessageCircle size={23} />}
      </button>
      {open && (
        <div className="chat-panel" role="dialog" aria-label="Chat with AI assistant">
          <div className="chat-head">
            <span className="chat-avatar"><Sparkles size={17} /></span>
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
              <SendHorizonal size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
