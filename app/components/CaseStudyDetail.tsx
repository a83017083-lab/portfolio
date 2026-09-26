"use client";
import {useState} from "react";
import type {Project} from "../../lib/content";
export default function CaseStudyDetail({project}:{project:Project}){
 const [open,setOpen]=useState(false);
 return <div className="v2-case-detail"><button type="button" aria-expanded={open} onClick={()=>setOpen(!open)}>{open?"Hide project notes":"View project notes"} <span aria-hidden="true">{open?"−":"+"}</span></button>{open&&<div className="v2-case-body"><h4>{project.name}</h4><p>{project.desc}</p><p><strong>Published stack:</strong> {project.tags.join(" · ")}</p><a href={project.href} target="_blank" rel="noopener noreferrer">Explore the public repository ↗</a><a href={`/api/projects/brief?project=${encodeURIComponent(project.href)}`}>Download project notes (PDF) ↓</a><p className="v2-case-disclaimer">No before/after results are claimed here. A side-by-side comparison needs verified screenshots from the same project.</p></div>}</div>
}
