import { kvGet, kvSet } from "./kv";

export type Project = { cat: string; name: string; desc: string; tags: string[]; img: string; href: string };
export type Service = { title: string; desc: string; tags: string[] };
export type Step = { n: string; t: string; d: string };
export type NowItem = { t: string; d: string };
export type Stat = { value: string; label: string };
export type FAQ = { question: string; answer: string; published: boolean };
export type Testimonial = { quote: string; name: string; role: string; published: boolean };
export type Post = { title: string; excerpt: string; body: string; published: boolean; date: string };
export type Package = { regionalPrices?: Record<string, string>; name: string; price: string; description: string; features: string[]; published: boolean };
export type Venture = { kicker: string; title: string; desc: string; points: string[] };

export type SiteContent = {
  hero: {
    availability: string;
    roleA: string;
    roleB: string;
    sub: string;
    chip1top: string;
    chip1bottom: string;
    chip2: string;
  };
  projects: Project[];
  posts: Post[];
  faqs: FAQ[];
  testimonials: Testimonial[];
  packages: Package[];
  demoUrl: string;
  announcement: string;
  services: Service[];
  process: Step[];
  now: NowItem[];
  ventures: Venture[];
  about: { paragraphs: string[]; stats: Stat[] };
};

export type ChatbotSettings = {
  enabled: boolean;
  greeting: string;
  extraInstructions: string;
  disabledMessage: string;
};

export const DEFAULT_CONTENT: SiteContent = {
  hero: {
    availability: "Available for projects",
    roleA: "websites",
    roleB: "AI automations",
    sub: "Student builder making useful websites and automations. Clear ideas, thoughtful design and working software.",
    chip1top: "Build",
    chip1bottom: "in public",
    chip2: "n8n · Next.js · AI",
  },
  demoUrl: "",
  announcement: "",
  packages: [
    { name: "Starter", price: "₹4,999", regionalPrices: { IN: "₹4,999", US: "$249", GB: "£149", EU: "€169", AE: "AED 699", CA: "C$229", AU: "A$239", SG: "S$219", JP: "¥22,000", OTHER: "$149" }, description: "A focused one-page online presence.", features: ["Responsive design", "Contact form", "Basic search setup"], published: true },
    { name: "Growth", price: "₹14,999", regionalPrices: { IN: "₹14,999", US: "$699", GB: "£449", EU: "€499", AE: "AED 1,899", CA: "C$699", AU: "A$729", SG: "S$679", JP: "¥69,000", OTHER: "$449" }, description: "A multi-page site made for a growing business.", features: ["Up to five pages", "Content editing", "Launch support"], published: true },
    { name: "Custom", price: "Let's talk", regionalPrices: { IN: "Let's talk", US: "Let's talk", GB: "Let's talk", EU: "Let's talk", AE: "Let's talk", OTHER: "Let's talk" }, description: "Automations and tailored systems scoped together.", features: ["Discovery call", "Custom plan", "Clear quote"], published: true },
  ],
  testimonials: [],
  faqs: [
    { question: "What kinds of projects do you take on?", answer: "Websites, workflow automations and tailored digital tools. Share your idea through the contact page and I'll say if it fits.", published: true },
    { question: "Can I see your code?", answer: "Yes. The Work page links to public repositories for the projects shown there.", published: true },
    { question: "Are the prices final?", answer: "No. The Services page shows sample starting points. Every project gets a separate quote after we agree on scope.", published: true },
    { question: "Is requesting a demo the same as booking?", answer: "Not yet. The demo request form sends a message and I reply to arrange a time. A calendar link will appear when live scheduling is ready.", published: true }
  ],
  posts: [
    { title: "How I approach a new build", excerpt: "A short look at discovery, prototyping and shipping.", body: "I start by understanding what a visitor needs to do. Then I sketch the path, build a small working version and improve it with real feedback. This is the process I aim to use for every new project.", date: "2026-09-25", published: true },
  ],
  projects: [
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
  ],
  services: [
    {
      title: "Business websites",
      desc: "Fast, modern sites that make your business look serious - landing pages, full sites and redesigns that work on every phone.",
      tags: ["Next.js", "Mobile-first", "SEO basics"],
    },
    {
      title: "AI automations (n8n)",
      desc: "Workflows that do the boring work for you - data entry, follow-ups, reports and app integrations running on their own.",
      tags: ["n8n", "APIs", "AI"],
    },
    {
      title: "WhatsApp & Instagram automation",
      desc: "Auto-replies, keyword-triggered DMs and lead capture - your socials keep working even while you sleep.",
      tags: ["Auto-replies", "Lead capture", "Dashboards"],
    },
    {
      title: "Coaching centre systems",
      desc: "Fee reminders on WhatsApp, owner dashboards and AI that answers parent queries - the boring problems that cost real money.",
      tags: ["Fee reminders", "Dashboards", "Parent queries"],
    },
  ],
  process: [
    { n: "01", t: "Tell me about it", d: "Fill the form below - takes two minutes." },
    { n: "02", t: "Plan & quote", d: "I reply with a clear plan, timeline and price after learning about your project." },
    { n: "03", t: "Build", d: "I build in weekly updates you can actually see, not silence." },
    { n: "04", t: "Launch & support", d: "We go live, and I stick around for fixes and tweaks." },
  ],
  now: [
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
  ],
  ventures: [
    {
      kicker: "Startup - early stage",
      title: "A learning platform for students",
      desc: "The long game: one platform where students learn, build real skills and play sports - not just chase marks. Right now it is research, sketches and conversations with students; the goal is a product that makes learning feel like building.",
      points: ["Study + skills + sports in one place", "Being shaped with real student feedback", "Research and prototype stage"],
    },
    {
      kicker: "Agency",
      title: "Build With Abhinav - the agency",
      desc: "The service side of my work: everything a local business or creator needs to look sharp online and run on autopilot. One point of contact, honest timelines, weekly updates you can actually see.",
      points: [
        "Business websites and redesigns",
        "AI automations with n8n - data entry, follow-ups, reports",
        "WhatsApp & Instagram automation and lead capture",
        "Coaching-centre systems: fee reminders, owner dashboards, parent-query AI",
        "Short-form video editing for creators and brands",
      ],
    },
  ],
  about: {
    paragraphs: [
      "Most students only study technology. I'd rather build with it. What started as curiosity turned into a habit, and the habit turned into a brand: Build With Abhinav.",
      "I share my code and experiments publicly. Some things work, some break - all of them teach me something.",
      "The long game: turn good ideas into real companies, and document the journey so other students can follow the same path.",
    ],
    stats: [],
  },
};

export const DEFAULT_CHATBOT: ChatbotSettings = {
  enabled: true,
  greeting:
    "Hi! I'm Abhinav's AI assistant. Ask me about his work, services, or how to start a project - kisi bhi language mein pooch sakte ho.",
  extraInstructions: "",
  disabledMessage: "The assistant is offline right now - please use the contact form instead.",
};

const CONTENT_KEY = "content:v1";
const CHATBOT_KEY = "chatbot:settings:v1";

export async function getContent(): Promise<SiteContent> {
  const stored = await kvGet<Partial<SiteContent>>(CONTENT_KEY);
  if (!stored) return DEFAULT_CONTENT;
  return { ...DEFAULT_CONTENT, ...stored, posts: stored.posts || DEFAULT_CONTENT.posts, faqs: stored.faqs || DEFAULT_CONTENT.faqs, testimonials: stored.testimonials || [], packages: stored.packages || DEFAULT_CONTENT.packages, demoUrl: stored.demoUrl || "", announcement: stored.announcement || "", hero: { ...DEFAULT_CONTENT.hero, ...(stored.hero || {}) }, about: { ...DEFAULT_CONTENT.about, ...(stored.about || {}) } };
}

export async function saveContent(content: SiteContent): Promise<boolean> {
  return kvSet(CONTENT_KEY, content);
}

export async function getChatbotSettings(): Promise<ChatbotSettings> {
  const stored = await kvGet<Partial<ChatbotSettings>>(CHATBOT_KEY);
  return { ...DEFAULT_CHATBOT, ...(stored || {}) };
}

export async function saveChatbotSettings(s: ChatbotSettings): Promise<boolean> {
  return kvSet(CHATBOT_KEY, s);
}
