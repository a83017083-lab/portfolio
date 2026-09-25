import Link from "next/link";
import { getContent,getChatbotSettings } from "../../lib/content";
import { SiteChrome } from "../components/SiteChrome";
import { PageIntro,CtaBand } from "../components/SiteParts";
export const dynamic="force-dynamic";
export const metadata={title:"Tools & Stack | Build With Abhinav",description:"The development tools used across Build With Abhinav projects.",alternates:{canonical:"/stack"}};
export default async function Page(){const [content,chatbot]=await Promise.all([getContent(),getChatbotSettings()]);const stack=["Next.js","TypeScript","React","n8n","Node.js","Supabase","PostgreSQL","Tailwind CSS"];return <SiteChrome chatbot={chatbot} announcement={content.announcement} content={content}><main><PageIntro n="01" label="TOOLBOX" title="The tools behind the builds." description="A practical mix of design, development and automation tools. Different problems call for different tools."/><section className="v2-section v2-container"><div className="v2-stack-grid">{stack.map((name,i)=><article key={name}><span>0{i+1}</span><h2>{name}</h2><p>Used where it fits the project.</p></article>)}</div><p style={{marginTop:30}}>See the actual stack on each <Link href="/work" className="v2-text-link">project ↗</Link>.</p></section><CtaBand/></main></SiteChrome>}
