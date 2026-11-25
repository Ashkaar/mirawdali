"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { backendReady, database } from "@/lib/supabase";
import { removePhotos, uploadPhoto } from "@/lib/photos";

const categories = ["memories", "history", "news"];
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
    const firstName = text(form, "first_name");
    if (firstName.length > 40) return fail("invalid");
    const { error } = await db.auth.signUp({
      email, password, options: { emailRedirectTo: siteUrl(), data: firstName ? { first_name: firstName } : undefined },
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
    await removePhotos(db, [path]);
    return fail("saveFailed");
  }
  revalidatePath("/");
  return ok("submitted");
}

export async function updateProfile(form: FormData) {
  const context = await userContext();
  if (!context) return fail("signInFirst");
  const { db, id } = context;
  const firstName = text(form, "first_name");
  if (!firstName || firstName.length > 40) return fail("invalid");
  const { data: current } = await db.auth.getUser();
  const previous = current.user?.user_metadata?.avatar_path as string | undefined;
  const file = form.get("photo");
  const removing = text(form, "remove_photo") === "true";
  let path: string | null = null;
  if (file instanceof File && file.size) {
    path = await uploadPhoto(db, id, file);
    if (!path) return fail("invalidPhoto");
  }
  const avatar = path ?? (removing ? null : previous ?? null);
  const { error } = await db.auth.updateUser({ data: { first_name: firstName, avatar_path: avatar } });
  if (error) {
    await removePhotos(db, [path]);
    return fail("saveFailed");
  }
  if (previous && previous !== avatar) await removePhotos(db, [previous]);
  // The header reads the name and photo from the sign-in token, so issue a fresh one.
  await db.auth.refreshSession();
  revalidatePath("/");
  return ok("profileSaved");
}
