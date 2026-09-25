import nodemailer from "nodemailer";

export type Inquiry = {
  id: string;
  ts: number;
  name: string;
  email: string;
  projectType: string;
  budget: string;
  message: string;
  read: boolean;
  score?: "hot" | "warm" | "cold";
  scoreReason?: string;
  scorer?: string;
  status?: "new" | "replied" | "won" | "lost";
  notes?: string; followUpAt?: string;
};

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const SHELL = (inner: string) => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"></head>
<body style="margin:0;padding:0;background:#07070d;">
  <div style="background:#07070d;padding:32px 16px;">
    <div style="max-width:560px;margin:0 auto;background:#101019;border:1px solid rgba(255,255,255,0.10);border-radius:20px;overflow:hidden;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
      <div style="height:4px;background:linear-gradient(90deg,#7c6fff,#22d3ee);"></div>
      ${inner}
      <div style="padding:18px 32px 26px;border-top:1px solid rgba(255,255,255,0.07);">
        <p style="margin:0;color:#6d6f7e;font-size:11.5px;line-height:1.6;">
          Build With Abhinav · <a href="https://buildweth-abhinavk7852.vercel.app" style="color:#7c6fff;text-decoration:none;">buildweth-abhinavk7852.vercel.app</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;

function row(label: string, value: string) {
  return `<tr>
    <td style="padding:9px 0;color:#9799a8;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;width:110px;vertical-align:top;">${label}</td>
    <td style="padding:9px 0;color:#f4f3ef;font-size:14.5px;">${value}</td>
  </tr>`;
}

export function ownerEmailHtml(inq: Inquiry) {
  const when = new Date(inq.ts).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
  const inner = `
    <div style="padding:30px 32px 8px;">
      <p style="margin:0 0 6px;color:#22d3ee;font-size:11.5px;letter-spacing:0.18em;text-transform:uppercase;">New project inquiry</p>
      <h1 style="margin:0;color:#f4f3ef;font-size:23px;line-height:1.25;">${esc(inq.name)} wants to work with you</h1>
    </div>
    <div style="padding:14px 32px 6px;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
        ${row("Email", `<a href="mailto:${esc(inq.email)}" style="color:#22d3ee;text-decoration:none;">${esc(inq.email)}</a>`)}
        ${row("Project", esc(inq.projectType))}
        ${row("Budget", esc(inq.budget))}
        ${row("Sent", when + " IST")}
      </table>
    </div>
    <div style="padding:8px 32px 26px;">
      <p style="margin:0 0 8px;color:#9799a8;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;">Message</p>
      <div style="background:#0b0b14;border:1px solid rgba(255,255,255,0.08);border-radius:13px;padding:16px 18px;color:#f4f3ef;font-size:14.5px;line-height:1.65;white-space:pre-wrap;">${esc(inq.message)}</div>
      <p style="margin:16px 0 0;color:#9799a8;font-size:12.5px;">Tip: just hit reply - it goes straight to ${esc(inq.name.split(" ")[0])}.</p>
    </div>`;
  return SHELL(inner);
}

export function autoReplyHtml(inq: Inquiry) {
  const first = esc(inq.name.trim().split(/\s+/)[0] || "there");
  const inner = `
    <div style="padding:30px 32px 8px;">
      <p style="margin:0 0 6px;color:#22d3ee;font-size:11.5px;letter-spacing:0.18em;text-transform:uppercase;">Build With Abhinav</p>
      <h1 style="margin:0;color:#f4f3ef;font-size:23px;line-height:1.25;">Got it, ${first} - thank you!</h1>
    </div>
    <div style="padding:14px 32px 10px;color:#c9cbd6;font-size:14.5px;line-height:1.7;">
      <p style="margin:0 0 14px;">Your project details just landed in Abhinav's inbox. He reads and replies to every inquiry personally - as soon as he can.</p>
      <div style="background:#0b0b14;border:1px solid rgba(255,255,255,0.08);border-radius:13px;padding:16px 18px;margin:6px 0 16px;">
        <p style="margin:0 0 8px;color:#9799a8;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;">Your inquiry</p>
        <p style="margin:0;color:#f4f3ef;font-size:14px;">${esc(inq.projectType)}${inq.budget && inq.budget !== "Not specified" ? " · " + esc(inq.budget) : ""}</p>
      </div>
      <p style="margin:0;">Meanwhile you can see his work on <a href="https://github.com/a83017083-lab" style="color:#7c6fff;text-decoration:none;">GitHub</a> or <a href="https://www.instagram.com/buildweth_abhinavk7852" style="color:#7c6fff;text-decoration:none;">Instagram</a>.</p>
    </div>
    <div style="padding:4px 32px 26px;">
      <p style="margin:0;color:#f4f3ef;font-size:14.5px;">- Abhinav Kumar<br><span style="color:#9799a8;font-size:12.5px;">Developer &amp; automation builder, New Delhi</span></p>
    </div>`;
  return SHELL(inner);
}

export function mailConfigured() {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

function transporter() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });
}

export async function sendOwnerMail(inq: Inquiry): Promise<boolean> {
  if (!mailConfigured()) return false;
  try {
    await transporter().sendMail({
      from: `"Portfolio Site" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: inq.email,
      subject: `New project inquiry: ${inq.projectType} - ${inq.name}`,
      html: ownerEmailHtml(inq),
      text: `New inquiry from ${inq.name} <${inq.email}>\nProject: ${inq.projectType}\nBudget: ${inq.budget}\n\n${inq.message}`,
    });
    return true;
  } catch (e) {
    console.error("owner mail failed", e);
    return false;
  }
}

export async function sendAutoReply(inq: Inquiry): Promise<boolean> {
  if (!mailConfigured()) return false;
  try {
    await transporter().sendMail({
      from: `"Abhinav Kumar" <${process.env.GMAIL_USER}>`,
      to: inq.email,
      subject: "Got your project inquiry - Abhinav here",
      html: autoReplyHtml(inq),
      text: `Hi ${inq.name},\n\nThanks for reaching out! Your project details just landed in my inbox and I will reply personally as soon as I can.\n\n- Abhinav Kumar`,
    });
    return true;
  } catch (e) {
    console.error("auto reply failed", e);
    return false;
  }
}

// Legacy fallback: Formsubmit delivers its own plain notification.
export async function sendViaFormsubmit(inq: Inquiry): Promise<boolean> {
  try {
    const res = await fetch("https://formsubmit.co/ajax/74b4436968c5e3cace33c7040d07e091", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: `New project inquiry: ${inq.projectType} - ${inq.name}`,
        _template: "table",
        _captcha: "false",
        _replyto: inq.email,
        name: inq.name,
        email: inq.email,
        project_type: inq.projectType,
        budget: inq.budget,
        message: inq.message,
      }),
    });
    const data = await res.json().catch(() => ({}));
    return res.ok && data.success === "true";
  } catch {
    return false;
  }
}
