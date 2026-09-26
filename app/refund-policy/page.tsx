import Link from "next/link";
import {getContent} from "../../lib/content";
export const dynamic="force-dynamic";
export const metadata={title:"Refund policy",description:"This website does not collect payments. How to ask about an outside-site invoice.",alternates:{canonical:"/refund-policy"}};
export default async function Page(){const c=await getContent();return <main className="legal-page"><div className="wrap"><h1>Refund policy</h1><p className="legal-updated">Last updated: 26 September 2026</p><p>{c.legal.refundDetails}</p><p>Build Credit is not a payment balance or cash account. It is a private record of possible invoice adjustments; see the <Link href="/wallet-policy">Build Credit policy</Link>.</p><p>Questions? <Link href="/contact">Contact the owner</Link>.</p></div></main>}
