// Shared types and constants, safe to import from client components.

export const categoryKeys = ["memories","history","news"] as const;
export const sectionKeys = ["tree","gallery","blog"] as const;
export type Category = typeof categoryKeys[number];
export type Section = typeof sectionKeys[number];
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
/** The owner manages everything; section admins manage only their sections. */
export type Roles = { owner: boolean; tree: boolean; gallery: boolean; blog: boolean };
export type Archive = {
  configured: boolean; failed: boolean; publicRead: boolean; signedIn: boolean;
  /** True when the user can open the admin panel. */
  admin: boolean; roles: Roles;
  members: Member[]; parents: Parent[]; partners: Partner[]; published: Contribution[]; mine: Submission[];
};

export const noRoles: Roles = { owner: false, tree: false, gallery: false, blog: false };

export function parseRoles(value: unknown): Roles {
  const data = (value ?? {}) as { owner?: unknown; sections?: unknown };
  const owner = data.owner === true;
  const sections = Array.isArray(data.sections) ? data.sections : [];
  return {
    owner,
    tree: owner || sections.includes("tree"),
    gallery: owner || sections.includes("gallery"),
    blog: owner || sections.includes("blog"),
  };
}

export const hasAnyRole = (roles: Roles) => roles.owner || roles.tree || roles.gallery || roles.blog;
