import type { Metadata } from "next";
import Link from "next/link";
import {getContent} from "../../lib/content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What this site collects and how it is used - plain language privacy policy for buildweth-abhinavk7852.vercel.app.",
};

export const dynamic="force-dynamic";
export default async function Privacy() {
  const content=await getContent();
  return (
    <main className="legal-page">
      <div className="wrap">
        <h1>Privacy Policy</h1>
        <p className="legal-updated">Last updated: 26 September 2026</p>

        <p>
          This site is run by Abhinav Kumar ("Build With Abhinav"), New Delhi, India. This page explains,
          in plain language, what information this site collects and what happens to it.
        </p>

        <h2>What this site collects</h2>
        <ul>
          <li>
            <strong>Contact / inquiry form:</strong> your name, email address, the service and budget you pick,
            and the message you write. This is used to reply to your inquiry. It is emailed to the site owner when delivery works and is also kept in the private inquiry archive when storage is available. If neither succeeds, the form reports an error.
          </li>
          <li>
            <strong>Chatbot:</strong> the questions you ask the site chatbot and its answers are stored so the
            owner can review conversations and improve the service. Conversations are tied to a random ID stored in your browser, not your name. A temporary hashed network address is used to limit repeated requests; the conversation log does not store the address itself.
          </li>
          <li>
            <strong>Basic visit stats:</strong> page views and unique-visitor counts, counted against the same
            random browser ID. The site does not use advertising trackers or keep raw IP addresses in its visit counters.
          </li>
        </ul>

        <h2>Project reviews</h2>
        <p>A review submission includes your name, email, project name, words and publication-consent choice. It is kept privately for verification and is not published automatically. Your email is not shown with a published review. Ask to withdraw it through the contact page or email.</p>

        <h2>Newsletter and client portal</h2>
        <p>Newsletter signups collect your email and a required consent choice. The list is stored privately; no automatic newsletter is currently sent. Ask through the contact page to be removed. A client project page, if your project has one, is protected by a private access code and shows only that project&apos;s status and updates.</p>
        <h2>Private accounts and Build Credit</h2><p>{content.legal.privacyWallet} The owner may store a referral note and an invoice-based credit adjustment; the account does not take payments or permit top-ups. See the <Link href="/wallet-policy">Build Credit policy</Link>.</p>
        <h2>How it is used</h2>
        <ul>
          <li>To send the inquiry to the owner when mail works, and send an automatic confirmation reply only after the owner notification succeeds. If mail is unavailable but the private archive saved your inquiry, the form tells you email delivery is unconfirmed.</li>
          <li>To give new inquiries a hot / warm / cold priority hint. This uses a configured AI service when available and falls back to simple rules otherwise.</li>
          <li>To review chatbot conversations and site usage statistics in a private admin panel.</li>
          <li>To show illustrative local prices, the hosting provider supplies a country code with the request. The app does not keep the visitor IP for this purpose.</li>
          <li>If the owner connects an automation tool (n8n), new inquiries are also sent to that workflow.</li>
        </ul>

        <h2>Request limits</h2>
        <p>For login, chatbot, review, and newsletter abuse prevention, the server uses short-lived limits keyed to a hash of the network address. The hash, not the raw address, is held in the storage system until the limit expires.</p>

        <h2>What this site does not do</h2>
        <ul>
          <li>No advertising trackers and no selling of personal information. The optional newsletter list is used only for project updates when the visitor opts in.</li>
          <li>Your details are not shared with anyone except the services needed to run the site
            (hosting on Vercel, a Redis database, an email provider or FormSubmit for inquiry delivery,
            AI providers when configured for chat and lead scoring, and an n8n workflow if the owner connects one).</li>
        </ul>

        <h2>Your choices</h2>
        <p>
          Want your inquiry or chat history deleted? Ask through the{" "}
          <Link href="/contact">contact form</Link> or email a83017083@gmail.com and it will be removed.
        </p>
      </div>
    </main>
  );
}
