import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { loadAdmin } from "@/lib/admin";
import AdminPanel from "./panel";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin | Mirawdali", robots: { index: false, follow: false } };

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string; edit?: string }> }) {
  const [data, query] = await Promise.all([loadAdmin(), searchParams]);
  if (!data) redirect("/");
  return <AdminPanel data={data} initialTab={query.tab} editMemberId={query.edit} />;
}
