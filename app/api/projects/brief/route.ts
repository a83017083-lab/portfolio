import {NextRequest,NextResponse} from "next/server";
import {PDFDocument,StandardFonts,rgb} from "pdf-lib";
import {getContent} from "../../../../lib/content";
export const dynamic="force-dynamic";
const printable=(value:string)=>value.replace(/³/g,"3").normalize("NFKD").replace(/[^\x20-\x7E]/g,"?").slice(0,1200);
function wrap(text:string,max=90){const words=printable(text).split(/\s+/);const lines:string[]=[];let line="";for(const word of words){if((line+" "+word).length>max){lines.push(line);line=word}else line+=(line?" ":"")+word}if(line)lines.push(line);return lines;}
export async function GET(req:NextRequest){
 const key=req.nextUrl.searchParams.get("project")||"";
 if(key.length>300)return NextResponse.json({error:"Invalid project"},{status:400});
 const content=await getContent();
 const project=content.projects.find(p=>p.href===key);
 if(!project)return NextResponse.json({error:"Project not found"},{status:404});
 const pdf=await PDFDocument.create();const page=pdf.addPage([595,842]);const regular=await pdf.embedFont(StandardFonts.Helvetica),bold=await pdf.embedFont(StandardFonts.HelveticaBold);
 const ink=rgb(.09,.18,.15),muted=rgb(.36,.43,.39);let y=782;
 page.drawText("BUILD WITH ABHINAV / PROJECT NOTES",{x:54,y,font:bold,size:11,color:muted});y-=60;
 for(const line of wrap(project.name,37)){page.drawText(line,{x:54,y,font:bold,size:26,color:ink});y-=37}y-=20;
 page.drawText("WHAT THE PUBLIC PROJECT SHOWS",{x:54,y,font:bold,size:11,color:muted});y-=28;
 for(const line of wrap(project.desc,77)){page.drawText(line,{x:54,y,font:regular,size:12,color:ink});y-=20}y-=26;
 page.drawText("PUBLISHED STACK",{x:54,y,font:bold,size:11,color:muted});y-=27;
 for(const line of wrap(project.tags.join(" / "),77)){page.drawText(line,{x:54,y,font:regular,size:12,color:ink});y-=20}y-=30;
 page.drawText("SOURCE",{x:54,y,font:bold,size:11,color:muted});y-=27;
 for(const line of wrap(project.href,77)){page.drawText(line,{x:54,y,font:regular,size:11,color:ink});y-=19}y-=38;
 for(const line of wrap("This is a short project summary, not a verified before/after case study. No client outcome, metric or date is claimed.",77)){page.drawText(line,{x:54,y,font:regular,size:11,color:muted});y-=19}
 page.drawText("Source: public project listing. Check the repository for the latest work.",{x:54,y:59,font:regular,size:9,color:muted});
 const bytes=await pdf.save();return new NextResponse(Buffer.from(bytes),{headers:{"Content-Type":"application/pdf","Content-Disposition":"attachment; filename=project-notes.pdf","Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
}
