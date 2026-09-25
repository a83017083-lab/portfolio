export default function ServiceFaqSchema() {
  const data={"@context":"https://schema.org","@type":"FAQPage",mainEntity:[{"@type":"Question",name:"What does Build With Abhinav build?",acceptedAnswer:{"@type":"Answer",text:"Websites, AI automation workflows including n8n, and AI chatbots for websites."}},{"@type":"Question",name:"Are starting prices final?",acceptedAnswer:{"@type":"Answer",text:"No. Listed prices are illustrative starting points. A final quote depends on project scope."}}]};
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(data)}}/>;
}
