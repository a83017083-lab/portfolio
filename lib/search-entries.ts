import type {SiteContent} from "./content";
export type SearchEntry={label:string;href:string;words:string};
export function searchEntries(content:SiteContent):SearchEntry[]{return [
 ...content.projects.map(p=>({label:`Project: ${p.name}`,href:"/work",words:`${p.name} ${p.desc} ${p.tags.join(" ")}`})),
 ...content.services.map(s=>({label:`Service: ${s.title}`,href:"/services",words:`${s.title} ${s.desc} ${s.tags.join(" ")}`})),
 ...content.posts.filter(p=>p.published&&(!p.publishAt||p.publishAt<=new Date().toISOString())).map(p=>({label:`Journal: ${p.title}`,href:"/blog",words:`${p.title} ${p.excerpt} ${p.body}`})),
 ...content.faqs.filter(f=>f.published).map(f=>({label:`FAQ: ${f.question}`,href:"/faq",words:`${f.question} ${f.answer}`}))
]}
