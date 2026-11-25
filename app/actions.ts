"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import sharp from "sharp";
import { backendReady, database } from "@/lib/supabase";

const categories = ["memories", "history", "news"];
const genders = ["male", "female", "other", "unspecified"];
const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const siteUrl = () => process.env.SITE_URL ?? "http://localhost:3000";
const fail = (code: string) => ({ error: code });
const ok = (code: string) => ({ success: code });

export async function authAction(form: FormData) {
  if (!backendReady) return fail("unavailable");
  const db = await database();
  const mode = text(form, "mode");
  const email = text(form, "email");
  const password = String(form.get("password") ?? "");
  if (mode === "logout") {
    const { error } = await db.auth.signOut({ scope: "local" });
    if (error) return fail("authError");
    revalidatePath("/");
    return ok("signedOut");
  }
  if (mode === "google") {
    const { data, error } = await db.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: new URL("/auth/callback", siteUrl()).toString() },
    });
    if (error || !data.url) return fail("authError");
    redirect(data.url);
  }
  if (mode === "reset") {
    if (!email || email.length > 254) return fail("invalid");
    const { error } = await db.auth.resetPasswordForEmail(email, { redirectTo: siteUrl() });
    return error ? fail("authError") : ok("resetSent");
  }
  if (mode === "newPassword") {
    if (password.length < 8 || password.length > 100) return fail("invalid");
    const { error } = await db.auth.updateUser({ password });
    return error ? fail("authError") : ok("passwordUpdated");
  }
  if (!email || email.length > 254 || !password || password.length > 100) return fail("invalid");
  if (mode === "signup") {
    if (password.length < 8) return fail("invalid");
    const { error } = await db.auth.signUp({
      email, password, options: { emailRedirectTo: siteUrl() },
    });
    return error ? fail("authError") : ok("verifyEmail");
  }
  if (mode !== "login") return fail("invalid");
  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error) return fail("authError");
  revalidatePath("/");
  return ok("signedIn");
}

async function userContext() {
  if (!backendReady) return null;
  const db = await database();
  const { data } = await db.auth.getClaims();
  const id = data?.claims?.sub;
  return id ? { db, id } : null;
}

async function adminContext() {
  const context = await userContext();
  if (!context) return null;
  const { data } = await context.db.rpc("is_archive_admin");
  return data === true ? context : null;
}

async function uploadPhoto(db: Awaited<ReturnType<typeof database>>, id: string, file: File) {
  if (file.size > 3 * 1024 * 1024 || !/^(image\/(jpeg|png|webp))$/.test(file.type)) return null;
  try {
    const image = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 24_000_000 });
    const metadata = await image.metadata();
    if (!["jpeg", "png", "webp"].includes(metadata.format ?? "")) return null;
    const rendered = await image.rotate().resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).webp({ quality: 84 }).toBuffer();
    const path = id + "/" + randomUUID() + ".webp";
    const { error } = await db.storage.from("archive-photos").upload(path, rendered, { contentType: "image/webp" });
    return error ? null : path;
  } catch {
    return null;
  }
}

export async function submitContribution(form: FormData) {
  const context = await userContext();
  if (!context) return fail("signInFirst");
  const { db, id } = context;
  const kind = text(form, "kind");
  const title = text(form, "title");
  const body = text(form, "body");
  const category = text(form, "category");
  if (!["post", "photo", "suggestion"].includes(kind) || !title || title.length > 150 ||
      body.length > 12000 || (kind !== "photo" && !body) ||
      (kind === "post" && !categories.includes(category))) return fail("invalid");
  let path: string | null = null;
  if (kind === "photo") {
    const file = form.get("image");
    if (!(file instanceof File) || !file.size) return fail("invalidPhoto");
    path = await uploadPhoto(db, id, file);
    if (!path) return fail("invalidPhoto");
  }
  const { error } = await db.from("contributions").insert({
    kind, title, body, category: kind === "post" ? category : null, image_path: path,
    member_id: kind === "suggestion" ? text(form, "member") || null : null,
  });
  if (error) {
    if (path) await db.storage.from("archive-photos").remove([path]);
    return fail("saveFailed");
  }
  revalidatePath("/");
  return ok("submitted");
}

export async function saveMember(form: FormData) {
  const context = await adminContext();
  if (!context) return fail("adminOnly");
  const { db, id } = context;
  const english = text(form, "name_en");
  const sorani = text(form, "name_ckb");
  const gender = text(form, "gender");
  const year = (key: string) => {
    const value = text(form, key);
    return value ? (/^\d{1,4}$/.test(value) ? Number(value) : Number.NaN) : null;
  };
  const born = year("birth_year");
  const died = year("death_year");
  if ((!english && !sorani) || english.length > 140 || sorani.length > 140 || !genders.includes(gender) ||
      [born, died].some(value => value !== null && (!Number.isInteger(value) || value < 1 || value > 9999)) ||
      (born !== null && died !== null && died < born)) return fail("invalid");
  const file = form.get("photo");
  let path: string | null = null;
  if (file instanceof File && file.size) {
    path = await uploadPhoto(db, id, file);
    if (!path) return fail("invalidPhoto");
  }
  const { error } = await db.rpc("save_member", {
    target: text(form, "id") || null, english_name: english || null, sorani_name: sorani || null,
    member_gender: gender, born, died, photo: path,
    parent_ids: form.getAll("parents"), partner_ids: form.getAll("partners"), source_suggestion: text(form,"suggestion") || null,
  });
  if (error) {
    if (path) await db.storage.from("archive-photos").remove([path]);
    return fail(error.code === "23514" ? "invalidRelationship" : "saveFailed");
  }
  revalidatePath("/");
  return ok("memberSaved");
}

export async function reviewContribution(form: FormData) {
  const context = await adminContext();
  if (!context) return fail("adminOnly");
  const decision = text(form, "decision");
  if (decision !== "approved" && decision !== "rejected") return fail("invalid");
  const { data, error } = await context.db.rpc("review_contribution", {
    submission: text(form, "id"), decision,
  });
  if (error) return fail("saveFailed");
  revalidatePath("/");
  return data ? ok("reviewed") : fail("alreadyReviewed");
}

export async function setVisibility(form: FormData) {
  const context = await adminContext();
  if (!context) return fail("adminOnly");
  const { error } = await context.db.rpc("set_archive_visibility", { visible_to_guests: text(form, "visibility") === "public" });
  if (error) return fail("saveFailed");
  revalidatePath("/");
  return ok("visibilitySaved");
}
