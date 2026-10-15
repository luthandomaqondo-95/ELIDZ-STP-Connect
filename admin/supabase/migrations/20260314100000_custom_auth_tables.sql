-- Phase 2: Additive custom auth tables + backfill.
-- SAFE: Does NOT drop profiles_id_fkey, does NOT delete auth.users, does NOT disable Supabase Auth.
-- Reversible: DROP TABLE IF EXISTS auth_email_verification_tokens, auth_password_reset_tokens,
--   auth_identities, auth_sessions, auth_credentials CASCADE;

CREATE TABLE IF NOT EXISTS public.auth_credentials (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  password_hash TEXT,
  password_algo TEXT NOT NULL DEFAULT 'argon2id',
  password_updated_at TIMESTAMPTZ,
  email_verified_at TIMESTAMPTZ,
  must_reset_password BOOLEAN NOT NULL DEFAULT false,
  failed_login_count INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT auth_credentials_failed_login_count_nonneg CHECK (failed_login_count >= 0)
);

CREATE TABLE IF NOT EXISTS public.auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  refresh_token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  user_agent TEXT,
  ip TEXT
);

CREATE INDEX IF NOT EXISTS auth_sessions_user_id_idx ON public.auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS auth_sessions_expires_at_idx ON public.auth_sessions(expires_at);

CREATE TABLE IF NOT EXISTS public.auth_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'apple')),
  provider_subject TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (provider, provider_subject)
);

CREATE INDEX IF NOT EXISTS auth_identities_user_id_idx ON public.auth_identities(user_id);

CREATE TABLE IF NOT EXISTS public.auth_password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS auth_password_reset_tokens_user_id_idx
  ON public.auth_password_reset_tokens(user_id);

CREATE TABLE IF NOT EXISTS public.auth_email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS auth_email_verification_tokens_user_id_idx
  ON public.auth_email_verification_tokens(user_id);

-- RLS: only service role / backend should touch these (no anon/authenticated policies).
ALTER TABLE public.auth_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- Backfill credentials for existing profiles (passwords cannot be migrated from Supabase Auth).
INSERT INTO public.auth_credentials (
  user_id,
  password_hash,
  password_algo,
  email_verified_at,
  must_reset_password
)
SELECT
  p.id,
  NULL,
  'argon2id',
  u.email_confirmed_at,
  true
FROM public.profiles p
INNER JOIN auth.users u ON u.id = p.id
ON CONFLICT (user_id) DO NOTHING;

-- Backfill social identities (google/apple only).
INSERT INTO public.auth_identities (user_id, provider, provider_subject)
SELECT
  i.user_id,
  i.provider,
  i.provider_id
FROM auth.identities i
WHERE i.provider IN ('google', 'apple')
  AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = i.user_id)
ON CONFLICT (provider, provider_subject) DO NOTHING;
