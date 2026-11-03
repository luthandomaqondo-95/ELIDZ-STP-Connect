import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Buckets holding private user files. Rows still store the public object URL (so no
 * data migration is needed); every server read path swaps it for a short-lived signed URL.
 * Signed URLs work whether the bucket is public or private, so this can ship before the
 * buckets are flipped to private (supabase/migrations/*_private_document_buckets.sql).
 */
export const PRIVATE_BUCKETS = ["verification-documents", "chat-attachments"] as const;

const SIGNED_URL_TTL_SECONDS = 60 * 60;

/** Extract { bucket, path } from a Supabase Storage object URL (public or signed). */
export function parseStorageUrl(url: string): { bucket: string; path: string } | null {
  const match = url.match(/\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/([^?#]+)/);
  if (!match) return null;
  return { bucket: match[1], path: decodeURIComponent(match[2]) };
}

/**
 * Return copies of `rows` with `field` replaced by a signed URL when it points into a
 * private bucket. Other values pass through unchanged. One storage call per bucket.
 */
export async function signPrivateStorageUrls<T extends Record<string, unknown>>(
  rows: T[],
  field: keyof T & string
): Promise<T[]> {
  const pathsByBucket = new Map<string, Set<string>>();
  for (const row of rows) {
    const value = row[field];
    if (typeof value !== "string" || !value) continue;
    const parsed = parseStorageUrl(value);
    if (!parsed || !(PRIVATE_BUCKETS as readonly string[]).includes(parsed.bucket)) continue;
    const set = pathsByBucket.get(parsed.bucket) ?? new Set<string>();
    set.add(parsed.path);
    pathsByBucket.set(parsed.bucket, set);
  }
  if (pathsByBucket.size === 0) return rows;

  const supabase = createAdminClient();
  const signed = new Map<string, string>(); // "bucket/path" -> signed URL
  await Promise.all(
    Array.from(pathsByBucket, async ([bucket, paths]) => {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrls(Array.from(paths), SIGNED_URL_TTL_SECONDS);
      if (error) {
        console.error(`[storage-signing] ${bucket}:`, error.message);
        return;
      }
      for (const item of data ?? []) {
        if (item.path && item.signedUrl) signed.set(`${bucket}/${item.path}`, item.signedUrl);
      }
    })
  );

  return rows.map((row) => {
    const value = row[field];
    if (typeof value !== "string") return row;
    const parsed = parseStorageUrl(value);
    const url = parsed && signed.get(`${parsed.bucket}/${parsed.path}`);
    return url ? { ...row, [field]: url } : row;
  });
}

/** Single-row convenience wrapper. */
export async function signPrivateStorageUrl<T extends Record<string, unknown>>(
  row: T,
  field: keyof T & string
): Promise<T> {
  const [signedRow] = await signPrivateStorageUrls([row], field);
  return signedRow;
}
