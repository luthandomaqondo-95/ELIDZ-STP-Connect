import Constants from 'expo-constants';
import { supabase } from '@/lib/supabase';
import { isBffRequired, isCustomAuthEnabled } from '@/lib/feature-flags';
import { customRefresh, getValidAccessToken } from '@/lib/custom-auth-session';

/**
 * Authenticated client for the admin Next.js mobile BFF (`/api/mobile/*`).
 * Token source: custom auth access token when EXPO_PUBLIC_CUSTOM_AUTH_ENABLED, else Supabase Auth.
 */
export function getApiBaseUrl(): string | null {
  const fromExtra = Constants.expoConfig?.extra?.apiBaseUrl as string | undefined;
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
  const url = (fromExtra || fromEnv || '').trim().replace(/\/$/, '');
  return url || null;
}

export function isMobileBffEnabled(): boolean {
  return Boolean(getApiBaseUrl());
}

/** Use BFF for private ops; throw if required but not configured (no silent fallback). */
export function assertBffAvailable(): void {
  if (!isMobileBffEnabled()) {
    if (isBffRequired()) {
      throw new Error(
        'BFF is required for this build (EXPO_PUBLIC_BFF_REQUIRED or custom auth) but apiBaseUrl is not set.'
      );
    }
  }
}

export function shouldUseBff(): boolean {
  if (isMobileBffEnabled()) return true;
  if (isBffRequired()) {
    throw new Error(
      'BFF is required for this build but EXPO_PUBLIC_API_BASE_URL / extra.apiBaseUrl is not configured.'
    );
  }
  return false;
}

export class MobileApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function requestWithToken(
  url: URL,
  token: string,
  options: { method?: string; body?: unknown }
): Promise<Response> {
  return fetch(url.toString(), {
    method: options.method || (options.body ? 'POST' : 'GET'),
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
}

async function getAccessToken(): Promise<string> {
  if (isCustomAuthEnabled()) {
    return getValidAccessToken();
  }
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  const token = data.session?.access_token;
  if (!token) throw new Error('You must be logged in to continue');
  return token;
}

export async function mobileApi<T = unknown>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    query?: Record<string, string | number | boolean | undefined | null>;
  } = {}
): Promise<T> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      'EXPO_PUBLIC_API_BASE_URL / app.json extra.apiBaseUrl is not configured for the mobile BFF.'
    );
  }

  const token = await getAccessToken();
  const url = new URL(path.startsWith('http') ? path : `${base}${path.startsWith('/') ? '' : '/'}${path}`);
  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value === undefined || value === null || value === '') continue;
      url.searchParams.set(key, String(value));
    }
  }

  let response = await requestWithToken(url, token, options);

  // A single bounded retry is safe for expired custom access tokens. Do not
  // refresh for authorization failures, transport failures, or server errors.
  if (response.status === 401 && isCustomAuthEnabled()) {
    const refreshed = await customRefresh();
    if (!refreshed?.accessToken) {
      throw new MobileApiError('Session expired. Please log in again.', 401);
    }
    response = await requestWithToken(url, refreshed.accessToken, options);
  }

  const text = await response.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!response.ok) {
    const message =
      (json && typeof json.error === 'string' && json.error) ||
      `Request failed (${response.status})`;
    throw new MobileApiError(message, response.status);
  }

  return json as T;
}
