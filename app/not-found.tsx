import Link from "next/link";
export const metadata = {title:"Page not found | Build With Abhinav",robots:{index:false,follow:false}};
export default function NotFound(){return <main className="v2-404"><span>404 / LOST IN THE BUILD</span><h1>That page wandered off.</h1><p>There isn't a page at this address. Try the work, services or homepage instead.</p><div><Link href="/">Home ↗</Link><Link href="/work">Explore work ↗</Link><Link href="/services">Services ↗</Link></div></main>}
