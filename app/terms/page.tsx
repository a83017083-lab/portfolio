import type { Metadata } from "next";
import Link from "next/link";
import {getContent} from "../../lib/content";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of use for buildweth-abhinavk7852.vercel.app - plain language.",
};

export const dynamic="force-dynamic";
export default async function Terms() {
  const content=await getContent();
  return (
    <main className="legal-page">
      <div className="wrap">
        <h1>Terms of Use</h1>
        <p className="legal-updated">Last updated: 26 September 2026</p>

        <h2>The site</h2>
        <p>
          This site is the portfolio and services site of Abhinav Kumar ("Build With Abhinav"), New Delhi, India.
          It describes services including website development, AI automations, n8n workflows, WhatsApp and
          Instagram automation, coaching-centre systems, and short-form video editing.
        </p>

        <h2>Using the site</h2>
        <ul>
          <li>The content here is information about services, not a binding offer. Any project starts only after
            both sides agree on scope, price and timeline in writing.</li>
          <li>The contact form and chatbot are for genuine inquiries. Please don't send spam or abusive content.</li>
          <li>The chatbot is an AI assistant. It can make mistakes - treat its answers as general information,
            not commitments or professional advice.</li>
        </ul>

        <h2>Build Credit and referrals</h2><p>{content.legal.termsWallet} See the <Link href="/wallet-policy">wallet policy</Link> and <Link href="/refund-policy">refund policy</Link>.</p>
        <h2>Content</h2>
        <p>
          The text, design and code of this site belong to Abhinav Kumar. Any third-party project material remains the property of its respective owners.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these terms: use the <Link href="/contact">contact form</Link> or email
          a83017083@gmail.com.
        </p>
      </div>
    </main>
  );
}
