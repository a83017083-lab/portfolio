"use client";
import {usePathname} from "next/navigation";
export default function PageTransitions({children}:{children:React.ReactNode}){const path=usePathname();return <div key={path} className="v2-page-transition">{children}</div>}
