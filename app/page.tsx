import ContentPage from "./components/ContentPage";
import { getContent, getChatbotSettings } from "../lib/content";
export const dynamic = "force-dynamic";
export const metadata = { title: "Build With Abhinav | Student Web Developer & AI Automation India", description: "Student web developer in India building websites and AI automations for small businesses. Explore projects, services and ways to get in touch.", alternates: { canonical: "/" } };
export default async function Page() { const [content, chatbot] = await Promise.all([getContent(), getChatbotSettings()]); return <ContentPage kind="home" content={content} chatbot={chatbot} />; }
