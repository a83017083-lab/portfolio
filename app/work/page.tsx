import ContentPage from "../components/ContentPage";
import { getContent, getChatbotSettings } from "../../lib/content";
export const dynamic = "force-dynamic";
export const metadata = { title: "Work | Build With Abhinav Portfolio", description: "Projects and code from Build With Abhinav, a student web developer in India.", alternates: { canonical: "/work" } };
export default async function Page() { const [content, chatbot] = await Promise.all([getContent(), getChatbotSettings()]); return <ContentPage kind="work" content={content} chatbot={chatbot} />; }
