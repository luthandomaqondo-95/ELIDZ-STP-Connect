/**
 * Client-readable mirror of CUSTOM_AUTH_ENABLED for UI branching.
 * Defaults false. Backend still enforces CUSTOM_AUTH_ENABLED independently.
 */
export function isCustomAuthUiEnabled(): boolean {
  return /^(1|true|yes)$/i.test(
    String(process.env.NEXT_PUBLIC_CUSTOM_AUTH_ENABLED ?? "").trim()
  );
}
