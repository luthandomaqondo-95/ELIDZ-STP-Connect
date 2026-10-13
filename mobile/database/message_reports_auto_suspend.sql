-- Run in Supabase SQL Editor (or as a migration).
-- When a user accumulates more than 10 message reports (the 11th insert triggers this),
-- set their profile to suspended so they cannot use the app.
--
-- Requires verification_status to allow 'suspended' (see admin/fix-suspend-constraint.sql).

CREATE OR REPLACE FUNCTION public.enforce_suspend_on_message_reports()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  report_count integer;
BEGIN
  SELECT COUNT(*)::integer INTO report_count
  FROM public.message_reports
  WHERE reported_user_id = NEW.reported_user_id;

  IF report_count > 10 THEN
    UPDATE public.profiles
    SET
      verification_status = 'suspended',
      updated_at = NOW()
    WHERE id = NEW.reported_user_id
      AND COALESCE(verification_status, '') IS DISTINCT FROM 'suspended';

    -- Optional: if your schema has profiles.status (admin UI uses it), keep in sync.
    -- Uncomment if the column exists:
    -- UPDATE public.profiles SET status = 'Suspended' WHERE id = NEW.reported_user_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_message_reports_auto_suspend ON public.message_reports;

CREATE TRIGGER trg_message_reports_auto_suspend
  AFTER INSERT ON public.message_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_suspend_on_message_reports();

COMMENT ON FUNCTION public.enforce_suspend_on_message_reports() IS
  'Suspends reported_user when total reports against them exceed 10.';
