"use client";
import {useEffect,useState} from "react";

type Inquiry={id:string;ts:number};
export default function GoalTracker({inquiries,storage}:{inquiries:Inquiry[]|null;storage:boolean}){
 const [month,setMonth]=useState(()=>new Date().toLocaleDateString("en-CA",{timeZone:"Asia/Kolkata"}).slice(0,7));
 const [target,setTarget]=useState("");
 const [saved,setSaved]=useState<number|null>(null);
 const [status,setStatus]=useState("");
 const [busy,setBusy]=useState(false);
 useEffect(()=>{let active=true;setSaved(null);setTarget("");setStatus("");
  fetch(`/api/admin/goals?month=${encodeURIComponent(month)}`,{cache:"no-store"}).then(async r=>{const d=await r.json();if(!active)return;if(!r.ok){setStatus(d.error||"Could not load goal");return}setSaved(d.target);setTarget(d.target===null?"":String(d.target))}).catch(()=>{if(active)setStatus("Could not load goal")});return()=>{active=false};
 },[month]);
 const count=(inquiries||[]).filter(i=>new Date(i.ts).toLocaleDateString("en-CA",{timeZone:"Asia/Kolkata"}).startsWith(month)).length;
 const valid=target!==""&&/^\d+$/.test(target)&&Number(target)<=100000;
 async function save(){if(!valid||busy)return;setBusy(true);setStatus("");try{
  const res=await fetch("/api/admin/goals",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({month,target:Number(target)})});const d=await res.json();if(!res.ok)throw new Error(d.error||"Could not save goal");setSaved(d.target);setStatus("Saved");
 }catch(e){setStatus(e instanceof Error?e.message:"Could not save goal")}finally{setBusy(false)}}
 return <><h1>Inquiry goals</h1><p className="page-sub">Set a private monthly inquiry target. This does not track revenue or pretend an inquiry is a won deal.</p><div className="admin-panel"><div className="admin-row2"><label className="admin-field"><span>Month (India time)</span><input type="month" min="2020-01" max="2100-12" value={month} onChange={e=>setMonth(e.target.value)}/></label><label className="admin-field"><span>Target inquiries</span><input type="number" min="0" max="100000" step="1" value={target} onChange={e=>setTarget(e.target.value)} placeholder="Set a target"/></label></div><button className="admin-btn" type="button" onClick={save} disabled={!storage||!valid||busy}>{busy?"Saving…":"Save target"}</button><p role="status" className="hint">{status}</p></div><div className="admin-panel"><h2>{month} progress</h2><p>{inquiries===null?"Loading inquiries…":`${count} inquiries in the loaded archive`}{saved===null?" · No target set":` / ${saved} target inquiries`}</p>{saved!==null&&saved>0&&<progress value={Math.min(count,saved)} max={saved} aria-label="Inquiry goal progress"/>}<p className="hint">The admin archive loads at most 200 recent inquiries. Older records may be missing here, so this is not a complete historical total. Zero target means no progress percentage.</p></div></>;
}
