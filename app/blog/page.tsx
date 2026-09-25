import ContentPage from "../components/ContentPage";
import { getContent, getChatbotSettings } from "../../lib/content";
export const dynamic = "force-dynamic";
export const metadata = { title: "Journal | Build With Abhinav", description: "Notes about web development, AI automation and building useful digital tools.", alternates: { canonical: "/blog" } };
export default async function Page() { const [content, chatbot] = await Promise.all([getContent(), getChatbotSettings()]); return <ContentPage kind="blog" content={content} chatbot={chatbot} />; }
