-- Allow the Verified SMMEs tab to load: anyone can read (user_id, status) for verified rows.
-- Without this, RLS "Users can view own sme_verifications" only returns the current user's rows,
-- so the app never sees other verified SMMEs and the list is empty.
DROP POLICY IF EXISTS "Anyone can view verified SMME user ids" ON public.sme_verifications;
CREATE POLICY "Anyone can view verified SMME user ids" ON public.sme_verifications
  FOR SELECT USING (status = 'verified');
