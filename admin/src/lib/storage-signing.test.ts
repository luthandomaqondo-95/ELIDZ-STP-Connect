import { describe, expect, it } from "vitest";
import { parseStorageUrl } from "./storage-signing";

const BASE = "https://abc.supabase.co/storage/v1/object";

describe("parseStorageUrl", () => {
  it("parses public object URLs", () => {
    expect(parseStorageUrl(`${BASE}/public/verification-documents/user-1/id_doc.pdf`)).toEqual({
      bucket: "verification-documents",
      path: "user-1/id_doc.pdf",
    });
  });

  it("parses signed URLs and drops the token query", () => {
    expect(parseStorageUrl(`${BASE}/sign/chat-attachments/chat/user/file.png?token=xyz`)).toEqual({
      bucket: "chat-attachments",
      path: "chat/user/file.png",
    });
  });

  it("decodes encoded path segments", () => {
    expect(parseStorageUrl(`${BASE}/public/chat-attachments/c/my%20file.pdf`)?.path).toBe("c/my file.pdf");
  });

  it("returns null for non-storage URLs", () => {
    expect(parseStorageUrl("https://example.com/file.pdf")).toBeNull();
    expect(parseStorageUrl("")).toBeNull();
  });
});
