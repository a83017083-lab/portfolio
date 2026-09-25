"use client";

import {useState} from "react";
const PAGES=["/","/about","/work","/stack","/services","/blog","/faq","/contact","/privacy","/terms"] as const;
type Finding={path:string;url:string;status:number;title:string;description:string;canonical:string;h1:string;robots:string;ogTitle:string;issues:string[]};
async function inspect(path:string):Promise<Finding>{
 const url=new URL(path,location.origin).href;
 const res=await fetch(url,{cache:"no-store",credentials:"same-origin"});
 if(!res.ok)throw new Error(`HTTP ${res.status}`);
 const doc=new DOMParser().parseFromString(await res.text(),"text/html");
 const meta=(name:string,property=false)=>doc.querySelector<HTMLMetaElement>(`meta[${property?"property":"name"}="${name}"]`)?.content?.trim()||"";
 const title=doc.title.trim(),description=meta("description"),canonical=doc.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href||"",h1=doc.querySelector("h1")?.textContent?.trim()||"",robots=meta("robots"),ogTitle=meta("og:title",true);
 const issues:string[]=[];
 if(!title)issues.push("Missing title");else if(title.length>70)issues.push(`Long title (${title.length} characters)`);
 if(!description)issues.push("Missing description");else if(description.length>165)issues.push(`Long description (${description.length} characters)`);
 if(!canonical)issues.push("Missing canonical URL");else if(canonical!==url)issues.push("Canonical differs from this page URL");
 if(!h1)issues.push("Missing H1");
 if(!ogTitle)issues.push("Missing Open Graph title");
 if(/noindex/i.test(robots))issues.push("Marked noindex");
 return {path,url,status:res.status,title,description,canonical,h1,robots,ogTitle,issues};
}
export default function SeoChecker(){
 const [rows,setRows]=useState<Finding[]>([]),[errors,setErrors]=useState<{path:string;message:string}[]>([]),[busy,setBusy]=useState(false),[checked,setChecked]=useState(false);
 async function run(){setBusy(true);setChecked(false);setRows([]);setErrors([]);
  const findings:Finding[]=[],failures:{path:string;message:string}[]=[];
  for(const path of PAGES){try{findings.push(await inspect(path))}catch(e){failures.push({path,message:e instanceof Error?e.message:"Could not fetch page"})}}
  setRows(findings);setErrors(failures);setChecked(true);setBusy(false);
 }
 return <><h1>On-site SEO checks</h1><p className="page-sub">Inspect this site's live public pages for basic metadata. This does not measure Google ranking, indexing, performance, or accessibility.</p>
  <div className="admin-panel"><button type="button" className="admin-btn" disabled={busy} onClick={run}>{busy?"Checking pages…":"Check public pages"}</button><p className="hint" style={{marginTop:12}}>Checks each of {PAGES.length} known page URLs on this domain. No external crawler or paid service.</p></div>
  {checked&&<div className="admin-panel"><h2>{rows.length} pages checked, {errors.length} fetch errors</h2>{rows.map(row=><details className="seo-check" key={row.path}><summary><b>{row.path}</b> <span>{row.issues.length?`${row.issues.length} item${row.issues.length===1?"":"s"} to review`:"Basic checks passed"}</span></summary><dl><dt>Title</dt><dd>{row.title||"Missing"}</dd><dt>Description</dt><dd>{row.description||"Missing"}</dd><dt>Canonical</dt><dd>{row.canonical||"Missing"}</dd><dt>H1</dt><dd>{row.h1||"Missing"}</dd><dt>Robots</dt><dd>{row.robots||"No meta robots tag"}</dd></dl>{row.issues.length>0&&<ul>{row.issues.map(issue=><li key={issue}>{issue}</li>)}</ul>}</details>)}{errors.map(e=><p role="alert" key={e.path}>{e.path}: {e.message}</p>)}</div>}
 </>;
}
