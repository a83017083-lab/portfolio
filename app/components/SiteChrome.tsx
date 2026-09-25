"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getSid } from "../../lib/sid";
const ChatWidget = dynamic(() => import("./ChatWidget"), { ssr: false });
const SiteSearch = dynamic(() => import("./SiteSearch"), { ssr: false });
const AccessibilityControls = dynamic(() => import("./AccessibilityControls"), { ssr:false });
const ExitPrompt = dynamic(() => import("./ExitPrompt"), { ssr:false });
import type { ChatbotSettings } from "../../lib/content";
import PageTransitions from "./PageTransitions";
import type {SearchEntry} from "../../lib/search-entries";

const routes = [["/", "Home"], ["/about", "About"], ["/work", "Work"], ["/stack", "Stack"], ["/services", "Services"], ["/blog", "Journal"], ["/faq", "FAQ"], ["/contact", "Contact"], ["/resources", "Resources"]] as const;
export function SiteChrome({ children, chatbot, announcement, whatsappUrl, searchEntries }: { children: React.ReactNode; chatbot: ChatbotSettings; announcement?: string; whatsappUrl?: string; searchEntries: SearchEntry[] }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(localStorage.getItem("portfolio-theme") === "dark"); }, []);
  function toggleTheme() { const next = !dark; setDark(next); localStorage.setItem("portfolio-theme", next ? "dark" : "light"); }
  useEffect(() => { fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sid: getSid(), referrer: document.referrer }) }).catch(() => {}); }, [path]);
  return <div id="top" className={dark ? "v2-shell v2-dark" : "v2-shell"}>
    {announcement && <div className="v2-announcement">{announcement}</div>}
    <div className="v2-progress" aria-hidden="true"/><header className="v2-header"><div className="v2-header-inner">
      <Link href="/" className="v2-logo" aria-label="Build With Abhinav, home"><span className="v2-logomark"><img src="/images/abhinav.jpg" alt="" width="42" height="42"/></span><span>build with<br/><strong>abhinav</strong></span></Link>
      <SiteSearch entries={searchEntries}/><AccessibilityControls/>
      <button className="v2-theme-toggle" type="button" onClick={toggleTheme} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} title={dark ? "Light theme" : "Dark theme"}>{dark ? "☀ Light" : "☾ Dark"}</button>
      <button className="v2-menu" aria-expanded={open} aria-label="Toggle menu" onClick={() => setOpen(!open)}>{open ? "Close ×" : "Menu +"}</button>
      <nav className={open ? "v2-nav open" : "v2-nav"} aria-label="Main navigation">{routes.map(([href, title]) => <Link onClick={() => setOpen(false)} aria-current={path === href ? "page" : undefined} href={href} key={href}>{title}</Link>)}<Link className="v2-nav-action" href="/contact#demo" onClick={() => setOpen(false)}>Request a demo ↗</Link></nav>
    </div></header>
    <PageTransitions>{children}</PageTransitions>
    <footer className="v2-footer"><div className="v2-container v2-footer-grid"><div><Link href="/" className="v2-footer-brand">ABHINAV<span>®</span></Link><p>Websites and automations, built with intent.</p></div><div><small>EXPLORE</small>{routes.map(([href, title]) => <Link href={href} key={href}>{title}</Link>)}</div><div><small>ELSEWHERE</small><a href="https://github.com/a83017083-lab" target="_blank" rel="noopener noreferrer">GitHub ↗</a><a href="https://linktr.ee/buildweth_abhinavk7852" target="_blank" rel="noopener noreferrer">Socials ↗</a><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div></div><div className="v2-container v2-footer-bottom"><span>© 2026 Build With Abhinav</span><span>Built to work, not just look good.</span></div></footer>
    {whatsappUrl && <a className="v2-wa" href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Open business WhatsApp">WhatsApp ↗</a>}
    <Link className="v2-mobile-cta" href="/contact#demo">Request a demo ↗</Link>
    <a className="v2-backtop" href="#top" aria-label="Back to top">↑</a>
    <ChatWidget greeting={chatbot.greeting} enabled={chatbot.enabled} />
    <ExitPrompt/>
  </div>;
}
