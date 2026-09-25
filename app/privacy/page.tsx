import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What this site collects and how it is used - plain language privacy policy for buildweth-abhinavk7852.vercel.app.",
};

export default function Privacy() {
  return (
    <main className="legal-page">
      <div className="wrap">
        <h1>Privacy Policy</h1>
        <p className="legal-updated">Last updated: 25 September 2026</p>

        <p>
          This site is run by Abhinav Kumar ("Build With Abhinav"), New Delhi, India. This page explains,
          in plain language, what information this site collects and what happens to it.
        </p>

        <h2>What this site collects</h2>
        <ul>
          <li>
            <strong>Contact / inquiry form:</strong> your name, email address, the service and budget you pick,
            and the message you write. This is used to reply to your inquiry and is emailed to the site owner
            and stored in a secure database (Redis) so it can be managed in the site's admin panel.
          </li>
          <li>
            <strong>Chatbot:</strong> the questions you ask the site chatbot and its answers are stored so the
            owner can review conversations and improve the service. Conversations are tied to a random ID
            stored in your browser, not to your name, IP address, or device identity.
          </li>
          <li>
            <strong>Basic visit stats:</strong> page views and unique-visitor counts, counted against the same
            random browser ID. No IP addresses or advertising trackers are stored.
          </li>
        </ul>

        <h2>Project reviews</h2>
        <p>A review submission includes your name, email, project name, words and publication-consent choice. It is kept privately for verification and is not published automatically. Your email is not shown with a published review. Ask to withdraw it through the contact page or email.</p>

        <h2>Newsletter and client portal</h2>
        <p>Newsletter signups collect your email and a required consent choice. The list is stored privately; no automatic newsletter is currently sent. Ask through the contact page to be removed. A client project page, if your project has one, is protected by a private access code and shows only that project&apos;s status and updates.</p>
        <h2>How it is used</h2>
        <ul>
          <li>To reply to your inquiry by email, including an automatic confirmation reply.</li>
          <li>To score new inquiries (hot / warm / cold) with an AI service, so the owner can prioritize replies.</li>
          <li>To review chatbot conversations and site usage statistics in a private admin panel.</li>
          <li>To show illustrative local prices, the hosting provider supplies a country code with the request. The site does not save the visitor IP for this purpose.</li>
          <li>If the owner connects an automation tool (n8n), new inquiries are also sent to that workflow.</li>
        </ul>

        <h2>What this site does not do</h2>
        <ul>
          <li>No advertising trackers and no selling of personal information. The optional newsletter list is used only for project updates when the visitor opts in.</li>
          <li>Your details are not shared with anyone except the services needed to run the site
            (hosting on Vercel, a Redis database, Gmail for email, and AI providers that power the chatbot
            and lead scoring).</li>
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
