-- Phase 7 candidate (DO NOT APPLY until reviewed).
-- Verified against live policies (2026-03-14):
-- - chats SELECT policies already require chat_participants membership via auth.uid()
-- - chats_insert_anon allows unauthenticated INSERT — must be removed before enabling RLS
-- - chat_participants SELECT has a loose "authenticated" policy — tighten to self/participant
-- - smme_services_products had NO policies; add owner + public-active policies
--
-- Reversible:
--   ALTER TABLE public.chats DISABLE ROW LEVEL SECURITY;
--   ALTER TABLE public.smme_services_products DISABLE ROW LEVEL SECURITY;
--   (then drop policies created below if desired)

-- ---------------------------------------------------------------------------
-- chats
-- ---------------------------------------------------------------------------
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Remove unauthenticated chat creation
DROP POLICY IF EXISTS chats_insert_anon ON public.chats;

-- Ensure authenticated insert still requires a logged-in user
DROP POLICY IF EXISTS chats_insert_authenticated ON public.chats;
CREATE POLICY chats_insert_authenticated
  ON public.chats
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL AND (created_by IS NULL OR created_by = auth.uid()));

-- Keep participant-scoped select (recreate if names differ)
DROP POLICY IF EXISTS chats_select_for_participants ON public.chats;
CREATE POLICY chats_select_for_participants
  ON public.chats
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_participants cp
      WHERE cp.chat_id = chats.id AND cp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS chats_update_creator ON public.chats;
CREATE POLICY chats_update_creator
  ON public.chats
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- ---------------------------------------------------------------------------
-- chat_participants — tighten over-broad authenticated SELECT
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can view chat participants" ON public.chat_participants;
DROP POLICY IF EXISTS chat_participants_select_for_user ON public.chat_participants;
CREATE POLICY chat_participants_select_member
  ON public.chat_participants
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.chat_participants me
      WHERE me.chat_id = chat_participants.chat_id AND me.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- smme_services_products
-- ---------------------------------------------------------------------------
ALTER TABLE public.smme_services_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS smme_services_products_select_active ON public.smme_services_products;
CREATE POLICY smme_services_products_select_active
  ON public.smme_services_products
  FOR SELECT
  USING (
    status = 'active'
    OR smme_id = auth.uid()
  );

DROP POLICY IF EXISTS smme_services_products_insert_own ON public.smme_services_products;
CREATE POLICY smme_services_products_insert_own
  ON public.smme_services_products
  FOR INSERT
  TO authenticated
  WITH CHECK (smme_id = auth.uid());

DROP POLICY IF EXISTS smme_services_products_update_own ON public.smme_services_products;
CREATE POLICY smme_services_products_update_own
  ON public.smme_services_products
  FOR UPDATE
  TO authenticated
  USING (smme_id = auth.uid())
  WITH CHECK (smme_id = auth.uid());

DROP POLICY IF EXISTS smme_services_products_delete_own ON public.smme_services_products;
CREATE POLICY smme_services_products_delete_own
  ON public.smme_services_products
  FOR DELETE
  TO authenticated
  USING (smme_id = auth.uid());

-- NOTE: Admin dashboard uses the service-role client and intentionally bypasses RLS.
-- Mobile private writes should prefer /api/mobile/* BFF authorization, not client RLS alone.
