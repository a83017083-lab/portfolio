import { audit } from "../../../../lib/audit";
import { NextResponse } from "next/server";
import { isAuthed } from "../../../../lib/admin-guard";
import { getContent, saveContent, DEFAULT_CONTENT, SiteContent } from "../../../../lib/content";

export async function GET() {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const content = await getContent();
  return NextResponse.json({ content, defaults: DEFAULT_CONTENT });
}

export async function PUT(req: Request) {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { content?: SiteContent } | null;
  if (!body?.content || !Array.isArray(body.content.projects) || !Array.isArray(body.content.services)) {
    return NextResponse.json({ error: "Bad content shape" }, { status: 400 });
  }
  const content = body.content;
  if (JSON.stringify(content).length > 120000 || (content.demoUrl && (!/^https:\/\//.test(content.demoUrl) || content.demoUrl.length > 500)) || (content.posts && (!Array.isArray(content.posts) || content.posts.length > 100)) || (content.testimonials && (!Array.isArray(content.testimonials) || content.testimonials.length > 100))) {
    return NextResponse.json({ error: "Invalid or oversized content" }, { status: 400 });
  }
  if (content.stackItems && (!Array.isArray(content.stackItems)||content.stackItems.length>25||content.stackItems.some(x=>typeof x!=="string"||x.length>80))) return NextResponse.json({error:"Invalid stack"},{status:400});
  if (content.resourceCards && (!Array.isArray(content.resourceCards)||content.resourceCards.length>20||content.resourceCards.some(r=>!r||typeof r.title!=="string"||r.title.length>100||typeof r.description!=="string"||r.description.length>400||typeof r.href!=="string"||!/^\/resources\/[a-z0-9-]+\.md$/.test(r.href)))) return NextResponse.json({error:"Invalid resource cards"},{status:400});
  if (content.legal && (typeof content.legal!=="object" || Object.values(content.legal).some(v=>typeof v!=="string"||v.length>3500))) return NextResponse.json({error:"Invalid legal copy"},{status:400});
  if (content.faqs && (!Array.isArray(content.faqs) || content.faqs.length > 100)) return NextResponse.json({error:"Invalid FAQ"},{status:400});
  if (content.projects.some(p => p.href && !/^https:\/\//.test(p.href)) || content.projects.some(p => p.img && !/^\/images\/[a-zA-Z0-9._-]+$/.test(p.img))) {
    return NextResponse.json({ error: "Project links must be HTTPS and images must be built-in image paths" }, { status: 400 });
  }
  if (content.businessWhatsappUrl && !/^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(content.businessWhatsappUrl)) return NextResponse.json({error:"Business WhatsApp URL must be a WhatsApp link"},{status:400});
  const ok = await saveContent(content);
  if (!ok) return NextResponse.json({ error: "Storage unavailable - is KV connected?" }, { status: 503 });
  await audit("site-content", "Site content saved");
  return NextResponse.json({ ok: true });
}
