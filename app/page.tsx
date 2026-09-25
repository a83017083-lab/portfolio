"use client";

import { motion } from "framer-motion";
import ChatWidget from "./components/ChatWidget";
import InquiryForm from "./components/InquiryForm";

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

const PROJECTS = [
  {
    cat: "Full-stack",
    name: "School Homework Portal",
    desc: "Offline-first homework system with separate logins for principal, teachers, students and parents - plus an AI assistant.",
    tags: ["Node.js", "Express", "PostgreSQL", "PWA"],
    img: "/images/proj-homework.jpg",
    href: "https://github.com/a83017083-lab/School-",
  },
  {
    cat: "Edtech",
    name: "S³AI+ Learning Platform",
    desc: "AI-guided learning for Indian students: structured paths with real-time AI help.",
    tags: ["Next.js", "TypeScript", "Supabase"],
    img: "/images/proj-edtech.jpg",
    href: "https://github.com/a83017083-lab/S3ai-",
  },
  {
    cat: "Automation",
    name: "Instagram Automation",
    desc: "Auto-replies and keyword-triggered DMs with a dashboard to run it all - like a self-hosted ManyChat.",
    tags: ["Next.js", "React", "Supabase"],
    img: "/images/proj-insta.jpg",
    href: "https://github.com/a83017083-lab/Manychat1",
  },
  {
    cat: "Open source",
    name: "Open Generative AI",
    desc: "A free, open-source alternative to paid AI video platforms. Prompt in, video out.",
    tags: ["JavaScript", "AI video"],
    img: "/images/proj-video.jpg",
    href: "https://github.com/a83017083-lab/Imagination",
  },
  {
    cat: "Web design",
    name: "Saffron Ember",
    desc: "Restaurant website with multi-theme UI and a live GST-aware cart, in a single HTML file.",
    tags: ["HTML", "CSS", "JavaScript"],
    img: "/images/proj-restaurant.jpg",
    href: "https://github.com/a83017083-lab/saffron-ember-website",
  },
  {
    cat: "Web design",
    name: "Independence Day Tribute",
    desc: "A hand-coded tribute page for India's 80th Independence Day. No framework, just care.",
    tags: ["HTML", "CSS"],
    img: "/images/proj-tribute.jpg",
    href: "https://github.com/a83017083-lab/Independence80th",
  },
];

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

export default function Home() {
  return (
    <main>
      <nav className="nav">
        <div className="wrap">
          <a className="brand" href="#top">
            abhinav<b>.</b>kumar
          </a>
          <div className="links">
            <a href="#work">Work</a>
            <a href="#services">Services</a>
            <a href="#about">About</a>
            <a href="#now">Now</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </nav>

      <div className="wrap" id="top">
        <header className="hero">
          <div className="hero-grid">
            <div>
              <motion.span className="kicker" variants={fadeUp} custom={0} initial="hidden" animate="show">
                <span className="dot" /> Available for projects
              </motion.span>
              <motion.h1 variants={fadeUp} custom={1} initial="hidden" animate="show">
                Abhinav
                <br />
                Kumar<span className="accent">.</span>
              </motion.h1>
              <motion.p className="role" variants={fadeUp} custom={2} initial="hidden" animate="show">
                I build <b>websites</b> &amp; <b>AI automations</b> that work.
              </motion.p>
              <motion.p className="sub" variants={fadeUp} custom={3} initial="hidden" animate="show">
                Student builder from New Delhi. I learn by shipping - full-stack apps,
                automation workflows and open-source tools, all built in public.
              </motion.p>
              <motion.div className="cta-row" variants={fadeUp} custom={4} initial="hidden" animate="show">
                <a className="btn btn-primary" href="#contact">Start a project →</a>
                <a className="btn btn-ghost" href="#work">See my work ↓</a>
              </motion.div>
              <motion.div className="hero-socials" variants={fadeUp} custom={5} initial="hidden" animate="show">
                <a href={LINKS.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
                <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer">Instagram ↗</a>
                <a href={LINKS.linktree} target="_blank" rel="noopener noreferrer">Linktree ↗</a>
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
                alt="Abhinav Kumar"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="float-chip chip-1"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
              >
                <b>25+</b> repos on GitHub
              </motion.div>
              <motion.div
                className="float-chip chip-2"
                animate={{ y: [0, 9, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
              >
                n8n · Next.js · AI
              </motion.div>
            </motion.div>
          </div>
        </header>
      </div>

      <div className="marquee">
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
              <span className="num">01 / WORK</span>
              <h2>Things I&apos;ve shipped</h2>
              <p>Real projects, real code - every one of them lives on my GitHub.</p>
            </div>
          </Reveal>
          <div className="proj-grid">
            {PROJECTS.map((p, i) => (
              <Reveal key={p.name} i={(i % 2) + 1}>
                <a className="proj-card" href={p.href} target="_blank" rel="noopener noreferrer">
                  <div className="proj-thumb">
                    <img src={p.img} alt={p.name} loading="lazy" />
                  </div>
                  <div className="proj-body">
                    <span className="cat">{p.cat}</span>
                    <h3>
                      {p.name} <span className="arr">↗</span>
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
              <span className="num">02 / SERVICES</span>
              <h2>Start a project</h2>
              <p>Websites and automations for real businesses - picked up, built properly, and looked after.</p>
            </div>
          </Reveal>
          <div className="svc-grid">
            {[
              {
                t: "Business websites",
                d: "Fast, modern sites that make your business look serious - landing pages, full sites and redesigns that work on every phone.",
                tags: ["Next.js", "Mobile-first", "SEO basics"],
              },
              {
                t: "AI automations (n8n)",
                d: "Workflows that do the boring work for you - data entry, follow-ups, reports and app integrations running on their own.",
                tags: ["n8n", "APIs", "AI"],
              },
              {
                t: "WhatsApp & Instagram automation",
                d: "Auto-replies, keyword-triggered DMs and lead capture - your socials keep working even while you sleep.",
                tags: ["Auto-replies", "Lead capture", "Dashboards"],
              },
              {
                t: "Coaching centre systems",
                d: "Fee reminders on WhatsApp, owner dashboards and AI that answers parent queries - the boring problems that cost real money.",
                tags: ["Fee reminders", "Dashboards", "Parent queries"],
              },
            ].map((svc, i) => (
              <Reveal key={svc.t} i={(i % 2) + 1}>
                <div className="svc-card">
                  <span className="svc-num">0{i + 1}</span>
                  <h3>{svc.t}</h3>
                  <p>{svc.d}</p>
                  <div className="proj-tags">
                    {svc.tags.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div className="process">
              <h3 className="process-title">How it works</h3>
              <div className="process-grid">
                {[
                  { n: "01", t: "Tell me about it", d: "Fill the form below - takes two minutes." },
                  { n: "02", t: "Plan & quote", d: "I reply within 24 hours with a clear plan, timeline and price." },
                  { n: "03", t: "Build", d: "I build in weekly updates you can actually see, not silence." },
                  { n: "04", t: "Launch & support", d: "We go live, and I stick around for fixes and tweaks." },
                ].map((p) => (
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
              <span className="num">03 / ABOUT</span>
              <h2>Builder, not just student</h2>
            </div>
          </Reveal>
          <div className="about-grid">
            <Reveal i={1}>
              <p>
                Most students only study technology. I&apos;d rather <b>build with it</b>. What
                started as curiosity turned into a habit, and the habit turned into a brand:{" "}
                <b>Build With Abhinav</b>.
              </p>
              <p>
                Since then I&apos;ve shipped a homework portal used by a real school,
                automations that answer Instagram DMs on their own, and an open-source AI video
                tool. Some things worked, some broke - all of them taught me something.
              </p>
              <p>
                The long game: turn good ideas into real companies, and document the journey so
                other students can follow the same path.
              </p>
            </Reveal>
            <Reveal i={2}>
              <div className="stat-stack">
                <div className="stat">
                  <b>25+</b>
                  <span>repositories on GitHub</span>
                </div>
                <div className="stat">
                  <b>6</b>
                  <span>projects shipped &amp; counting</span>
                </div>
                <div className="stat">
                  <b>100%</b>
                  <span>built in public</span>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="block" id="now">
          <Reveal>
            <div className="sec-head">
              <span className="num">04 / NOW</span>
              <h2>What I&apos;m up to</h2>
            </div>
          </Reveal>
          <div className="now-grid">
            {[
              {
                t: "Automating coaching centres",
                d: "Fee reminders on WhatsApp, owner dashboards, AI that answers parent queries - the boring problems that cost real money.",
              },
              {
                t: "Sketching a startup",
                d: "One platform where students learn, build skills and play sports - not just chase marks.",
              },
              {
                t: "Sharpening UI craft",
                d: "Studying what makes interfaces feel designed, not generated - typography, motion, restraint.",
              },
              {
                t: "Building in public",
                d: "Writing up every build, step by step, so others can follow the same path.",
              },
            ].map((n, i) => (
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

        <section id="contact">
          <Reveal>
            <div className="contact-card contact-form-card">
              <span className="num">05 / START A PROJECT</span>
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
                <a href={`mailto:${LINKS.email}`}>{LINKS.email}</a>
                <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer">Instagram ↗</a>
                <a href={LINKS.linktree} target="_blank" rel="noopener noreferrer">Linktree ↗</a>
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

      <ChatWidget />
    </main>
  );
}
