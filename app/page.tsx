import Home from "./components/Home";
import { getContent, getChatbotSettings } from "../lib/content";

export const dynamic = "force-dynamic";

const SITE_URL = "https://buildweth-abhinavk7852.vercel.app";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Who is Abhinav Kumar?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Abhinav Kumar is a student builder and freelance web developer from New Delhi, India, who ships websites, full-stack apps and AI automations in public under the name Build With Abhinav.",
      },
    },
    {
      "@type": "Question",
      name: "What services does Build With Abhinav offer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Business websites, AI automations and n8n workflows, WhatsApp and Instagram automation, coaching-centre systems like fee reminders and parent-query AI, and short-form video editing for creators and brands.",
      },
    },
    {
      "@type": "Question",
      name: "Where does Abhinav work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "He is based in New Delhi, India and works remotely with clients across India and abroad.",
      },
    },
    {
      "@type": "Question",
      name: "How much does a website or automation cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It depends on the scope. Share your requirements through the contact form and you get a clear quote before any work starts.",
      },
    },
    {
      "@type": "Question",
      name: "Does Abhinav build n8n automations and AI chatbots?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. n8n workflow automation, WhatsApp and Instagram automation, and AI assistants like the chatbot on this site are core services.",
      },
    },
    {
      "@type": "Question",
      name: "How do I contact Abhinav?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Use the contact form on this site or the chatbot. Every inquiry reaches him directly and gets a reply.",
      },
    },
  ],
};

export default async function Page() {
  const [content, chatbot] = await Promise.all([getContent(), getChatbotSettings()]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Home content={content} chatbot={chatbot} />
    </>
  );
}
