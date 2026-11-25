import { backendReady, database } from "@/lib/supabase";
import { hasAnyRole, parseRoles, type Category, type Kind, type Member, type Parent, type Partner, type Roles, type Status } from "@/lib/model";

export type AdminEntry = {
  id: string; kind: Kind; status: Status; title: string; body: string; category: Category | null;
  image_path: string | null; member_id: string | null; created_at: string; reviewed_at: string | null;
  applied_at: string | null; author_email: string | null;
};
export type AdminUser = {
  id: string; email: string | null; provider: string; created_at: string; last_sign_in_at: string | null;
  confirmed: boolean; blocked: boolean; is_owner: boolean; sections: string[]; submissions: number;
};
export type AdminData = {
  userId: string; roles: Roles; failed: boolean; publicRead: boolean;
  members: Member[]; parents: Parent[]; partners: Partner[]; entries: AdminEntry[]; users: AdminUser[];
};

/** Loads everything the signed-in admin may manage, or null if they have no admin role. */
export async function loadAdmin(): Promise<AdminData | null> {
  if (!backendReady) return null;
  const db = await database();
  const { data: claims } = await db.auth.getClaims();
  const userId = claims?.claims.sub;
  if (!userId) return null;
  const rolesResult = await db.rpc("my_archive_roles");
  const roles = parseRoles(rolesResult.data);
  if (!hasAnyRole(roles)) return null;
  const none = { data: [], error: null };
  const [visibility, members, parents, partners, entries, users] = await Promise.all([
    db.rpc("archive_is_public"),
    db.from("members").select("*"),
    db.from("parents").select("*"),
    db.from("partners").select("*"),
    db.rpc("admin_list_contributions"),
    roles.owner ? db.rpc("admin_list_users") : none,
  ]);
  return {
    userId, roles, publicRead: visibility.data === true,
    failed: [rolesResult, visibility, members, parents, partners, entries, users].some(result => Boolean(result.error)),
    members: members.data ?? [], parents: parents.data ?? [], partners: partners.data ?? [],
    entries: (entries.data ?? []) as AdminEntry[], users: (users.data ?? []) as AdminUser[],
  };
}
