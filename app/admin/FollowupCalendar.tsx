"use client";

import { useEffect, useMemo, useState } from "react";

type Followup = { id:string; name:string; projectType:string; status?:string; followUpAt?:string };
const dateKey = (year:number, month:number, day:number) => `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

export default function FollowupCalendar({ inquiries }:{ inquiries:Followup[] | null }) {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0,7));
  useEffect(() => setMonth(new Intl.DateTimeFormat("en-CA", {timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit"}).format(new Date()).slice(0,7)), []);
  const [year, monthNo] = month.split("-").map(Number);
  const valid = Number.isInteger(year) && Number.isInteger(monthNo) && year >= 1900 && year <= 2100 && monthNo >= 1 && monthNo <= 12;
  const offset = valid ? new Date(year,monthNo-1,1).getDay() : 0;
  const days = valid ? new Date(year,monthNo,0).getDate() : 0;
  const byDate = useMemo(() => {
    const grouped = new Map<string,Followup[]>();
    for(const item of inquiries || []) {
      if(!/^\d{4}-\d{2}-\d{2}$/.test(item.followUpAt || "") || ["won","lost"].includes(item.status || "")) continue;
      const date = item.followUpAt!;
      grouped.set(date,[...(grouped.get(date) || []),item]);
    }
    return grouped;
  },[inquiries]);
  const prev = () => { const d=new Date(year,monthNo-2,1);setMonth(dateKey(d.getFullYear(),d.getMonth()+1,1).slice(0,7)); };
  const next = () => { const d=new Date(year,monthNo,1);setMonth(dateKey(d.getFullYear(),d.getMonth()+1,1).slice(0,7)); };
  return <><h1>Follow-up calendar</h1><p className="page-sub">Upcoming inquiry follow-ups. These dates do not create calendar invitations or send reminders by themselves.</p>
    <div className="admin-panel"><div className="followup-controls"><button type="button" className="admin-btn secondary small" onClick={prev} aria-label="Previous month">←</button><label className="admin-field"><span>Month</span><input type="month" min="1900-01" max="2100-12" value={month} onChange={e=>setMonth(e.target.value)}/></label><button type="button" className="admin-btn secondary small" onClick={next} aria-label="Next month">→</button></div>
      <div className="followup-calendar" aria-label={`Follow-ups for ${month}`}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day=><div key={day} className="followup-weekday">{day}</div>)}
        {Array.from({length:offset},(_,i)=><div className="followup-day empty" key={`empty-${i}`}/>)}
        {Array.from({length:days},(_,i)=>{const day=i+1, key=dateKey(year,monthNo,day), entries=byDate.get(key)||[];return <div className="followup-day" key={key} aria-label={`${key}: ${entries.length} follow-ups`}><time dateTime={key}>{day}</time>{entries.map(item=><a href={`#followup-${item.id}`} key={item.id} title={`${item.name}: ${item.projectType}`}><strong>{item.name}</strong><span>{item.projectType}</span></a>)}</div>})}
      </div>
      <div className="followup-details">{Array.from(byDate).filter(([date])=>date.startsWith(month)).sort(([a],[b])=>a.localeCompare(b)).flatMap(([date,entries])=>entries.map(item=><div id={`followup-${item.id}`} className="inq-item" key={item.id}><b>{date}</b> · {item.name} · {item.projectType} <span className="hint">{item.status || 'new'}</span></div>))}{!Array.from(byDate.keys()).some(date=>date.startsWith(month))&&<p>No open follow-ups in this month.</p>}</div>
    </div></>;
}
