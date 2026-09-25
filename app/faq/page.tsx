import ContentPage from "../components/ContentPage";
import { getContent, getChatbotSettings } from "../../lib/content";
export const dynamic = "force-dynamic";
export const metadata = { title: "FAQ | Build With Abhinav", description: "Answers about projects, sample prices and requesting a demo at Build With Abhinav.", alternates: { canonical: "/faq" } };
export default async function Page() { const [content, chatbot] = await Promise.all([getContent(), getChatbotSettings()]); return <ContentPage kind="faq" content={content} chatbot={chatbot} />; }
