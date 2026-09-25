import { headers } from "next/headers";
import ServiceFaqSchema from "./faq-jsonld";
import ContentPage from "../components/ContentPage";
import { getContent, getChatbotSettings } from "../../lib/content";
export const dynamic = "force-dynamic";
export const metadata = { title: "Services | Websites, n8n Automation & AI Chatbots", description: "Affordable website development in Delhi and AI automation for small businesses, including n8n workflows and website chatbots. Sample starting prices.", alternates: { canonical: "/services" } };
export default async function Page() { const [content, chatbot] = await Promise.all([getContent(), getChatbotSettings()]); const country = headers().get("x-vercel-ip-country")?.toUpperCase() || "";
 const region = country === "IN" ? "IN" : country === "US" ? "US" : country === "GB" ? "GB" : ["DE","FR","IT","ES","NL","IE","BE","PT","AT","FI","GR","LU"].includes(country) ? "EU" : ["AE","CA","AU","SG","JP"].includes(country) ? country : "OTHER";
 return <><ServiceFaqSchema/><ContentPage kind="services" content={content} chatbot={chatbot} region={region} /></>; }
