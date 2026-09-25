"use client";
import { useState } from "react";
import type { Package } from "../../lib/content";
export default function Comparison({packages,region}:{packages:Package[];region:string}) {
  const [first,setFirst]=useState(0),[second,setSecond]=useState(1);
  if(packages.length<2) return null;
  const a=packages[first],b=packages[second];
  return <div className="v2-compare"><h3>Compare starting points</h3><p>These are example packages, not final quotes. Pick two to see what differs.</p><div className="v2-compare-selects"><label>Option A <select value={first} onChange={e=>setFirst(Number(e.target.value))}>{packages.map((p,i)=><option key={i} value={i}>{p.name}</option>)}</select></label><label>Option B <select value={second} onChange={e=>setSecond(Number(e.target.value))}>{packages.map((p,i)=><option key={i} value={i}>{p.name}</option>)}</select></label></div><div className="v2-compare-columns">{[a,b].map((p,i)=><div key={i}><h4>{p.name}</h4><strong>{p.regionalPrices?.[region]||p.regionalPrices?.OTHER||p.price}</strong><ul>{p.features.map(f=><li key={f}>{f}</li>)}</ul></div>)}</div></div>;
}
