import { NextResponse } from "next/server";
import { isAuthed } from "../../../../lib/admin-guard";
import { listConversations, getConversation } from "../../../../lib/chatlog";

export async function GET(req: Request) {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sid = new URL(req.url).searchParams.get("sid");
  if (sid) {
    const messages = await getConversation(sid);
    return NextResponse.json({ messages });
  }
  const conversations = await listConversations();
  return NextResponse.json({ conversations });
}
