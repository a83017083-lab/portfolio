import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Archivo({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

const SITE_URL = "https://buildweth-abhinavk7852.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Abhinav Kumar - Web Developer & AI Automation Builder | Build With Abhinav",
    template: "%s | Abhinav Kumar",
  },
  description:
    "Abhinav Kumar (Build With Abhinav) builds websites, AI automations, n8n workflows, WhatsApp & Instagram automation and short-form video editing for businesses, startups and coaching centres. Freelance web developer & AI automation builder from New Delhi, India.",
  keywords: [
    "Abhinav Kumar", "Build With Abhinav", "web developer Delhi", "freelance web developer India",
    "AI automation developer", "n8n workflow automation", "n8n developer India",
    "WhatsApp automation", "Instagram automation", "AI chatbot developer",
    "business website development", "coaching centre software", "fee reminder automation",
    "short-form video editing", "reels editing India", "full-stack developer Delhi",
    "Next.js developer India", "website developer for small business", "AI automation agency India",
    "startup MVP developer", "local business website Delhi",
    "student web developer India", "AI automation for small business", "n8n automation developer",
    "affordable website developer Delhi", "AI chatbot for website",
  ],
  authors: [{ name: "Abhinav Kumar", url: SITE_URL }],
  creator: "Abhinav Kumar",

  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Build With Abhinav",
    title: "Abhinav Kumar - Web Developer & AI Automation Builder",
    description:
      "Student web developer in India building affordable websites and AI automation for small businesses. Explore Build With Abhinav projects and services.",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Abhinav Kumar - Web Developer & AI Automation Builder",
    description:
      "Websites, AI automations, n8n workflows, WhatsApp & Instagram automation and short-form video editing. New Delhi, India.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Abhinav Kumar",
      url: SITE_URL,
      jobTitle: "Web Developer & AI Automation Builder",
      sameAs: [
        "https://github.com/a83017083-lab",
        "https://www.instagram.com/buildweth_abhinavk7852",
        "https://linktr.ee/buildweth_abhinavk7852",
      ],

      knowsAbout: [
        "Web Development", "AI Automation", "n8n Workflows", "WhatsApp Automation",
        "Instagram Automation", "Next.js", "Short-form Video Editing",
      ],
    },
    {
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}/#agency`,
      name: "Build With Abhinav",
      url: SITE_URL,
      founder: { "@id": `${SITE_URL}/#person` },
      areaServed: { "@type": "Country", name: "India" },

      description:
        "Business websites, AI automations, n8n workflows, WhatsApp & Instagram automation, coaching-centre systems and short-form video editing.",
      makesOffer: [
        "Website Development", "AI Automation", "n8n Workflow Automation",
        "WhatsApp & Instagram Automation", "Coaching Centre Systems", "Short-form Video Editing",
      ].map((name) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name } })),
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
