import ContentPage from "../components/ContentPage";
import { getContent, getChatbotSettings } from "../../lib/content";
export const dynamic = "force-dynamic";
export const metadata = { title: "About Build With Abhinav | Student Builder in India", description: "The approach behind Build With Abhinav: building useful websites and automation tools in public.", alternates: { canonical: "/about" } };
export default async function Page() { const [content, chatbot] = await Promise.all([getContent(), getChatbotSettings()]); return <ContentPage kind="about" content={content} chatbot={chatbot} />; }
