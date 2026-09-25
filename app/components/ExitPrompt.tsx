"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
const KEY="portfolio-resource-prompt-dismissed";
export default function ExitPrompt(){
 const [open,setOpen]=useState(false);
 useEffect(()=>{
  if(window.matchMedia("(pointer: coarse)").matches||sessionStorage.getItem(KEY))return;
  function exit(e:MouseEvent){if(e.relatedTarget||e.clientY>0||sessionStorage.getItem(KEY))return;setOpen(true);sessionStorage.setItem(KEY,"1")}
  document.addEventListener("mouseout",exit);
  return()=>document.removeEventListener("mouseout",exit);
 },[]);
 if(!open)return null;
 return <aside className="v2-exit-prompt" aria-label="Free project planning resources"><button type="button" className="v2-exit-close" aria-label="Dismiss resources suggestion" onClick={()=>setOpen(false)}>×</button><span>BEFORE YOU GO</span><p>Have a project idea? The free worksheets can help you plan it.</p><Link href="/resources" onClick={()=>setOpen(false)}>See free resources ↗</Link></aside>;
}
