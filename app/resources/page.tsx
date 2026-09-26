import Link from "next/link";
import {SiteChrome} from "../components/SiteChrome";
import {getChatbotSettings,getContent} from "../../lib/content";
import {searchEntries} from "../../lib/search-entries";
import {PageIntro,CtaBand} from "../components/SiteParts";
export const dynamic="force-dynamic";
export const metadata={title:"Free project templates | Build With Abhinav",description:"Download free checklists and worksheets for planning a website or an automation project.",alternates:{canonical:"/resources"}};
export default async function Page(){const [content,chatbot]=await Promise.all([getContent(),getChatbotSettings()]);return <SiteChrome chatbot={chatbot} announcement={content.announcement} whatsappUrl={content.businessWhatsappUrl} searchEntries={searchEntries(content)}><PageIntro n="09" label="FREE RESOURCES" title="Start with a clearer plan." description="Simple downloadable worksheets. No email required, no hidden signup."/><section className="v2-container v2-resource-grid" aria-label="Downloadable resources">{content.resourceCards.map(r=><article className="v2-resource-card" key={r.href}><h2>{r.title}</h2><p>{r.description}</p><a href={r.href} download>Download Markdown ↗</a></article>)}</section><div className="v2-container"><p className="v2-resource-note">These are general starting points. Your project may need different legal, security or accessibility checks.</p><p><Link href="/contact">Have a project in mind? Share the brief ↗</Link></p></div><CtaBand/></SiteChrome>}
