import ReviewForm from "../components/ReviewForm";
import {SiteChrome} from "../components/SiteChrome";
import {PageIntro} from "../components/SiteParts";
import {searchEntries} from "../../lib/search-entries";
import {getContent,getChatbotSettings} from "../../lib/content";
export const dynamic="force-dynamic";
export const metadata={title:"Submit a project review | Build With Abhinav",description:"Share feedback on a real project. Reviews are checked before any publication.",robots:{index:false,follow:true}};
export default async function Page(){const [content,chatbot]=await Promise.all([getContent(),getChatbotSettings()]);return <SiteChrome chatbot={chatbot} announcement={content.announcement} footer={content.footer} whatsappUrl={content.businessWhatsappUrl} searchEntries={searchEntries(content)}><main><PageIntro n="09" label="PROJECT FEEDBACK" title="Share your experience." description="For people who have actually worked with me. Nothing appears on the website automatically."/><section className="v2-section v2-container"><ReviewForm/></section></main></SiteChrome>}
