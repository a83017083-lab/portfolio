import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAuthed } from "../../lib/admin-guard";
import AdminApp from "./AdminApp";

export const metadata: Metadata = {
  title: "Admin - Abhinav Kumar",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminPage() {
  if (!isAuthed()) redirect("/admin/login");
  return <AdminApp />;
}
