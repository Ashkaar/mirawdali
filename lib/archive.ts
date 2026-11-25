import { backendReady, database } from "@/lib/supabase";
import { hasAnyRole, noRoles, parseRoles, type Archive } from "@/lib/model";

export * from "@/lib/model";

export async function loadArchive(): Promise<Archive> {
  const empty: Archive = {
    configured: backendReady, failed: false, publicRead: true, signedIn: false, admin: false, roles: noRoles,
    members: [], parents: [], partners: [], published: [], mine: [],
  };
  if (!backendReady) return empty;
  try {
    const db = await database();
    const session = await db.auth.getClaims();
    const signedIn = Boolean(session.data?.claims.sub);
    const fields = "id,title,body,kind,status,category,image_path,member_id,created_at";
    const [visibility, roles, members, parents, partners, published, mine] = await Promise.all([
      db.rpc("archive_is_public"),
      signedIn ? db.rpc("my_archive_roles") : { data: null, error: null },
      db.from("members").select("*").order("id"),
      db.from("parents").select("*"),
      db.from("partners").select("*"),
      db.from("contributions").select(fields).eq("status","approved").in("kind",["post","photo"]).order("created_at",{ascending:false}).limit(100),
      signedIn ? db.rpc("my_archive_submissions") : { data: [], error: null },
    ]);
    const parsedRoles = parseRoles(roles.data);
    return {
      ...empty, signedIn, roles: parsedRoles, admin: hasAnyRole(parsedRoles), publicRead: visibility.data === true,
      failed: [visibility,roles,members,parents,partners,published,mine].some(result => Boolean(result.error)),
      members: members.data ?? [], parents: parents.data ?? [], partners: partners.data ?? [],
      published: published.data ?? [], mine: mine.data ?? [],
    };
  } catch {
    return { ...empty, publicRead: false, failed: true };
  }
}
