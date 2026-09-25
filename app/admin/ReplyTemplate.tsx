"use client";

import { useState } from "react";

type Inquiry = {id:string;name:string;email:string;projectType:string};
const safeFirst = (name:string) => name.trim().split(/\s+/)[0].slice(0,40) || "there";
const templates = {
  acknowledge: (name:string) => `Hi ${name},\n\nThanks for getting in touch. I read your inquiry and will take a closer look at the details. I'll reply with questions or next steps.\n\nAbhinav`,
  clarify: (name:string) => `Hi ${name},\n\nThanks for sharing your project. Could you tell me a little more about what you need, your timeline, and what is most important for the first version?\n\nAbhinav`,
  discuss: (name:string) => `Hi ${name},\n\nThanks for your inquiry. I'd like to understand the project better before suggesting a plan or price. Are you open to discussing the scope by email?\n\nAbhinav`,
} as const;
type Choice = keyof typeof templates;
export default function ReplyTemplate({inquiry}:{inquiry:Inquiry}) {
  const [choice,setChoice]=useState<Choice>("acknowledge");
  const [body,setBody]=useState(() => templates.acknowledge(safeFirst(inquiry.name)));
  const [open,setOpen]=useState(false);
  const subject=`Re: ${inquiry.projectType.slice(0,80)} inquiry`;
  function select(next:Choice){setChoice(next);setBody(templates[next](safeFirst(inquiry.name)));}
  return <div className="reply-template"><button className="admin-btn small" type="button" aria-expanded={open} onClick={()=>setOpen(!open)}>Prepare reply</button>
    {open&&<div className="reply-preview"><p className="hint">This opens your email app as a draft. Review the address and words there before sending. Nothing is sent here.</p>
      <label className="admin-field"><span>Recipient</span><input readOnly value={inquiry.email}/></label>
      <label className="admin-field"><span>Starting point</span><select value={choice} onChange={e=>select(e.target.value as Choice)}><option value="acknowledge">Acknowledge</option><option value="clarify">Ask for details</option><option value="discuss">Discuss scope</option></select></label>
      <label className="admin-field"><span>Edit your reply</span><textarea value={body} onChange={e=>setBody(e.target.value)} rows={9} maxLength={4000}/></label>
      <a className="admin-btn small" href={`mailto:${encodeURIComponent(inquiry.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}>Open email draft ↗</a>
    </div>}</div>;
}
