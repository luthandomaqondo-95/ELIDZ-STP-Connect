import { createAdminClient } from "@/lib/supabase/admin";
import { randomUUID } from "crypto";

const ALLOWED_BUCKETS = new Set([
  "chat-attachments",
  "verification-documents",
  "profile-avatars",
]);

const MAX_BYTES: Record<string, number> = {
  "chat-attachments": 25 * 1024 * 1024,
  "verification-documents": 15 * 1024 * 1024,
  "profile-avatars": 5 * 1024 * 1024,
};

const ALLOWED_MIME_PREFIX: Record<string, string[]> = {
  "chat-attachments": ["image/", "video/", "audio/", "application/pdf", "application/octet-stream"],
  "verification-documents": ["image/", "application/pdf"],
  "profile-avatars": ["image/"],
};

export type UploadGrant = {
  bucket: string;
  path: string;
  token: string;
  signedUrl: string;
  publicUrl: string | null;
  maxBytes: number;
  expiresIn: number;
};

/**
 * Issue a short-lived signed upload URL scoped to the authenticated user's path prefix.
 * Uses the service-role client server-side only. Does not rely on unverified custom JWTs.
 */
export async function createOwnedUploadGrant(
  userId: string,
  input: { bucket: string; filename?: string; contentType?: string; chatId?: string }
): Promise<UploadGrant> {
  const bucket = input.bucket;
  if (!ALLOWED_BUCKETS.has(bucket)) {
    throw new Error("Bucket not allowed");
  }

  const contentType = (input.contentType || "application/octet-stream").toLowerCase();
  const allowed = ALLOWED_MIME_PREFIX[bucket] || [];
  const ok = allowed.some((p) => (p.endsWith("/") ? contentType.startsWith(p) : contentType === p));
  if (!ok) {
    throw new Error("Content type not allowed for this bucket");
  }

  const safeName = (input.filename || "file")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 80);
  const id = randomUUID();

  let path: string;
  if (bucket === "chat-attachments") {
    if (!input.chatId) throw new Error("chatId is required for chat attachments");
    // Path encodes owner; BFF message send still checks chat membership
    path = `${input.chatId}/${userId}/${id}_${safeName}`;
  } else if (bucket === "verification-documents") {
    path = `${userId}/${id}_${safeName}`;
  } else {
    path = `${userId}/${id}_${safeName}`;
  }

  const expiresIn = 10 * 60;
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(path);

  if (error || !data) {
    throw new Error(error?.message || "Failed to create signed upload URL");
  }

  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);

  return {
    bucket,
    path,
    token: data.token,
    signedUrl: data.signedUrl,
    publicUrl: pub?.publicUrl ?? null,
    maxBytes: MAX_BYTES[bucket] ?? 5 * 1024 * 1024,
    expiresIn,
  };
}
