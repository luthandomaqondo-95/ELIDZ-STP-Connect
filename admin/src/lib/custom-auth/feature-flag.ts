/**
 * Server-controlled custom auth switch. Defaults off — Supabase Auth remains active.
 * Not a security boundary: BFF/API routes must still authenticate every request.
 */
export function isCustomAuthEnabled(): boolean {
  const explicit = process.env.CUSTOM_AUTH_ENABLED?.trim();
  if (explicit != null && explicit.length > 0) {
    return /^(1|true|yes)$/i.test(explicit);
  }
  const provider = process.env.AUTH_PROVIDER?.trim().toLowerCase();
  return provider === "custom";
}
