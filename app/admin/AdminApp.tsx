"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Inbox, FileText, Bot, LogOut, Trash2, MailOpen, Mail, RotateCcw,
} from "lucide-react";
import type { SiteContent, ChatbotSettings } from "../../lib/content";

type Inquiry = {
  id: string; ts: number; name: string; email: string;
  projectType: string; budget: string; message: string; read: boolean;
};

type Tab = "overview" | "inquiries" | "content" | "chatbot";

const TABS: { id: Tab; label: string; icon: typeof Inbox }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "inquiries", label: "Inquiries", icon: Inbox },
  { id: "content", label: "Site content", icon: FileText },
  { id: "chatbot", label: "Chatbot", icon: Bot },
];

export default function AdminApp() {
  const [tab, setTab] = useState<Tab>("overview");
  const [inquiries, setInquiries] = useState<Inquiry[] | null>(null);
  const [storage, setStorage] = useState(true);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [settings, setSettings] = useState<ChatbotSettings | null>(null);
  const router = useRouter();

  const loadInquiries = useCallback(async () => {
    const res = await fetch("/api/admin/inquiries");
    if (res.ok) {
      const d = await res.json();
      setInquiries(d.inquiries);
      setStorage(d.storage);
    }
  }, []);

  const loadContent = useCallback(async () => {
    const res = await fetch("/api/admin/content");
    if (res.ok) {
      const d = await res.json();
      setContent(d.content);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    const res = await fetch("/api/admin/chatbot");
    if (res.ok) {
      const d = await res.json();
      setSettings(d.settings);
    }
  }, []);

  useEffect(() => {
    loadInquiries();
    loadContent();
    loadSettings();
  }, [loadInquiries, loadContent, loadSettings]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  const unread = (inquiries || []).filter((i) => !i.read).length;

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <a className="admin-brand" href="/" target="_blank" rel="noopener noreferrer">
          abhinav<b>.</b>admin
        </a>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`admin-tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            <t.icon size={16} /> {t.label}
            {t.id === "inquiries" && unread > 0 && (
              <span style={{ marginLeft: "auto", background: "var(--grad)", borderRadius: 999, fontSize: 10.5, padding: "1px 8px", color: "#fff" }}>
                {unread}
              </span>
            )}
          </button>
        ))}
        <span className="spacer" />
        <button className="admin-tab admin-logout" onClick={logout}>
          <LogOut size={16} /> Log out
        </button>
      </aside>
      <main className="admin-main">
        {tab === "overview" && (
          <Overview inquiries={inquiries} unread={unread} storage={storage} settings={settings} go={setTab} />
        )}
        {tab === "inquiries" && (
          <Inquiries inquiries={inquiries} storage={storage} reload={loadInquiries} />
        )}
        {tab === "content" && content && (
          <ContentEditor content={content} setContent={setContent} storage={storage} />
        )}
        {tab === "chatbot" && settings && (
          <ChatbotEditor settings={settings} setSettings={setSettings} storage={storage} />
        )}
      </main>
    </div>
  );
}

function Overview({
  inquiries, unread, storage, settings, go,
}: {
  inquiries: Inquiry[] | null; unread: number; storage: boolean;
  settings: ChatbotSettings | null; go: (t: Tab) => void;
}) {
  const total = inquiries?.length ?? 0;
  const week = (inquiries || []).filter((i) => Date.now() - i.ts < 7 * 864e5).length;
  return (
    <>
      <h1>Overview</h1>
      <p className="page-sub">Everything about your site in one place.</p>
      <div className="admin-cards">
        <div className="admin-card"><b>{inquiries ? total : "…"}</b><span>total inquiries</span></div>
        <div className="admin-card"><b>{inquiries ? unread : "…"}</b><span>unread</span></div>
        <div className="admin-card"><b>{inquiries ? week : "…"}</b><span>this week</span></div>
        <div className="admin-card"><b>{settings ? (settings.enabled ? "On" : "Off") : "…"}</b><span>chatbot</span></div>
      </div>
      {!storage && (
        <div className="admin-panel">
          <h2>Storage not connected</h2>
          <p className="hint">
            Inquiries archive, content editing and chatbot settings need the KV store connected
            (KV_REST_API_URL / KV_REST_API_TOKEN env vars). The site and contact form still work;
            inquiries keep arriving by email.
          </p>
        </div>
      )}
      <div className="admin-panel">
        <h2>Latest inquiries</h2>
        <p className="hint">The five most recent - open Inquiries for the full list.</p>
        <div className="inq-list">
          {(inquiries || []).slice(0, 5).map((i) => (
            <div className={`inq-item ${i.read ? "" : "unread"}`} key={i.id}>
              <div className="inq-head">
                <b>{i.name}</b>
                <span className={`badge ${i.read ? "" : "new"}`}>{i.read ? i.projectType : "New"}</span>
              </div>
              <div className="inq-meta">
                <span>{i.projectType}</span>
                <span>{new Date(i.ts).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</span>
              </div>
            </div>
          ))}
          {inquiries && inquiries.length === 0 && <p className="admin-empty">No inquiries yet - they will show up here.</p>}
        </div>
        <div style={{ marginTop: 16 }}>
          <button className="admin-btn secondary small" onClick={() => go("inquiries")}>View all</button>
        </div>
      </div>
    </>
  );
}

function Inquiries({
  inquiries, storage, reload,
}: {
  inquiries: Inquiry[] | null; storage: boolean; reload: () => Promise<void>;
}) {
  const [busy, setBusy] = useState("");

  async function mark(id: string, read: boolean) {
    setBusy(id);
    await fetch("/api/admin/inquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, read }),
    });
    await reload();
    setBusy("");
  }

  async function remove(id: string) {
    if (!confirm("Delete this inquiry permanently?")) return;
    setBusy(id);
    await fetch("/api/admin/inquiries", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await reload();
    setBusy("");
  }

  return (
    <>
      <h1>Inquiries</h1>
      <p className="page-sub">
        Every form submission, newest first. They also arrive in your Gmail.
        {!storage && " (storage not connected - archive unavailable)"}
      </p>
      <div className="inq-list">
        {(inquiries || []).map((i) => (
          <div className={`inq-item ${i.read ? "" : "unread"}`} key={i.id}>
            <div className="inq-head">
              <b>{i.name}</b>
              <span className={`badge ${i.read ? "" : "new"}`}>{i.read ? i.projectType : "New"}</span>
            </div>
            <div className="inq-meta">
              <a href={`mailto:${i.email}`}>{i.email}</a>
              <span>{i.projectType}</span>
              <span>{i.budget}</span>
              <span>{new Date(i.ts).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</span>
            </div>
            <div className="inq-msg">{i.message}</div>
            <div className="inq-actions">
              <a className="admin-btn small" href={`mailto:${i.email}?subject=Re: ${encodeURIComponent(i.projectType)} inquiry`}>
                Reply
              </a>
              <button className="admin-btn secondary small" disabled={busy === i.id} onClick={() => mark(i.id, !i.read)}>
                {i.read ? <><Mail size={13} /> Mark unread</> : <><MailOpen size={13} /> Mark read</>}
              </button>
              <button className="admin-btn danger small" disabled={busy === i.id} onClick={() => remove(i.id)}>
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        ))}
        {inquiries && inquiries.length === 0 && (
          <p className="admin-empty">No inquiries yet. Share your site - they will land here and in your Gmail.</p>
        )}
        {inquiries === null && <p className="admin-empty">Loading…</p>}
      </div>
    </>
  );
}

function ContentEditor({
  content, setContent, storage,
}: {
  content: SiteContent; setContent: (c: SiteContent) => void; storage: boolean;
}) {
  const [state, setState] = useState<"idle" | "saving" | "ok" | "err">("idle");

  function patch(fn: (c: SiteContent) => SiteContent) {
    setContent(fn(JSON.parse(JSON.stringify(content))));
    setState("idle");
  }

  async function save() {
    setState("saving");
    const res = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setState(res.ok ? "ok" : "err");
  }

  async function reset() {
    if (!confirm("Reset ALL content back to the original defaults?")) return;
    const res = await fetch("/api/admin/content");
    const d = await res.json();
    setContent(d.defaults);
    setState("idle");
  }

  const tags = (arr: string[]) => arr.join(", ");
  const untags = (s: string) => s.split(",").map((t) => t.trim()).filter(Boolean);

  return (
    <>
      <h1>Site content</h1>
      <p className="page-sub">
        Edit what the site says. Changes go live within seconds of saving.
        {!storage && " (storage not connected - saving will fail)"}
      </p>

      <div className="admin-panel">
        <h2>Hero</h2>
        <p className="hint">The top of the page visitors see first.</p>
        <div className="admin-field">
          <span>Availability badge</span>
          <input value={content.hero.availability} onChange={(e) => patch((c) => ({ ...c, hero: { ...c.hero, availability: e.target.value } }))} />
        </div>
        <div className="admin-row2">
          <div className="admin-field">
            <span>I build… (1)</span>
            <input value={content.hero.roleA} onChange={(e) => patch((c) => ({ ...c, hero: { ...c.hero, roleA: e.target.value } }))} />
          </div>
          <div className="admin-field">
            <span>…and (2)</span>
            <input value={content.hero.roleB} onChange={(e) => patch((c) => ({ ...c, hero: { ...c.hero, roleB: e.target.value } }))} />
          </div>
        </div>
        <div className="admin-field">
          <span>Intro line</span>
          <textarea value={content.hero.sub} onChange={(e) => patch((c) => ({ ...c, hero: { ...c.hero, sub: e.target.value } }))} />
        </div>
      </div>

      <div className="admin-panel">
        <h2>Services</h2>
        <p className="hint">The four service cards.</p>
        {content.services.map((s, i) => (
          <div className="content-editor-item" key={i}>
            <div className="ce-head"><b>Service {i + 1}</b></div>
            <div className="admin-field">
              <span>Title</span>
              <input value={s.title} onChange={(e) => patch((c) => { c.services[i].title = e.target.value; return c; })} />
            </div>
            <div className="admin-field">
              <span>Description</span>
              <textarea value={s.desc} onChange={(e) => patch((c) => { c.services[i].desc = e.target.value; return c; })} />
            </div>
            <div className="admin-field">
              <span>Tags (comma separated)</span>
              <input value={tags(s.tags)} onChange={(e) => patch((c) => { c.services[i].tags = untags(e.target.value); return c; })} />
            </div>
          </div>
        ))}
      </div>

      <div className="admin-panel">
        <h2>Projects</h2>
        <p className="hint">Work cards. Image stays as-is per project; edit text and links here.</p>
        {content.projects.map((p, i) => (
          <div className="content-editor-item" key={i}>
            <div className="ce-head"><b>{p.name || `Project ${i + 1}`}</b></div>
            <div className="admin-row2">
              <div className="admin-field">
                <span>Name</span>
                <input value={p.name} onChange={(e) => patch((c) => { c.projects[i].name = e.target.value; return c; })} />
              </div>
              <div className="admin-field">
                <span>Category</span>
                <input value={p.cat} onChange={(e) => patch((c) => { c.projects[i].cat = e.target.value; return c; })} />
              </div>
            </div>
            <div className="admin-field">
              <span>Description</span>
              <textarea value={p.desc} onChange={(e) => patch((c) => { c.projects[i].desc = e.target.value; return c; })} />
            </div>
            <div className="admin-row2">
              <div className="admin-field">
                <span>Tags (comma separated)</span>
                <input value={tags(p.tags)} onChange={(e) => patch((c) => { c.projects[i].tags = untags(e.target.value); return c; })} />
              </div>
              <div className="admin-field">
                <span>Link</span>
                <input value={p.href} onChange={(e) => patch((c) => { c.projects[i].href = e.target.value; return c; })} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-panel">
        <h2>Ventures</h2>
        <p className="hint">Startup & agency cards.</p>
        {content.ventures.map((v, i) => (
          <div className="content-editor-item" key={i}>
            <div className="ce-head"><b>{v.title || `Venture ${i + 1}`}</b></div>
            <div className="admin-row2">
              <div className="admin-field">
                <span>Kicker</span>
                <input value={v.kicker} onChange={(e) => patch((c) => { c.ventures[i].kicker = e.target.value; return c; })} />
              </div>
              <div className="admin-field">
                <span>Title</span>
                <input value={v.title} onChange={(e) => patch((c) => { c.ventures[i].title = e.target.value; return c; })} />
              </div>
            </div>
            <div className="admin-field">
              <span>Description</span>
              <textarea value={v.desc} onChange={(e) => patch((c) => { c.ventures[i].desc = e.target.value; return c; })} />
            </div>
            <div className="admin-field">
              <span>Points (comma separated)</span>
              <textarea value={tags(v.points)} onChange={(e) => patch((c) => { c.ventures[i].points = untags(e.target.value); return c; })} />
              <span className="tags-input-hint">Separate each point with a comma.</span>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-panel">
        <h2>Now</h2>
        <p className="hint">The "what I'm up to" items.</p>
        {content.now.map((n, i) => (
          <div className="content-editor-item" key={i}>
            <div className="admin-field">
              <span>Title</span>
              <input value={n.t} onChange={(e) => patch((c) => { c.now[i].t = e.target.value; return c; })} />
            </div>
            <div className="admin-field">
              <span>Description</span>
              <textarea value={n.d} onChange={(e) => patch((c) => { c.now[i].d = e.target.value; return c; })} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", position: "sticky", bottom: 16 }}>
        <button className="admin-btn" onClick={save} disabled={state === "saving"}>
          {state === "saving" ? "Saving…" : "Save all changes"}
        </button>
        <button className="admin-btn secondary" onClick={reset}>
          <RotateCcw size={14} /> Reset to defaults
        </button>
        {state === "ok" && <span className="admin-msg ok">Saved - live on the site now.</span>}
        {state === "err" && <span className="admin-msg err">Save failed - is storage connected?</span>}
      </div>
    </>
  );
}

function ChatbotEditor({
  settings, setSettings, storage,
}: {
  settings: ChatbotSettings; setSettings: (s: ChatbotSettings) => void; storage: boolean;
}) {
  const [state, setState] = useState<"idle" | "saving" | "ok" | "err">("idle");

  async function save(next?: ChatbotSettings) {
    const s = next || settings;
    setState("saving");
    const res = await fetch("/api/admin/chatbot", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: s }),
    });
    setState(res.ok ? "ok" : "err");
  }

  function toggle(enabled: boolean) {
    const next = { ...settings, enabled };
    setSettings(next);
    save(next);
  }

  return (
    <>
      <h1>Chatbot</h1>
      <p className="page-sub">Control the AI assistant on your site.</p>

      <div className="admin-panel">
        <h2>Status</h2>
        <p className="hint">Turn the assistant on or off for all visitors.</p>
        <div className="toggle-row">
          <div className="t-label">
            <b>Assistant enabled</b>
            <span>When off, the chat button disappears from the site.</span>
          </div>
          <label className="switch">
            <input type="checkbox" checked={settings.enabled} onChange={(e) => toggle(e.target.checked)} />
            <span className="track" />
          </label>
        </div>
      </div>

      <div className="admin-panel">
        <h2>Personality & knowledge</h2>
        <p className="hint">
          The assistant already knows your public portfolio info. Add anything extra here -
          e.g. &quot;currently booking for November&quot; or &quot;prefer WhatsApp for urgent queries&quot;.
          It still cannot share private details.
        </p>
        <div className="admin-field">
          <span>First message (greeting)</span>
          <textarea
            value={settings.greeting}
            onChange={(e) => { setSettings({ ...settings, greeting: e.target.value }); setState("idle"); }}
          />
        </div>
        <div className="admin-field">
          <span>Extra instructions</span>
          <textarea
            style={{ minHeight: 110 }}
            placeholder="Example: I'm on exam break till Oct 5, replies may take 2 days."
            value={settings.extraInstructions}
            onChange={(e) => { setSettings({ ...settings, extraInstructions: e.target.value }); setState("idle"); }}
          />
        </div>
        <div className="admin-field">
          <span>Message shown when assistant is off</span>
          <input
            value={settings.disabledMessage}
            onChange={(e) => { setSettings({ ...settings, disabledMessage: e.target.value }); setState("idle"); }}
          />
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button className="admin-btn" onClick={() => save()} disabled={state === "saving" || !storage}>
            {state === "saving" ? "Saving…" : "Save chatbot settings"}
          </button>
          {state === "ok" && <span className="admin-msg ok">Saved.</span>}
          {state === "err" && <span className="admin-msg err">Save failed - is storage connected?</span>}
        </div>
      </div>
    </>
  );
}
