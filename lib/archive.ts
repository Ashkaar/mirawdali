import { backendReady, database } from "@/lib/supabase";
import { hasAnyRole, noRoles, parseAbout, parseRoles, type Archive, type Profile } from "@/lib/model";

const storedPhoto = /^[0-9a-f-]{36}\/[0-9a-f-]{36}\.webp$/;

/** First name and photo from the sign-in token: the user's own profile, else Google's, else the email address. */
export function profileFrom(claims: Record<string, unknown>): Profile {
  const meta = (claims.user_metadata ?? {}) as Record<string, unknown>;
  const read = (value: unknown) => typeof value === "string" ? value.trim() : "";
  const fromName = (read(meta.first_name) || read(meta.full_name) || read(meta.name)).split(/\s+/)[0];
  const fromEmail = read(claims.email).split("@")[0].split(/[._+-]/)[0];
  const firstName = (fromName || fromEmail.charAt(0).toUpperCase() + fromEmail.slice(1)).slice(0, 40);
  const avatarPath = storedPhoto.test(read(meta.avatar_path)) ? read(meta.avatar_path) : null;
  const external = read(meta.avatar_url) || read(meta.picture);
  return { firstName, avatarPath, avatar: avatarPath ? "/media/" + avatarPath : external.startsWith("https://") ? external : null };
}

export * from "@/lib/model";

export async function loadArchive(): Promise<Archive> {
  const empty: Archive = {
    configured: backendReady, failed: false, publicRead: true, signedIn: false, admin: false, roles: noRoles, profile: null, about: { en: null, ckb: null },
    members: [], parents: [], partners: [], published: [], mine: [],
  };
  if (!backendReady) return empty;
  try {
    const db = await database();
    const session = await db.auth.getClaims();
    const signedIn = Boolean(session.data?.claims.sub);
    const fields = "id,title,body,kind,status,category,image_path,member_id,created_at";
    // The account itself, not the device's sign-in token, so a name or photo changed on another device shows at once.
    const [account, about, visibility, roles, members, parents, partners, published, mine] = await Promise.all([
      signedIn ? db.auth.getUser() : null,
      db.rpc("archive_about"),
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
      ...empty, signedIn, roles: parsedRoles, about: parseAbout(about.data), profile: signedIn ? profileFrom(account?.data.user ? { email: account.data.user.email, user_metadata: account.data.user.user_metadata } : session.data!.claims as Record<string, unknown>) : null, admin: hasAnyRole(parsedRoles), publicRead: visibility.data === true,
      failed: [visibility,roles,members,parents,partners,published,mine].some(result => Boolean(result.error)),
      members: members.data ?? [], parents: parents.data ?? [], partners: partners.data ?? [],
      published: published.data ?? [], mine: mine.data ?? [],
    };
  } catch {
    return { ...empty, publicRead: false, failed: true };
  }
}
