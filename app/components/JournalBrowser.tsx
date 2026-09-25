"use client";
import { useState } from "react";
import ShareLink from "./ShareLink";
import type { Post } from "../../lib/content";
const anchorFor=(p:Post)=>"note-"+encodeURIComponent(p.title.toLowerCase().trim()).replace(/%/g,"-");
export default function JournalBrowser({posts}:{posts:Post[]}) {
  const [query,setQuery]=useState("");
  const visible=posts.filter(p => `${p.title} ${p.excerpt} ${p.body}`.toLowerCase().includes(query.toLowerCase()));
  return <><label className="v2-search-label">Search the journal <input type="search" placeholder="Search notes…" value={query} onChange={e=>setQuery(e.target.value)}/></label><p className="v2-results">{visible.length} {visible.length === 1 ? "note" : "notes"}</p><div className="v2-post-grid">{visible.length ? visible.map((p,i)=><article className="v2-post" key={i} id={anchorFor(p)}><span>{p.date || "Field note"} · {Math.max(1,Math.ceil(p.body.trim().split(/\s+/).length/200))} min read</span><h2>{p.title}</h2><p>{p.excerpt}</p><details><summary>Read note ↓</summary><div className="v2-post-body">{p.body}</div></details><ShareLink title={p.title} anchor={anchorFor(p)}/></article>) : <p>No notes match. Try another search.</p>}</div></>;
}
