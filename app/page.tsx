import Home from "./components/Home";
import { getContent, getChatbotSettings } from "../lib/content";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [content, chatbot] = await Promise.all([getContent(), getChatbotSettings()]);
  return <Home content={content} chatbot={chatbot} />;
}
