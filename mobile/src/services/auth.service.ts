import { supabase } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

export type SocialProvider = 'google' | 'apple';

export type AuthServiceResult = {
  user: User | null;
  session: Session | null;
  error: Error | null;
};

async function signInWithIdToken(
  provider: SocialProvider,
  idToken: string,
  nonce?: string
): Promise<AuthServiceResult> {
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider,
    token: idToken,
    nonce,
  });

  return {
    user: data?.user ?? null,
    session: data?.session ?? null,
    error: error ? new Error(error.message) : null,
  };
}

async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(error.message);
  }
  return data.session ?? null;
}

async function updatePassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    throw new Error(error.message);
  }
}

export const authService = {
  signInWithIdToken,
  getSession,
  updatePassword,
};

