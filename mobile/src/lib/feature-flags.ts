import Constants from 'expo-constants';

function readFlag(fromEnv: string | undefined, extraKey: string): boolean {
  if (fromEnv != null && String(fromEnv).length > 0) {
    return /^(1|true|yes)$/i.test(String(fromEnv).trim());
  }
  const extra = Constants.expoConfig?.extra as Record<string, unknown> | undefined;
  const fromExtra = extra?.[extraKey];
  if (typeof fromExtra === 'boolean') return fromExtra;
  if (typeof fromExtra === 'string') return /^(1|true|yes)$/i.test(fromExtra.trim());
  return false;
}

/** Defaults false — production remains on Supabase Auth until explicitly enabled. */
export function isCustomAuthEnabled(): boolean {
  return readFlag(process.env.EXPO_PUBLIC_CUSTOM_AUTH_ENABLED, 'customAuthEnabled');
}

/**
 * When true, private data ops must use the BFF (no silent direct Supabase fallback).
 * Automatically true when custom auth is enabled.
 */
export function isBffRequired(): boolean {
  if (isCustomAuthEnabled()) return true;
  return readFlag(process.env.EXPO_PUBLIC_BFF_REQUIRED, 'bffRequired');
}

/**
 * Use BFF polling for chat instead of Realtime.
 * Recommended when custom auth is on and Supabase data JWTs are unverified.
 */
export function shouldUseChatPolling(): boolean {
  if (isCustomAuthEnabled()) return true;
  return readFlag(process.env.EXPO_PUBLIC_USE_CHAT_POLL, 'useChatPoll');
}

/** Prefer BFF signed uploads over direct Storage client uploads. */
export function shouldUseBffUploads(): boolean {
  if (isCustomAuthEnabled()) return true;
  return readFlag(process.env.EXPO_PUBLIC_USE_BFF_UPLOADS, 'useBffUploads');
}
