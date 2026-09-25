"use client";

import {useState} from "react";
type Result={path:string;code:number|null;duration:number;ok:boolean;note:string};
const CHECKS=[{path:"/",expect:[200],note:"Homepage"},{path:"/work",expect:[200],note:"Work"},{path:"/services",expect:[200],note:"Services"},{path:"/contact",expect:[200],note:"Contact"},{path:"/admin/login",expect:[200],note:"Admin sign-in screen"},{path:"/api/admin/inquiries",expect:[200],note:"Private inquiry archive"}] as const;
export default function HealthCheck(){
 const [results,setResults]=useState<Result[]>([]),[checking,setChecking]=useState(false),[asOf,setAsOf]=useState<string|null>(null);
 async function check(){setChecking(true);setResults([]);setAsOf(null);const next:Result[]=[];
  for(const item of CHECKS){const start=performance.now();try{const ctrl=new AbortController();const timeout=setTimeout(()=>ctrl.abort(),8000);let res:Response;try{res=await fetch(item.path,{cache:"no-store",credentials:"same-origin",signal:ctrl.signal})}finally{clearTimeout(timeout)}let ok=(item.expect as readonly number[]).includes(res.status);
   if(item.path==="/api/admin/inquiries"&&res.ok){const archive=await res.json().catch(()=>null);ok=ok&&archive?.storage===true&&Array.isArray(archive?.inquiries)}
   next.push({path:item.path,code:res.status,duration:Math.round(performance.now()-start),ok,note:item.note})}catch{next.push({path:item.path,code:null,duration:Math.round(performance.now()-start),ok:false,note:item.note})}}
  setResults(next);setAsOf(new Date().toLocaleString());setChecking(false);
 }
 return <><h1>Site health</h1><p className="page-sub">Run a quick check from your browser. This is not continuous uptime monitoring, external reachability, or an alert system.</p>
  <div className="admin-panel"><button className="admin-btn" type="button" onClick={check} disabled={checking}>{checking?"Checking…":"Check site now"}</button><p className="hint" style={{marginTop:12}}>Checks public pages, sign-in, and your authenticated inquiry archive. Never submits a form or sends mail.</p></div>
  {asOf&&<div className="admin-panel"><h2>Checked {asOf}</h2>{results.map(r=><div className="health-row" key={r.path}><span aria-label={r.ok?"Passed":"Needs attention"}>{r.ok?"✓":"!"}</span><b>{r.note}</b><code>{r.path}</code><small>{r.code??"No response"} · {r.duration} ms</small></div>)}<p className="hint">A passing check means these URLs answered during this run and the inquiry archive reported storage connected. Writes, email delivery and booking still need their own end-to-end tests.</p></div>}
 </>;
}
