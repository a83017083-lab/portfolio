import { NextResponse } from "next/server";
import { isAuthed } from "../../../../lib/admin-guard";
import { getStats } from "../../../../lib/chatlog";

export async function GET() {
  if (!isAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const stats = await getStats();
  return NextResponse.json(stats);
}
