import { randomUUID } from "node:crypto";
import sharp from "sharp";
import type { database } from "@/lib/supabase";

type Database = Awaited<ReturnType<typeof database>>;
const bucket = "archive-photos";

/** Validates, resizes and stores an image in the user's folder. Returns its path, or null if rejected. */
export async function uploadPhoto(db: Database, userId: string, file: File) {
  if (file.size > 3 * 1024 * 1024 || !/^(image\/(jpeg|png|webp))$/.test(file.type)) return null;
  try {
    const image = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 24_000_000 });
    const metadata = await image.metadata();
    if (!["jpeg", "png", "webp"].includes(metadata.format ?? "")) return null;
    const rendered = await image.rotate().resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).webp({ quality: 84 }).toBuffer();
    const path = userId + "/" + randomUUID() + ".webp";
    const { error } = await db.storage.from(bucket).upload(path, rendered, { contentType: "image/webp" });
    return error ? null : path;
  } catch {
    return null;
  }
}

/** Best-effort removal of files that are no longer referenced. */
export async function removePhotos(db: Database, paths: (string | null | undefined)[]) {
  const targets = paths.filter((path): path is string => Boolean(path));
  if (targets.length) await db.storage.from(bucket).remove(targets);
}
