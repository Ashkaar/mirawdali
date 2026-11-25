import { backendReady, database } from "@/lib/supabase";

export const categoryKeys = ["memories","history","news"] as const;
export type Category = typeof categoryKeys[number];
export type Kind = "post" | "photo" | "suggestion";
export type Status = "pending" | "approved" | "rejected";
export type Member = {
  id: string; name_en: string | null; name_ckb: string | null;
  gender: "male" | "female" | "other" | "unspecified";
  birth_year: number | null; death_year: number | null; photo_path: string | null;
};
export type Parent = { child_id: string; parent_id: string };
export type Partner = { first_id: string; second_id: string };
export type Submission = { id: string; title: string; kind: Kind; status: Status; created_at: string };
export type Contribution = Submission & { body: string; category: Category | null; image_path: string | null; member_id: string | null };
export type Archive = {
  configured: boolean; failed: boolean; publicRead: boolean; signedIn: boolean; admin: boolean;
  members: Member[]; parents: Parent[]; partners: Partner[]; published: Contribution[];
  queue: Contribution[]; readySuggestions: Contribution[]; mine: Submission[];
};

export async function loadArchive(): Promise<Archive> {
  const empty: Archive = {
    configured: backendReady, failed: false, publicRead: true, signedIn: false, admin: false,
    members: [], parents: [], partners: [], published: [], queue: [], readySuggestions: [], mine: [],
  };
  if (!backendReady) return empty;
  try {
    const db = await database();
    const session = await db.auth.getClaims();
    const signedIn = Boolean(session.data?.claims.sub);
    const fields = "id,title,body,kind,status,category,image_path,member_id,created_at";
    const [visibility, admin, members, parents, partners, published, mine] = await Promise.all([
      db.rpc("archive_is_public"),
      signedIn ? db.rpc("is_archive_admin") : { data: false, error: null },
      db.from("members").select("*").order("id"),
      db.from("parents").select("*"),
      db.from("partners").select("*"),
      db.from("contributions").select(fields).eq("status","approved").in("kind",["post","photo"]).order("created_at",{ascending:false}).limit(100),
      signedIn ? db.rpc("my_archive_submissions") : { data: [], error: null },
    ]);
    const [queue, readySuggestions] = admin.data ? await Promise.all([
      db.from("contributions").select(fields).eq("status","pending").order("created_at").limit(100),
      db.from("contributions").select(fields).eq("status","approved").eq("kind","suggestion").is("applied_at",null).order("created_at").limit(100),
    ]) : [{ data: [], error: null }, { data: [], error: null }];
    return {
      ...empty, signedIn, admin: admin.data === true, publicRead: visibility.data === true,
      failed: [visibility,admin,members,parents,partners,published,mine,queue,readySuggestions].some(result => Boolean(result.error)),
      members: members.data ?? [], parents: parents.data ?? [], partners: partners.data ?? [],
      published: published.data ?? [], mine: mine.data ?? [], queue: queue.data ?? [], readySuggestions: readySuggestions.data ?? [],
    };
  } catch {
    return { ...empty, publicRead: false, failed: true };
  }
}
