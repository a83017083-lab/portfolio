"use client";
import {useState} from "react";
import type {Project} from "../../lib/content";
export default function ProjectIdeaPlan({project}:{project:Project}){
 const [open,setOpen]=useState(false);
 return <div className="v2-project-plan"><button type="button" aria-expanded={open} onClick={()=>setOpen(!open)}>{open?"Hide project scope":"Plan a similar project"} <span aria-hidden="true">{open?"−":"+"}</span></button>{open&&<div><p>Inspired by <strong>{project.name}</strong>. Its public repository shows an example of a build, not a template or a promise of matching results.</p><ol><li>Write down who will use the new project and the one task they need to finish.</li><li>Choose which parts from this project are relevant and which need a different approach.</li><li>List integrations, content, access and privacy needs.</li><li>Discuss scope, timing and a custom quote before work begins.</li></ol><a href="/contact">Talk through a similar idea ↗</a></div>}</div>
}
