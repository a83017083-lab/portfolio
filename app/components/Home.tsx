"use client";

import { useEffect } from "react";
import { getSid } from "../../lib/sid";
import { motion } from "framer-motion";
import {
  ArrowUpRight, ArrowDown, Globe, Workflow, MessagesSquare, GraduationCap,
  Github, Instagram, Link2, Mail, Sparkles,
} from "lucide-react";
import ChatWidget from "./ChatWidget";
import InquiryForm from "./InquiryForm";
import type { SiteContent, ChatbotSettings } from "../../lib/content";

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.1, ease: [0.21, 0.47, 0.32, 0.98] as const },
  }),
};

function Reveal({ children, i = 0, className }: { children: React.ReactNode; i?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      custom={i}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </motion.div>
  );
}

const MARQUEE = [
  "Next.js", "TypeScript", "AI Automation", "n8n", "React", "Node.js",
  "Supabase", "UI Design", "Web3", "PostgreSQL", "Tailwind CSS", "Open Source",
];

const LINKS = {
  github: "https://github.com/a83017083-lab",
  instagram: "https://www.instagram.com/buildweth_abhinavk7852",
  linktree: "https://linktr.ee/buildweth_abhinavk7852",
  email: "a83017083@gmail.com",
};

const SVC_ICONS = [Globe, Workflow, MessagesSquare, GraduationCap];

export default function Home({ content, chatbot }: { content: SiteContent; chatbot: ChatbotSettings }) {
  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sid: getSid() }),
    }).catch(() => {});
  }, []);

  const { hero } = content;
  return (
    <main>
      <nav className="nav">
        <div className="wrap">
          <a className="brand" href="#top">
            abhinav<span className="brand-dot">.</span>kumar
          </a>
          <div className="links">
            <a href="#work">Work</a>
            <a href="#services">Services</a>
            <a href="#about">About</a>
            <a href="#now">Now</a>
            <a className="nav-cta" href="#contact">Start a project</a>
          </div>
        </div>
      </nav>

      <div className="wrap" id="top">
        <header className="hero">
          <div className="aurora" aria-hidden="true">
            <span className="blob b1" />
            <span className="blob b2" />
            <span className="blob b3" />
          </div>
          <div className="hero-grid">
            <div>
              <motion.span className="kicker" variants={fadeUp} custom={0} initial="hidden" animate="show">
                <span className="dot" /> {hero.availability}
              </motion.span>
              <motion.h1 variants={fadeUp} custom={1} initial="hidden" animate="show">
                Abhinav
                <br />
                Kumar<span className="accent">.</span>
              </motion.h1>
              <motion.p className="role" variants={fadeUp} custom={2} initial="hidden" animate="show">
                I build <b>{hero.roleA}</b> &amp; <b>{hero.roleB}</b> that work.
              </motion.p>
              <motion.p className="sub" variants={fadeUp} custom={3} initial="hidden" animate="show">
                {hero.sub}
              </motion.p>
              <motion.div className="cta-row" variants={fadeUp} custom={4} initial="hidden" animate="show">
                <a className="btn btn-primary" href="#contact">
                  Start a project <ArrowUpRight size={16} />
                </a>
                <a className="btn btn-ghost" href="#work">
                  See my work <ArrowDown size={16} />
                </a>
              </motion.div>
              <motion.div className="hero-socials" variants={fadeUp} custom={5} initial="hidden" animate="show">
                <a href={LINKS.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><Github size={14} /> GitHub</a>
                <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={14} /> Instagram</a>
                <a href={LINKS.linktree} target="_blank" rel="noopener noreferrer" aria-label="Linktree"><Link2 size={14} /> Linktree</a>
              </motion.div>
            </div>
            <motion.div
              className="hero-art"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              <motion.img
                src="/images/abhinav.jpg"
                alt="Portrait of Abhinav Kumar"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="float-chip chip-1"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
              >
                <b>{hero.chip1top}</b> {hero.chip1bottom}
              </motion.div>
              <motion.div
                className="float-chip chip-2"
                animate={{ y: [0, 9, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
              >
                <Sparkles size={13} /> {hero.chip2}
              </motion.div>
            </motion.div>
          </div>
        </header>
      </div>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...MARQUEE, ...MARQUEE].map((m, i) => (
            <span key={i}>
              <i>✦</i>
              {m}
            </span>
          ))}
        </div>
      </div>

      <div className="wrap">
        <section className="block" id="work">
          <Reveal>
            <div className="sec-head">
              <span className="num">01 / Work</span>
              <h2>Things I&apos;ve shipped</h2>
              <p>Real projects, real code - every one of them lives on my GitHub.</p>
            </div>
          </Reveal>
          <div className="proj-grid">
            {content.projects.map((p, i) => (
              <Reveal key={p.name} i={(i % 2) + 1}>
                <a className="proj-card" href={p.href} target="_blank" rel="noopener noreferrer">
                  <div className="proj-thumb">
                    <img src={p.img} alt={`${p.name} preview`} loading="lazy" />
                    <span className="proj-open"><ArrowUpRight size={16} /></span>
                  </div>
                  <div className="proj-body">
                    <span className="cat">{p.cat}</span>
                    <h3>
                      {p.name} <span className="arr"><ArrowUpRight size={18} /></span>
                    </h3>
                    <p>{p.desc}</p>
                    <div className="proj-tags">
                      {p.tags.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="block" id="services">
          <Reveal>
            <div className="sec-head">
              <span className="num">02 / Services</span>
              <h2>Start a project</h2>
              <p>Websites and automations for real businesses - picked up, built properly, and looked after.</p>
            </div>
          </Reveal>
          <div className="svc-grid">
            {content.services.map((svc, i) => {
              const Icon = SVC_ICONS[i % SVC_ICONS.length];
              return (
                <Reveal key={svc.title} i={(i % 2) + 1}>
                  <div className="svc-card">
                    <div className="svc-top">
                      <span className="svc-icon"><Icon size={20} /></span>
                      <span className="svc-num">0{i + 1}</span>
                    </div>
                    <h3>{svc.title}</h3>
                    <p>{svc.desc}</p>
                    <div className="proj-tags">
                      {svc.tags.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
          <Reveal>
            <div className="process">
              <h3 className="process-title">How it works</h3>
              <div className="process-grid">
                {content.process.map((p) => (
                  <div className="process-step" key={p.n}>
                    <span className="mono">{p.n}</span>
                    <h4>{p.t}</h4>
                    <p>{p.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        <section className="block" id="about">
          <Reveal>
            <div className="sec-head">
              <span className="num">03 / About</span>
              <h2>Builder, not just student</h2>
            </div>
          </Reveal>
          <div className="about-grid">
            <Reveal i={1}>
              {content.about.paragraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </Reveal>
            <Reveal i={2}>
              <div className="stat-stack">
                {content.about.stats.map((s) => (
                  <div className="stat" key={s.label}>
                    <b>{s.value}</b>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="block" id="now">
          <Reveal>
            <div className="sec-head">
              <span className="num">04 / Now</span>
              <h2>What I&apos;m up to</h2>
            </div>
          </Reveal>
          <div className="now-grid">
            {content.now.map((n, i) => (
              <Reveal key={n.t} i={(i % 2) + 1}>
                <div className="now-item">
                  <span className="n">0{i + 1}</span>
                  <h3>{n.t}</h3>
                  <p>{n.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="block" id="ventures">
          <Reveal>
            <div className="sec-head">
              <span className="num">05 / Ventures</span>
              <h2>What I&apos;m building towards</h2>
              <p>A startup in the making, and the agency that funds the journey.</p>
            </div>
          </Reveal>
          <div className="venture-grid">
            {content.ventures.map((v, i) => (
              <Reveal key={v.title} i={(i % 2) + 1}>
                <div className="venture-card">
                  <span className="venture-kicker">{v.kicker}</span>
                  <h3>{v.title}</h3>
                  <p>{v.desc}</p>
                  <ul>
                    {v.points.map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="contact">
          <Reveal>
            <div className="contact-card contact-form-card">
              <span className="num">06 / Start a project</span>
              <h2>
                Tell me what you&apos;re <span className="accent">building.</span>
              </h2>
              <p>
                Fill this in and it lands straight in my inbox - I reply personally, usually
                within 24 hours.
              </p>
              <InquiryForm />
              <div className="contact-alt">
                <span>Prefer email or socials?</span>
                <a href={`mailto:${LINKS.email}`}><Mail size={13} /> {LINKS.email}</a>
                <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer"><Instagram size={13} /> Instagram</a>
                <a href={LINKS.linktree} target="_blank" rel="noopener noreferrer"><Link2 size={13} /> Linktree</a>
              </div>
            </div>
          </Reveal>
        </section>
      </div>

      <footer>
        <div className="wrap">
          <span>© 2026 Abhinav Kumar</span>
          <span>Designed &amp; built with care</span>
        </div>
      </footer>

      <ChatWidget greeting={chatbot.greeting} enabled={chatbot.enabled} />
    </main>
  );
}
