"use client";
import { useState } from "react";
import type { Project } from "../../lib/content";
import { ProjectCard } from "./SiteParts";
import CaseStudyDetail from "./CaseStudyDetail";
export default function WorkBrowser({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState("All");
  const categories = ["All", ...Array.from(new Set(projects.map(p => p.cat)))];
  const visible = filter === "All" ? projects : projects.filter(p => p.cat === filter);
  return <><div className="v2-filterbar" role="group" aria-label="Filter projects by category">{categories.map(c => <button type="button" aria-pressed={filter === c} key={c} onClick={() => setFilter(c)}>{c}</button>)}</div><div className="v2-project-grid">{visible.map((p,i)=><div className="v2-work-item" key={p.name+i}><ProjectCard project={p} index={i}/><CaseStudyDetail project={p}/></div>)}</div></>;
}
