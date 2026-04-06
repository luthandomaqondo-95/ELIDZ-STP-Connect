/** Matches admin `normalizeProfileStatus` / mobile suspension checks. */
export function isProfileSuspended(profile: {
  verification_status?: string | null
  status?: string | null
} | null | undefined): boolean {
  if (!profile) return false
  const v = String(profile.verification_status ?? "").toLowerCase()
  const s = String(profile.status ?? "").toLowerCase()
  return v === "suspended" || s === "suspended"
}
