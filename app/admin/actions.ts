"use server";

import { revalidatePath } from "next/cache";
import { backendReady, database } from "@/lib/supabase";
import { removePhotos, uploadPhoto } from "@/lib/photos";
import { categoryKeys, sectionKeys, type Section } from "@/lib/model";

type Result = { error?: string; success?: string };
const genders = ["male", "female", "other", "unspecified"];
const statuses = ["pending", "approved", "rejected"];
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const id = (form: FormData, key = "id") => {
  const value = text(form, key);
  return uuid.test(value) ? value : null;
};
const fail = (code: string): Result => ({ error: code });
const ok = (code: string): Result => {
  revalidatePath("/");
  revalidatePath("/admin");
  return { success: code };
};
const failure = (error: { code?: string } | null, fallback = "saveFailed") =>
  fail(error?.code === "42501" ? "adminOnly" : fallback);

/** Signed-in user who manages the section, or the owner when section is "owner". */
async function context(section: Section | "owner") {
  if (!backendReady) return null;
  const db = await database();
  const { data } = await db.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return null;
  const check = section === "owner" ? await db.rpc("is_archive_admin") : await db.rpc("is_section_admin", { target_section: section });
  return check.data === true ? { db, userId } : null;
}

// Tree

export async function saveMember(form: FormData): Promise<Result> {
  const ctx = await context("tree");
  if (!ctx) return fail("adminOnly");
  const english = text(form, "name_en");
  const sorani = text(form, "name_ckb");
  const gender = text(form, "gender");
  const year = (key: string) => {
    const value = text(form, key);
    return value ? (/^\d{1,4}$/.test(value) ? Number(value) : Number.NaN) : null;
  };
  const born = year("birth_year");
  const died = year("death_year");
  const related = (key: string) => form.getAll(key).map(String).filter(value => uuid.test(value));
  if ((!english && !sorani) || english.length > 140 || sorani.length > 140 || !genders.includes(gender) ||
      [born, died].some(value => value !== null && (!Number.isInteger(value) || value < 1 || value > 9999)) ||
      (born !== null && died !== null && died < born)) return fail("invalid");
  const file = form.get("photo");
  let path: string | null = null;
  if (file instanceof File && file.size) {
    path = await uploadPhoto(ctx.db, ctx.userId, file);
    if (!path) return fail("invalidPhoto");
  }
  const { error } = await ctx.db.rpc("save_member", {
    target: id(form), english_name: english || null, sorani_name: sorani || null,
    member_gender: gender, born, died, photo: path,
    parent_ids: related("parents"), partner_ids: related("partners"), source_suggestion: id(form, "suggestion"),
  });
  if (error) {
    await removePhotos(ctx.db, [path]);
    return error.code === "23514" ? fail("invalidRelationship") : failure(error);
  }
  return ok("memberSaved");
}

export async function deleteMember(form: FormData): Promise<Result> {
  const ctx = await context("tree");
  const target = id(form);
  if (!ctx) return fail("adminOnly");
  if (!target) return fail("invalid");
  const { data, error } = await ctx.db.rpc("delete_member", { target });
  if (error) return failure(error);
  await removePhotos(ctx.db, [data as string | null]);
  return ok("memberDeleted");
}

export async function markSuggestionDone(form: FormData): Promise<Result> {
  const ctx = await context("tree");
  const target = id(form);
  if (!ctx) return fail("adminOnly");
  if (!target) return fail("invalid");
  const { error } = await ctx.db.rpc("mark_suggestion_applied", { target });
  return error ? failure(error) : ok("suggestionDone");
}

// Gallery and blog entries (the database checks the entry's section on every call)

export async function publishEntry(form: FormData): Promise<Result> {
  const kind = text(form, "kind");
  if (kind !== "post" && kind !== "photo") return fail("invalid");
  const ctx = await context(kind === "photo" ? "gallery" : "blog");
  if (!ctx) return fail("adminOnly");
  const title = text(form, "title");
  const body = text(form, "body");
  const category = text(form, "category");
  if (!title || title.length > 150 || body.length > 12000 || (kind === "post" && (!body || !categoryKeys.includes(category as never)))) {
    return fail("invalid");
  }
  let path: string | null = null;
  if (kind === "photo") {
    const file = form.get("image");
    if (!(file instanceof File) || !file.size) return fail("invalidPhoto");
    path = await uploadPhoto(ctx.db, ctx.userId, file);
    if (!path) return fail("invalidPhoto");
  }
  const { error } = await ctx.db.rpc("publish_contribution", {
    entry_kind: kind, entry_title: title, entry_body: body,
    entry_category: kind === "post" ? category : null, entry_image: path,
  });
  if (error) {
    await removePhotos(ctx.db, [path]);
    return failure(error);
  }
  return ok("entryPublished");
}

async function entryContext(form: FormData) {
  const section = text(form, "section");
  return sectionKeys.includes(section as Section) ? context(section as Section) : null;
}

export async function updateEntry(form: FormData): Promise<Result> {
  const ctx = await entryContext(form);
  const target = id(form);
  if (!ctx) return fail("adminOnly");
  const title = text(form, "title");
  const body = text(form, "body");
  const category = text(form, "category");
  if (!target || !title || title.length > 150 || body.length > 12000 || (category && !categoryKeys.includes(category as never))) {
    return fail("invalid");
  }
  const { data, error } = await ctx.db.rpc("update_contribution", {
    target, entry_title: title, entry_body: body, entry_category: category || null,
  });
  if (error) return failure(error, error.code === "23514" ? "invalid" : "saveFailed");
  return data ? ok("entrySaved") : fail("notFound");
}

export async function setEntryStatus(form: FormData): Promise<Result> {
  const ctx = await entryContext(form);
  const target = id(form);
  const decision = text(form, "status");
  if (!ctx) return fail("adminOnly");
  if (!target || !statuses.includes(decision)) return fail("invalid");
  const { error } = await ctx.db.rpc("set_contribution_status", { submission: target, decision });
  return error ? failure(error) : ok("statusSaved");
}

export async function deleteEntry(form: FormData): Promise<Result> {
  const ctx = await entryContext(form);
  const target = id(form);
  if (!ctx) return fail("adminOnly");
  if (!target) return fail("invalid");
  const { data, error } = await ctx.db.rpc("delete_contribution", { target });
  if (error) return failure(error);
  await removePhotos(ctx.db, [data as string | null]);
  return ok("entryDeleted");
}

// Owner only

export async function setUserSections(form: FormData): Promise<Result> {
  const ctx = await context("owner");
  const target = id(form);
  if (!ctx) return fail("ownerOnly");
  if (!target) return fail("invalid");
  const sections = form.getAll("sections").map(String).filter(value => sectionKeys.includes(value as Section));
  const { error } = await ctx.db.rpc("admin_set_user_sections", { target, new_sections: sections });
  return error ? failure(error) : ok("rolesSaved");
}

export async function setUserBlocked(form: FormData): Promise<Result> {
  const ctx = await context("owner");
  const target = id(form);
  if (!ctx) return fail("ownerOnly");
  if (!target || target === ctx.userId) return fail("invalid");
  const block = text(form, "block") === "true";
  const { error } = await ctx.db.rpc("admin_set_user_blocked", { target, should_block: block });
  return error ? failure(error) : ok(block ? "userBlocked" : "userUnblocked");
}

export async function deleteUser(form: FormData): Promise<Result> {
  const ctx = await context("owner");
  const target = id(form);
  if (!ctx) return fail("ownerOnly");
  if (!target || target === ctx.userId) return fail("invalid");
  const { data, error } = await ctx.db.rpc("admin_delete_user", { target });
  if (error) return failure(error);
  await removePhotos(ctx.db, (data as string[] | null) ?? []);
  return ok("userDeleted");
}

export async function setVisibility(form: FormData): Promise<Result> {
  const ctx = await context("owner");
  if (!ctx) return fail("ownerOnly");
  const { error } = await ctx.db.rpc("set_archive_visibility", { visible_to_guests: text(form, "visibility") === "public" });
  return error ? failure(error) : ok("visibilitySaved");
}

export async function setAbout(form: FormData): Promise<Result> {
  const ctx = await context("owner");
  if (!ctx) return fail("ownerOnly");
  const english = String(form.get("about_en") ?? "").trim();
  const sorani = String(form.get("about_ckb") ?? "").trim();
  if (english.length > 4000 || sorani.length > 4000) return fail("invalid");
  const { error } = await ctx.db.rpc("set_archive_about", { english, sorani });
  return error ? failure(error) : ok("aboutSaved");
}
