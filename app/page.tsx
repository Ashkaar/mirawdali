import { loadArchive } from "@/lib/archive";
import Site from "./ui/site";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ auth?: string }> }) {
  const [archive, query] = await Promise.all([loadArchive(), searchParams]);
  return <Site archive={archive} authResult={query.auth} />;
}
