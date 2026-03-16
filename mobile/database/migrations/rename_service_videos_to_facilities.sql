-- Rename service_videos table to facilities
ALTER TABLE public.service_videos RENAME TO facilities;

-- Update RLS policy (drop old, create new)
DROP POLICY IF EXISTS "service_videos_select_policy" ON public.facilities;
CREATE POLICY "facilities_select_policy"
  ON public.facilities FOR SELECT
  USING (true);
