import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { getApiBaseUrl } from '@/lib/mobile-api';

const REFRESH_KEY = 'elidz_custom_refresh_v1';

export type CustomSessionUser = {
  id: string;
  email: string;
  role: string;
  name: string;
};

export type CustomSession = {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: string;
  user: CustomSessionUser;
  supabaseDataToken?: string | null;
};

export class CustomAuthError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'CustomAuthError';
  }
}

let memoryAccessToken: string | null = null;
let memoryAccessExpiresAt: number | null = null;
let memoryUser: CustomSessionUser | null = null;
let memorySupabaseDataToken: string | null = null;
let refreshInFlight: Promise<CustomSession | null> | null = null;

function apiBase(): string {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      'Custom auth requires EXPO_PUBLIC_API_BASE_URL / extra.apiBaseUrl (staging admin origin).'
    );
  }
  return base;
}

async function persistRefresh(token: string | null) {
  if (token) {
    await SecureStore.setItemAsync(REFRESH_KEY, token);
  } else {
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  }
}

function applySession(session: CustomSession) {
  memoryAccessToken = session.accessToken;
  memoryAccessExpiresAt = Date.parse(session.accessExpiresAt) || Date.now() + 14 * 60 * 1000;
  memoryUser = session.user;
  memorySupabaseDataToken = session.supabaseDataToken ?? null;
}

export function getMemoryAccessToken(): string | null {
  return memoryAccessToken;
}

export function getMemoryUser(): CustomSessionUser | null {
  return memoryUser;
}

export function getSupabaseDataToken(): string | null {
  return memorySupabaseDataToken;
}

export async function clearCustomSession(): Promise<void> {
  memoryAccessToken = null;
  memoryAccessExpiresAt = null;
  memoryUser = null;
  memorySupabaseDataToken = null;
  await persistRefresh(null);
}

async function postAuth<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new CustomAuthError(
      typeof json.error === 'string' ? json.error : `Auth request failed (${res.status})`,
      res.status
    );
  }
  return json as T;
}

export async function customLogin(email: string, password: string): Promise<CustomSession> {
  const session = await postAuth<CustomSession>('/api/auth/login', { email, password });
  applySession(session);
  await persistRefresh(session.refreshToken);
  return session;
}

export async function customRegister(input: {
  name: string;
  email: string;
  password: string;
  role: string;
  address: string;
  idNumber?: string | null;
}): Promise<{ requiresEmailConfirmation: boolean }> {
  const res = await postAuth<{ requiresEmailConfirmation: boolean }>('/api/auth/register', input);
  return res;
}

export async function customLogout(): Promise<void> {
  const refresh = await SecureStore.getItemAsync(REFRESH_KEY);
  try {
    if (refresh) {
      await postAuth('/api/auth/logout', { refreshToken: refresh });
    }
  } catch {
    // always clear local
  }
  await clearCustomSession();
}

export async function customRefresh(): Promise<CustomSession | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refresh = await SecureStore.getItemAsync(REFRESH_KEY);
    if (!refresh) {
      await clearCustomSession();
      return null;
    }

    try {
      const session = await postAuth<CustomSession>('/api/auth/refresh', { refreshToken: refresh });
      applySession(session);
      await persistRefresh(session.refreshToken);
      return session;
    } catch (error) {
      if (error instanceof CustomAuthError && error.status === 401) {
        await clearCustomSession();
        return null;
      }
      // Network errors and 5xx responses do not prove that the session is
      // revoked; preserve the refresh token for a later retry.
      throw error;
    }
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

/** Restore session on cold start. */
export async function restoreCustomSession(): Promise<CustomSessionUser | null> {
  const session = await customRefresh();
  return session?.user ?? null;
}

export async function getValidAccessToken(): Promise<string> {
  const skewMs = 60_000;
  if (memoryAccessToken && memoryAccessExpiresAt && Date.now() < memoryAccessExpiresAt - skewMs) {
    return memoryAccessToken;
  }
  const refreshed = await customRefresh();
  if (!refreshed?.accessToken) {
    throw new Error('Session expired. Please log in again.');
  }
  return refreshed.accessToken;
}

export async function customForgotPassword(email: string): Promise<void> {
  await postAuth('/api/auth/forgot-password', { email });
}

export async function customResetPassword(token: string, password: string): Promise<void> {
  await postAuth('/api/auth/reset-password', { token, password });
}

export async function customVerifyEmail(token: string): Promise<void> {
  await postAuth('/api/auth/verify-email', { token });
}

export async function customResendVerification(email: string): Promise<void> {
  await postAuth('/api/auth/resend-verification', { email });
}

export async function customOAuthGoogle(idToken: string): Promise<CustomSession> {
  const session = await postAuth<CustomSession>('/api/auth/oauth/google', { idToken });
  applySession(session);
  await persistRefresh(session.refreshToken);
  return session;
}

export async function customOAuthApple(idToken: string): Promise<CustomSession> {
  const session = await postAuth<CustomSession>('/api/auth/oauth/apple', { idToken });
  applySession(session);
  await persistRefresh(session.refreshToken);
  return session;
}

export function getAppOwnershipHint(): string {
  return Constants.appOwnership ?? 'standalone';
}
