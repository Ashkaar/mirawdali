import { backendReady, database } from "@/lib/supabase";

export async function GET(_: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  if (!backendReady || !/^[a-f0-9-]{36}\/[a-f0-9-]{36}\.webp$/.test(path.join("/"))) {
    return new Response(null, { status: 404 });
  }
  const { data, error } = await (await database()).storage.from("archive-photos").download(path.join("/"));
  if (error || !data) return new Response(null, { status: 404, headers: { "Cache-Control": "private, no-store" } });
  return new Response(data, {
    headers: { "Content-Type": "image/webp", "Cache-Control": "private, no-store" },
  });
}
