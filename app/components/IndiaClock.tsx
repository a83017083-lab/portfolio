"use client";
import {useEffect,useState} from "react";
const format=new Intl.DateTimeFormat("en-IN",{timeZone:"Asia/Kolkata",hour:"numeric",minute:"2-digit",hour12:true});
export default function IndiaClock(){
 const [time,setTime]=useState<string|null>(null);
 useEffect(()=>{function update(){setTime(format.format(new Date()))}update();const timer=setInterval(update,60_000);return()=>clearInterval(timer)},[]);
 return <div className="v2-india-clock"><span className="v2-eyebrow">LOCAL TIME / INDIA</span><time suppressHydrationWarning>{time?`${time} IST`:"India time loading…"}</time><p>Based in India. No fixed reply-time promise. Send a note and I&apos;ll get back to you when I can.</p></div>
}
