import ContentPage from "../components/ContentPage";
import { getContent, getChatbotSettings } from "../../lib/content";
export const dynamic = "force-dynamic";
export const metadata = { title: "Contact | Build With Abhinav", description: "Ask about affordable websites, n8n automation or an AI chatbot for your website. Request a demo conversation.", alternates: { canonical: "/contact" } };
export default async function Page() { const [content, chatbot] = await Promise.all([getContent(), getChatbotSettings()]); return <ContentPage kind="contact" content={content} chatbot={chatbot} />; }
