"use client";
import {useEffect,useState} from "react";
export default function AdminTheme(){const[light,setLight]=useState(false);useEffect(()=>{setLight(localStorage.getItem("admin-light")==="1")},[]);useEffect(()=>{document.body.classList.toggle("admin-light-mode",light);localStorage.setItem("admin-light",light?"1":"0");return()=>document.body.classList.remove("admin-light-mode")},[light]);return <button type="button" className="admin-tab" onClick={()=>setLight(!light)}>{light?"☾ Dark admin":"☀ Light admin"}</button>}
