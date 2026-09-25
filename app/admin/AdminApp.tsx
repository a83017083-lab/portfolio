"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Inbox, FileText, Bot, LogOut, Trash2, MailOpen, Mail, RotateCcw,
} from "lucide-react";
import type { SiteContent, ChatbotSettings } from "../../lib/content";
import AdminTheme from "../components/AdminTheme";

type Inquiry = {
  id: string; ts: number; name: string; email: string;
  projectType: string; budget: string; message: string; read: boolean;
  score?: "hot" | "warm" | "cold"; scoreReason?: string;
  status?: "new" | "replied" | "won" | "lost";
  notes?: string; followUpAt?: string; tags?: string[];
};

type Tab = "overview" | "inquiries" | "content" | "chatbot" | "publishing" | "pipeline" | "newsletter" | "coupons" | "activity" | "backup" | "followups" | "clients";

const TABS: { id: Tab; label: string; icon: typeof Inbox }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "inquiries", label: "Inquiries", icon: Inbox },
  { id: "pipeline", label: "Pipeline", icon: LayoutDashboard },
  { id: "followups", label: "Follow-ups", icon: RotateCcw },
  { id: "clients", label: "Client portal", icon: FileText },
  { id: "content", label: "Site content", icon: FileText },
  { id: "publishing", label: "Publishing", icon: FileText },
  { id: "newsletter", label: "Newsletter", icon: Mail },
  { id: "coupons", label: "Coupons", icon: FileText },
  { id: "activity", label: "Activity", icon: RotateCcw },
  { id: "backup", label: "Backup", icon: FileText },
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
        <AdminTheme/>
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
        {tab === "pipeline" && <Pipeline inquiries={inquiries} reload={loadInquiries} />}
        {tab === "followups" && <FollowupCalendar inquiries={inquiries}/>}
        {tab === "clients" && <ClientsAdmin/>}
        {tab === "content" && content && (
          <ContentEditor content={content} setContent={setContent} storage={storage} />
        )}
        {tab === "publishing" && content && (
          <PublishingEditor content={content} setContent={setContent} storage={storage} />
        )}
        {tab === "newsletter" && <NewsletterAdmin/>}
        {tab === "coupons" && <CouponsAdmin/>}
        {tab === "activity" && <ActivityAdmin/>}
        {tab === "backup" && <BackupAdmin/>}
        {tab === "chatbot" && settings && (
          <>
            <ChatbotEditor settings={settings} setSettings={setSettings} storage={storage} />
            <ChatViewer />
          <ChatQuestions />
          </>
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
  const due = (inquiries || []).filter(i => i.followUpAt && i.followUpAt <= new Date().toLocaleDateString("en-CA", {timeZone:"Asia/Kolkata"}) && !["won","lost"].includes(i.status || "new"));
  const [stats, setStats] = useState<{ pageviews: number; visitors: number; chatSessions: number; chatMessages: number } | null>(null);
  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then((d) => {
      if (typeof d.pageviews === "number") setStats(d);
    }).catch(() => {});
  }, []);
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
      <div className="admin-cards">
        <div className="admin-card"><b>{stats ? stats.pageviews : "…"}</b><span>page views</span></div>
        <div className="admin-card"><b>{stats ? stats.visitors : "…"}</b><span>unique visitors</span></div>
        <div className="admin-card"><b>{stats ? stats.chatSessions : "…"}</b><span>chat sessions</span></div>
        <div className="admin-card"><b>{stats ? stats.chatMessages : "…"}</b><span>chat questions</span></div>
      </div>
      {due.length > 0 && <div className="admin-panel"><h2>Follow-ups due ({due.length})</h2><p className="hint">Shown in admin. A daily email reminder is configured once the new deployment is active.</p>{due.map(i=><p key={i.id}>{i.name} · {i.followUpAt} · {i.projectType}</p>)}<button className="admin-btn secondary small" onClick={() => go("inquiries")}>Open inquiries</button></div>}
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
      <div className="admin-panel"><h2>This week's snapshot</h2><p className="hint">{week} inquiries, {(inquiries || []).filter(i => i.score === "hot" && Date.now()-i.ts < 7*864e5).length} hot leads and {stats?.pageviews ?? "…"} total page views. A weekly email is configured for Monday mornings after deployment.</p></div>
      <AnalyticsChart/>
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
  const [fScore, setFScore] = useState("");
  const [fService, setFService] = useState("");
  const [fBudget, setFBudget] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fFrom, setFFrom] = useState("");
  const [fTo, setFTo] = useState("");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");
  const [copied, setCopied] = useState(false);
  const [webhook, setWebhook] = useState<string | null>(null);
  const [whState, setWhState] = useState<"idle" | "saving" | "ok" | "err">("idle");

  useEffect(() => {
    fetch("/api/admin/integrations").then((r) => r.json()).then((d) => {
      if (typeof d.n8nWebhookUrl === "string") setWebhook(d.n8nWebhookUrl);
    }).catch(() => setWebhook(""));
  }, []);

  async function saveWebhook() {
    setWhState("saving");
    const res = await fetch("/api/admin/integrations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ n8nWebhookUrl: webhook || "" }),
    });
    setWhState(res.ok ? "ok" : "err");
  }

  async function patch(id: string, body: Record<string, unknown>) {
    setBusy(id);
    await fetch("/api/admin/inquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...body }),
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

  const services = Array.from(new Set((inquiries || []).map((i) => i.projectType))).sort();
  const budgets = Array.from(new Set((inquiries || []).map((i) => i.budget))).sort();
  const filtered = (inquiries || []).filter((i) => {
    if (fScore && i.score !== fScore) return false;
    if (fService && i.projectType !== fService) return false;
    if (fBudget && i.budget !== fBudget) return false;
    if (fStatus && (i.status || "new") !== fStatus) return false;
    if (fFrom && i.ts < new Date(fFrom).getTime()) return false;
    if (fTo && i.ts > new Date(fTo).getTime() + 864e5 - 1) return false;
    if (q) {
      const hay = `${i.name} ${i.email} ${i.message} ${i.projectType}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  const ordered = [...filtered].sort((a,b) => sort === "oldest" ? a.ts-b.ts : sort === "score" ? ({hot:0,warm:1,cold:2}[a.score || "cold"] - {hot:0,warm:1,cold:2}[b.score || "cold"]) : b.ts-a.ts);

  return (
    <>
      <h1>Inquiries</h1>
      <p className="page-sub">
        Every form submission, newest first, with AI lead score. They also arrive in your Gmail.
        {!storage && " (storage not connected - archive unavailable)"}
      </p>

      <div className="admin-panel">
        <h2>n8n webhook</h2>
        <p className="hint">Every new lead is POSTed here as JSON (with its score) for your n8n follow-up automation. Leave empty to disable.</p>
        <div className="field-row">
          <input
            type="url"
            placeholder="https://your-n8n.host/webhook/…"
            value={webhook ?? ""}
            onChange={(e) => { setWebhook(e.target.value); setWhState("idle"); }}
          />
          <button className="admin-btn small" onClick={saveWebhook} disabled={whState === "saving" || webhook === null}>
            {whState === "saving" ? "Saving…" : "Save"}
          </button>
          {whState === "ok" && <span className="save-ok">Saved</span>}
          {whState === "err" && <span className="form-error">Could not save</span>}
        </div>
      </div>

      <div className="lead-filters"><button className="admin-btn secondary small" onClick={() => {
        const quote = (x: unknown) => { const value = String(x ?? ""); const safe = /^[=+@\-\t\r]/.test(value) ? "\u0027" + value : value; return `"${safe.replace(/"/g, '""')}"`; };
        const rows = [["Date", "Name", "Email", "Service", "Budget", "Score", "Status", "Follow up", "Notes", "Message"], ...(inquiries || []).map(i => [new Date(i.ts).toISOString(),i.name,i.email,i.projectType,i.budget,i.score || "",i.status || "new",i.followUpAt || "",i.notes || "",i.message])];
        const csv = rows.map(row => row.map(quote).join(",")).join("\r\n");
        const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], {type:"text/csv;charset=utf-8"}));
        const a = document.createElement("a"); a.href = url; a.download = "portfolio-inquiries.csv"; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
      }}>Export CSV</button>
        <button className="admin-btn secondary small" onClick={async()=>{await navigator.clipboard.writeText("https://buildweth-abhinavk7852.vercel.app/contact");setCopied(true);setTimeout(()=>setCopied(false),2000)}}>{copied ? "Copied contact link" : "Copy contact link"}</button>
        <select value={sort} onChange={e=>setSort(e.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="score">Hot leads first</option></select>
        <input type="search" placeholder="Search name, email, message…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={fScore} onChange={(e) => setFScore(e.target.value)}>
          <option value="">All scores</option>
          <option value="hot">Hot</option>
          <option value="warm">Warm</option>
          <option value="cold">Cold</option>
        </select>
        <select value={fService} onChange={(e) => setFService(e.target.value)}>
          <option value="">All services</option>
          {services.map((sv) => <option key={sv} value={sv}>{sv}</option>)}
        </select>
        <select value={fBudget} onChange={(e) => setFBudget(e.target.value)}>
          <option value="">All budgets</option>
          {budgets.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="replied">Replied</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>
        <input type="date" value={fFrom} onChange={(e) => setFFrom(e.target.value)} title="From date" />
        <input type="date" value={fTo} onChange={(e) => setFTo(e.target.value)} title="To date" />
        {(fScore || fService || fBudget || fStatus || fFrom || fTo || q) && (
          <button className="admin-btn secondary small" onClick={() => { setFScore(""); setFService(""); setFBudget(""); setFStatus(""); setFFrom(""); setFTo(""); setQ(""); }}>
            Clear
          </button>
        )}
      </div>

      <div className="inq-list">
        {ordered.map((i) => (
          <div className={`inq-item ${i.read ? "" : "unread"}`} key={i.id}>
            <div className="inq-head">
              <b>{i.name}</b>
              <span className="inq-badges">
                {i.score && <span className={`score-badge ${i.score}`}>{i.score.toUpperCase()}</span>}
                <span className={`badge ${i.read ? "" : "new"}`}>{i.read ? i.projectType : "New"}</span>
              </span>
            </div>
            {i.scoreReason && <div className="score-reason">AI: {i.scoreReason}</div>}
            {i.message.length < 25 && <div className="score-reason" style={{color:"#fbbf24"}}>Review manually: short message may be spam or incomplete.</div>}
            <div className="inq-meta">
              <a href={`mailto:${i.email}`}>{i.email}</a>
              <span>{i.projectType}</span>
              <span>{i.budget}</span>
              <span>{new Date(i.ts).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</span>
            </div>
            <div className="inq-msg">{i.message}</div>
            <label className="admin-field" style={{margin:"12px 0"}}><span>Private tags (comma-separated)</span><input defaultValue={(i.tags||[]).join(", ")} key={`${i.id}-tags`} onBlur={e=>{const tags=e.target.value.split(",").map(x=>x.trim()).filter(Boolean).slice(0,10);if(JSON.stringify(tags)!==JSON.stringify(i.tags||[]))patch(i.id,{tags})}} placeholder="priority, callback, website…"/></label>
            <div className="admin-row2" style={{margin:"14px 0"}}>
              <label className="admin-field"><span>Private notes</span><textarea defaultValue={i.notes || ""} key={`${i.id}-notes`} onBlur={e => { if (e.target.value !== (i.notes || "")) patch(i.id, { notes: e.target.value }); }} placeholder="Call summary, next step…" /></label>
              <label className="admin-field"><span>Follow-up date (shown in admin when due)</span><input type="date" value={i.followUpAt || ""} onChange={e => patch(i.id, { followUpAt: e.target.value })} /></label>
            </div>
            <div className="inq-actions">
              <a className="admin-btn small" href={`mailto:${i.email}?subject=Re: ${encodeURIComponent(i.projectType)} inquiry`}>
                Reply
              </a>
              <select
                className="status-select"
                value={i.status || "new"}
                disabled={busy === i.id}
                onChange={(e) => patch(i.id, { status: e.target.value, read: true })}
              >
                <option value="new">New</option>
                <option value="replied">Replied</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
              <button className="admin-btn secondary small" disabled={busy === i.id} onClick={() => patch(i.id, { read: !i.read })}>
                {i.read ? <><Mail size={13} /> Mark unread</> : <><MailOpen size={13} /> Mark read</>}
              </button>
              <button className="admin-btn danger small" disabled={busy === i.id} onClick={() => remove(i.id)}>
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        ))}
        {inquiries && filtered.length === 0 && inquiries.length > 0 && (
          <p className="admin-empty">No inquiries match these filters.</p>
        )}
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

      <div className="admin-panel"><h2>Home announcement</h2><p className="hint">Leave blank to hide the site-wide bar.</p><input value={content.announcement || ""} onChange={e => patch(c => ({...c, announcement:e.target.value}))} /></div>
      <div className="admin-panel">
        <h2>Projects</h2>
        <p className="hint">Add and edit work cards. Image paths use existing /images/ assets.</p>
        {content.projects.map((p, i) => (
          <div className="content-editor-item" key={i}>
            <div className="ce-head"><b>{p.name || `Project ${i + 1}`}</b><button className="admin-btn danger small" onClick={() => patch(c => { c.projects.splice(i,1); return c; })}>Remove</button></div>
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
              <div className="admin-field"><span>Image path</span><input value={p.img} onChange={e=>patch(c=>{c.projects[i].img=e.target.value; return c;})}/></div>
              <div className="admin-field">
                <span>Link</span>
                <input value={p.href} onChange={(e) => patch((c) => { c.projects[i].href = e.target.value; return c; })} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="admin-btn secondary" style={{marginBottom:24}} onClick={() => patch(c => ({...c,projects:[...c.projects,{name:"",cat:"Project",desc:"",tags:[],img:"/images/proj-edtech.jpg",href:""}]}))}>+ Add project</button>
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

interface ConvMeta {
  sid: string;
  started: number;
  lastTs: number;
  count: number;
  preview: string;
}
interface ConvMsg {
  role: "user" | "assistant";
  text: string;
  ts: number;
}

function ChatViewer() {
  const [convs, setConvs] = useState<ConvMeta[] | null>(null);
  const [active, setActive] = useState<string>("");
  const [msgs, setMsgs] = useState<ConvMsg[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/chats").then((r) => r.json()).then((d) => {
      if (Array.isArray(d.conversations)) setConvs(d.conversations);
    }).catch(() => setConvs([]));
  }, []);

  async function open(sid: string) {
    setActive(sid);
    setMsgs(null);
    const r = await fetch(`/api/admin/chats?sid=${encodeURIComponent(sid)}`);
    const d = await r.json();
    setMsgs(Array.isArray(d.messages) ? d.messages : []);
  }

  const fmt = (ts: number) => new Date(ts).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

  return (
    <div className="admin-panel" style={{ marginTop: 24 }}>
      <h2>Conversations</h2>
      <p className="hint">Every chatbot conversation, newest first. Visitors are anonymous - no IPs, only what they type.</p>
      <div className="chatapp">
        <div className="chatapp-list">
          {(convs || []).map((c) => (
            <button key={c.sid} className={`chatapp-item ${active === c.sid ? "active" : ""}`} onClick={() => open(c.sid)}>
              <span className="chatapp-avatar">{c.count}</span>
              <span className="chatapp-itemmain">
                <span className="chatapp-itemtop">
                  <b>Visitor {c.sid.slice(0, 4)}</b>
                  <span className="chatapp-time">{fmt(c.lastTs)}</span>
                </span>
                <span className="chatapp-preview">{c.preview}</span>
              </span>
            </button>
          ))}
          {convs && convs.length === 0 && <p className="admin-empty">No conversations yet.</p>}
          {convs === null && <p className="admin-empty">Loading…</p>}
        </div>
        <div className="chatapp-thread">
          {!active && <p className="admin-empty">Pick a conversation to read it.</p>}
          {active && msgs === null && <p className="admin-empty">Loading…</p>}
          {active && msgs && (
            <div className="chatapp-msgs">
              {msgs.map((m, i) => (
                <div key={i} className={`chatbubble ${m.role === "user" ? "them" : "bot"}`}>
                  <span className="chattext">{m.text}</span>
                  <span className="chattime">{m.role === "user" ? "Visitor" : "Abhinav AI"} · {fmt(m.ts)}</span>
                </div>
              ))}
              {msgs.length === 0 && <p className="admin-empty">Empty conversation.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PublishingEditor({content,setContent,storage}:{content:SiteContent;setContent:(c:SiteContent)=>void;storage:boolean}) {
  const [status,setStatus]=useState("");
  const patch=(fn:(c:SiteContent)=>void)=>{const c=JSON.parse(JSON.stringify(content)) as SiteContent; fn(c);setContent(c);setStatus("");};
  async function save(){setStatus("Saving…");const r=await fetch("/api/admin/content",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({content})});setStatus(r.ok?"Saved and live.":"Could not save. Check storage and try again.");}
  const regions=["IN","US","GB","EU","AE","CA","AU","SG","JP","OTHER"];
  return <><h1>Publishing</h1><p className="page-sub">Edit sample prices, journal notes and real reviews. Save to publish changes.</p>
    <div className="admin-panel"><h2>Business WhatsApp link</h2><p className="hint">Leave empty to hide. Enter only a public business WhatsApp URL, never a personal number.</p><input type="url" placeholder="https://wa.me/..." value={content.businessWhatsappUrl || ""} onChange={e=>patch(c=>{c.businessWhatsappUrl=e.target.value})}/></div>
    <div className="admin-panel"><h2>Demo call link</h2><p className="hint">An existing appointment booking page URL. Blank uses the inquiry form instead. Never paste a meeting room link here.</p><input type="url" placeholder="https://calendar.google.com/calendar/appointments/..." value={content.demoUrl || ""} onChange={e=>patch(c=>{c.demoUrl=e.target.value})}/></div>
    <div className="admin-panel"><h2>Sample pricing by region</h2><p className="hint">Public site labels prices Starting from. INR India, USD United States, GBP UK, EUR EU, AED UAE, CAD Canada, AUD Australia, SGD Singapore, JPY Japan, USD for other countries. These are sample figures, not promises.</p>
      {content.packages.map((p,i)=><div className="content-editor-item" key={i}><div className="ce-head"><b>Package {i+1}</b><button className="admin-btn danger small" onClick={()=>patch(c=>{c.packages.splice(i,1)})}>Remove</button></div><div className="admin-row2"><label className="admin-field"><span>Name</span><input value={p.name} onChange={e=>patch(c=>{c.packages[i].name=e.target.value})}/></label><label className="admin-field"><span>Description</span><input value={p.description} onChange={e=>patch(c=>{c.packages[i].description=e.target.value})}/></label></div><div className="admin-row2">{regions.map(r=><label className="admin-field" key={r}><span>{r} starting price</span><input value={p.regionalPrices?.[r] || ""} onChange={e=>patch(c=>{c.packages[i].regionalPrices={...c.packages[i].regionalPrices,[r]:e.target.value}})}/></label>)}</div><label className="admin-field"><span>Included (one per line)</span><textarea value={p.features.join("\n")} onChange={e=>patch(c=>{c.packages[i].features=e.target.value.split("\n")})}/></label><label><input type="checkbox" checked={p.published} onChange={e=>patch(c=>{c.packages[i].published=e.target.checked})}/> Published</label></div>)}<button className="admin-btn secondary small" onClick={()=>patch(c=>{c.packages.push({name:"New package",price:"",description:"",features:[],regionalPrices:{},published:false})})}>+ Add package</button></div>
    <div className="admin-panel"><h2>Testimonials</h2><p className="hint">Only publish a review with the real client's permission. Empty by default.</p>{content.testimonials.map((t,i)=><div className="content-editor-item" key={i}><div className="ce-head"><b>Review {i+1}</b><button className="admin-btn danger small" onClick={()=>patch(c=>{c.testimonials.splice(i,1)})}>Remove</button></div><label className="admin-field"><span>Exact quote</span><textarea value={t.quote} onChange={e=>patch(c=>{c.testimonials[i].quote=e.target.value})}/></label><div className="admin-row2"><label className="admin-field"><span>Name</span><input value={t.name} onChange={e=>patch(c=>{c.testimonials[i].name=e.target.value})}/></label><label className="admin-field"><span>Role</span><input value={t.role} onChange={e=>patch(c=>{c.testimonials[i].role=e.target.value})}/></label></div><label><input type="checkbox" checked={t.published} onChange={e=>patch(c=>{c.testimonials[i].published=e.target.checked})}/> Publish verified review</label></div>)}<button className="admin-btn secondary small" onClick={()=>patch(c=>{c.testimonials.push({quote:"",name:"",role:"",published:false})})}>+ Add review</button></div>
    <div className="admin-panel"><h2>FAQ</h2><p className="hint">Add real answers; public entries appear on the FAQ page.</p>{content.faqs.map((f,i)=><div className="content-editor-item" key={i}><div className="ce-head"><b>Question {i+1}</b><button className="admin-btn danger small" onClick={()=>patch(c=>{c.faqs.splice(i,1)})}>Remove</button></div><label className="admin-field"><span>Question</span><input value={f.question} onChange={e=>patch(c=>{c.faqs[i].question=e.target.value})}/></label><label className="admin-field"><span>Answer</span><textarea value={f.answer} onChange={e=>patch(c=>{c.faqs[i].answer=e.target.value})}/></label><label><input type="checkbox" checked={f.published} onChange={e=>patch(c=>{c.faqs[i].published=e.target.checked})}/> Published</label></div>)}<button className="admin-btn secondary small" onClick={()=>patch(c=>{c.faqs.push({question:"",answer:"",published:false})})}>+ Add question</button></div>
    <div className="admin-panel"><h2>Journal</h2>{content.posts.map((p,i)=><div className="content-editor-item" key={i}><div className="ce-head"><b>Note {i+1}</b><button className="admin-btn danger small" onClick={()=>patch(c=>{c.posts.splice(i,1)})}>Remove</button></div><div className="admin-row2"><label className="admin-field"><span>Title</span><input value={p.title} onChange={e=>patch(c=>{c.posts[i].title=e.target.value})}/></label><label className="admin-field"><span>Date</span><input type="date" value={p.date} onChange={e=>patch(c=>{c.posts[i].date=e.target.value})}/></label></div><label className="admin-field"><span>Excerpt</span><input value={p.excerpt} onChange={e=>patch(c=>{c.posts[i].excerpt=e.target.value})}/></label><label className="admin-field"><span>Body</span><textarea value={p.body} onChange={e=>patch(c=>{c.posts[i].body=e.target.value})}/></label><label className="admin-field"><span>Publish at UTC (optional)</span><input type="datetime-local" value={p.publishAt || ""} onChange={e=>patch(c=>{c.posts[i].publishAt=e.target.value ? new Date(e.target.value).toISOString() : ""})}/></label><label><input type="checkbox" checked={p.published} onChange={e=>patch(c=>{c.posts[i].published=e.target.checked})}/> Published</label></div>)}<button className="admin-btn secondary small" onClick={()=>patch(c=>{c.posts.push({title:"",excerpt:"",body:"",date:new Date().toISOString().slice(0,10),published:false})})}>+ Add note</button></div>
    <div style={{position:"sticky",bottom:16,display:"flex",gap:14,alignItems:"center"}}><button className="admin-btn" disabled={!storage} onClick={save}>Save publishing changes</button><span>{status}</span></div></>;
}

function Pipeline({inquiries,reload}:{inquiries:Inquiry[]|null;reload:()=>Promise<void>}) {
 const states=["new","replied","won","lost"] as const;
 const [busy,setBusy]=useState(false);
 async function move(id:string,status:string){setBusy(true);try{await fetch("/api/admin/inquiries",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status,read:true})});await reload()}finally{setBusy(false)}}
 return <><h1>Lead pipeline</h1><p className="page-sub">Move inquiries between stages. This updates their status in Inquiries too.</p><div className="pipeline-grid">{states.map(state=><section className="pipeline-col" key={state}><h2>{state === "replied" ? "Talking" : state.toUpperCase()} <small>{(inquiries||[]).filter(i=>(i.status||"new")===state).length}</small></h2>{(inquiries||[]).filter(i=>(i.status||"new")===state).map(i=><article className="pipeline-card" key={i.id}><b>{i.name}</b><p>{i.projectType}</p><small>{i.score || "unscored"}</small><select aria-label={`Move ${i.name} to`} disabled={busy} value={i.status||"new"} onChange={e=>move(i.id,e.target.value)}>{states.map(s=><option key={s} value={s}>{s === "replied" ? "Talking" : s}</option>)}</select></article>)}</section>)}</div></>;
}

function AnalyticsChart(){const [data,setData]=useState<{days:{date:string;views:number}[];sources:{name:string;views:number}[]}|null>(null);useEffect(()=>{fetch("/api/admin/analytics").then(r=>r.json()).then(d=>{if(Array.isArray(d.days))setData(d)}).catch(()=>{})},[]);return <div className="admin-panel"><h2>Traffic snapshot</h2><p className="hint">Last 14 UTC days. Source groups are approximate; no IP addresses are saved.</p>{data ? <><div className="traffic-chart">{data.days.map(d=><div key={d.date} title={`${d.date}: ${d.views} views`}><span style={{height:`${Math.max(4,Math.round(d.views/Math.max(1,...data.days.map(x=>x.views))*100))}%`}}/><small>{d.date.slice(5)}</small></div>)}</div><p className="hint">{data.sources.map(x=>`${x.name}: ${x.views}`).join(" · ")}</p></> : <p>Loading traffic data…</p>}</div>}

type NewsletterSubscriber={email:string;joinedAt:number;consent:boolean};
function NewsletterAdmin(){const [items,setItems]=useState<NewsletterSubscriber[]|null>(null);const [status,setStatus]=useState("");const load=useCallback(async()=>{const r=await fetch("/api/admin/newsletter");if(r.ok){const d=await r.json();setItems(d.subscribers)}},[]);useEffect(()=>{load()},[load]);function exportCsv(){const rows=["Email,Joined at,Consent",...(items||[]).map(i=>`"${i.email.replace(/"/g,'""')}","${new Date(i.joinedAt).toISOString()}",Yes`)];const url=URL.createObjectURL(new Blob([rows.join("\r\n")],{type:"text/csv"}));const a=document.createElement("a");a.href=url;a.download="newsletter-subscribers.csv";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}async function remove(email:string){if(!confirm(`Remove ${email} from the list?`))return;const r=await fetch("/api/admin/newsletter",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})});setStatus(r.ok?"Removed":"Could not remove");await load()}return <><h1>Newsletter list</h1><p className="page-sub">People who consented to future updates. This list does not send mail automatically.</p><div className="admin-panel"><h2>{items?.length ?? "…"} subscribers</h2><button className="admin-btn secondary small" onClick={exportCsv} disabled={!items?.length}>Export CSV</button><span>{status}</span>{items?.map(i=><div className="inq-item" key={i.email}><b>{i.email}</b><span style={{marginLeft:12}}>{new Date(i.joinedAt).toLocaleDateString()}</span><button className="admin-btn danger small" style={{marginLeft:12}} onClick={()=>remove(i.email)}>Remove</button></div>)}</div></>}
type CouponRecord={code:string;discount:string;note:string;enabled:boolean;expiresAt:string};
function CouponsAdmin(){const [items,setItems]=useState<CouponRecord[]|null>(null);const [status,setStatus]=useState("");useEffect(()=>{fetch("/api/admin/coupons").then(r=>r.json()).then(d=>setItems(d.coupons||[])).catch(()=>setItems([]))},[]);function patch(fn:(copy:CouponRecord[])=>void){const copy=JSON.parse(JSON.stringify(items||[]));fn(copy);setItems(copy);setStatus("")}async function save(){const r=await fetch("/api/admin/coupons",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({coupons:items})});setStatus(r.ok?"Saved privately":"Could not save; check code format and storage")}return <><h1>Coupon manager</h1><p className="page-sub">Private draft codes only. They are not displayed or applied on the site; discounts must be agreed in a quote.</p><div className="admin-panel">{(items||[]).map((c,i)=><div className="content-editor-item" key={i}><div className="ce-head"><b>Code {i+1}</b><button className="admin-btn danger small" onClick={()=>patch(a=>{a.splice(i,1)})}>Delete</button></div><div className="admin-row2"><label className="admin-field"><span>Code (A-Z, 0-9, dash)</span><input value={c.code} onChange={e=>patch(a=>{a[i].code=e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g,"")})}/></label><label className="admin-field"><span>Proposed offer</span><input value={c.discount} onChange={e=>patch(a=>{a[i].discount=e.target.value})}/></label></div><label className="admin-field"><span>Private notes/terms</span><textarea value={c.note} onChange={e=>patch(a=>{a[i].note=e.target.value})}/></label><label className="admin-field"><span>Expires</span><input type="date" value={c.expiresAt} onChange={e=>patch(a=>{a[i].expiresAt=e.target.value})}/></label><label><input type="checkbox" checked={c.enabled} onChange={e=>patch(a=>{a[i].enabled=e.target.checked})}/> Enabled in private list (does not activate checkout)</label></div>)}<button className="admin-btn secondary small" onClick={()=>patch(a=>{a.push({code:"NEWCODE",discount:"",note:"",enabled:false,expiresAt:""})})}>+ Add draft code</button><div style={{marginTop:20}}><button className="admin-btn" onClick={save} disabled={!items}>Save codes</button> <span>{status}</span></div></div></>}

function ActivityAdmin(){const[events,setEvents]=useState<{at:number;action:string;detail:string}[]>([]);useEffect(()=>{fetch("/api/admin/audit").then(r=>r.json()).then(d=>{if(Array.isArray(d.events))setEvents(d.events)}).catch(()=>{})},[]);return <><h1>Recent activity</h1><p className="page-sub">Admin saves and lead changes from this version onward. Existing historical changes were not logged.</p><div className="admin-panel">{events.length?events.map((e,i)=><div className="inq-item" key={i}><b>{e.action}</b><p>{e.detail}</p><small>{new Date(e.at).toLocaleString("en-IN",{timeZone:"Asia/Kolkata"})}</small></div>):<p>No logged changes yet.</p>}</div></>}
function BackupAdmin(){return <><h1>Private backup</h1><p className="page-sub">Download a JSON copy of site content, inquiries, subscribers, private coupons and recent activity. Keep it private; it contains visitor information.</p><div className="admin-panel"><h2>Export</h2><a className="admin-btn" href="/api/admin/backup" download="portfolio-backup.json">Download backup JSON</a><p className="hint" style={{marginTop:15}}>Restore is deliberately unavailable: overwriting live inquiries could lose newer messages. Keep a copy offline.</p></div></>}

function FollowupCalendar({inquiries}:{inquiries:Inquiry[]|null}){const [month,setMonth]=useState(new Date().toISOString().slice(0,7));const entries=(inquiries||[]).filter(i=>i.followUpAt?.startsWith(month)).sort((a,b)=>(a.followUpAt||"").localeCompare(b.followUpAt||""));return <><h1>Follow-up calendar</h1><p className="page-sub">Dates attached to inquiries. This is a list by day; it does not create calendar invitations.</p><div className="admin-panel"><label className="admin-field"><span>Month</span><input type="month" value={month} onChange={e=>setMonth(e.target.value)}/></label>{entries.length?entries.map(i=><div className="inq-item" key={i.id}><b>{i.followUpAt}</b> · {i.name} · {i.projectType} <span className="hint">{i.status||"new"}</span></div>):<p>No follow-ups scheduled in this month.</p>}</div></>}

function ChatQuestions(){const [items,setItems]=useState<{text:string;ts:number}[]|null>(null);useEffect(()=>{fetch("/api/admin/chat-questions").then(r=>r.json()).then(d=>{if(Array.isArray(d.questions))setItems(d.questions)}).catch(()=>{})},[]);return <div className="admin-panel" style={{marginTop:24}}><h2>Recent visitor questions</h2><p className="hint">Up to 100 questions across the latest 40 chatbot conversations. This is a review list, not an AI-generated trend claim.</p>{items?.map((q,i)=><div className="inq-item" key={i}><p>{q.text}</p><small>{new Date(q.ts).toLocaleString("en-IN",{timeZone:"Asia/Kolkata"})}</small></div>)}{items?.length===0&&<p>No visitor questions yet.</p>}</div>}

type ClientView={id:string;name:string;project:string;status:string;update:string};
function ClientsAdmin(){const [items,setItems]=useState<ClientView[]>([]),[name,setName]=useState(""),[project,setProject]=useState(""),[code,setCode]=useState(""),[status,setStatus]=useState("");const load=useCallback(async()=>{const r=await fetch("/api/admin/clients");if(r.ok){const d=await r.json();setItems(d.clients||[])}},[]);useEffect(()=>{load()},[load]);async function create(e:React.FormEvent){e.preventDefault();const r=await fetch("/api/admin/clients",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,project})});const d=await r.json();if(r.ok){setCode(d.accessCode);setName("");setProject("");setStatus("Created. Save the code securely now; it is shown only once.");await load()}else setStatus(d.error||"Could not create client")}async function update(i:ClientView){const r=await fetch("/api/admin/clients",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:i.id,status:i.status,update:i.update})});setStatus(r.ok?"Status saved":"Could not save status");await load()}async function remove(id:string){if(!confirm("Revoke this client's portal access?"))return;const r=await fetch("/api/admin/clients",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});setStatus(r.ok?"Client access revoked":"Could not revoke");await load()}return <><h1>Client portal</h1><p className="page-sub">Private project status at /client. Create a record only for a real client. Share a code through a channel you trust; the admin never emails codes automatically.</p><div className="admin-panel"><h2>New client access</h2><form onSubmit={create}><div className="admin-row2"><label className="admin-field"><span>Client name</span><input required minLength={2} value={name} onChange={e=>setName(e.target.value)}/></label><label className="admin-field"><span>Project name</span><input required minLength={2} value={project} onChange={e=>setProject(e.target.value)}/></label></div><button className="admin-btn">Create private access code</button></form>{code&&<div className="admin-panel"><b>One-time display: save this code securely before leaving</b><p style={{wordBreak:"break-all"}}>{code}</p><button className="admin-btn secondary small" onClick={async()=>{await navigator.clipboard.writeText(code);setStatus("Code copied. Share only with this client.")}}>Copy code</button><button className="admin-btn secondary small" onClick={()=>setCode("")}>Hide</button></div>}<p>{status}</p></div><div className="admin-panel"><h2>Client records</h2>{items.map((c,i)=><div className="content-editor-item" key={c.id}><b>{c.name} · {c.project}</b><div className="admin-row2"><label className="admin-field"><span>Status</span><input value={c.status} onChange={e=>setItems(a=>a.map((x,j)=>j===i?{...x,status:e.target.value}:x))}/></label><label className="admin-field"><span>Latest update (visible to this client)</span><textarea value={c.update} onChange={e=>setItems(a=>a.map((x,j)=>j===i?{...x,update:e.target.value}:x))}/></label></div><button className="admin-btn small" onClick={()=>update(c)}>Save update</button> <button className="admin-btn danger small" onClick={()=>remove(c.id)}>Revoke access</button></div>)}{items.length===0&&<p>No clients added.</p>}</div></>}
