-- Remove legacy Investor/Researcher roles from the platform.
-- Mapping policy:
--   Investor   -> Entrepreneur
--   Researcher -> Entrepreneur

BEGIN;

-- Reassign existing profiles to a supported role.
UPDATE public.profiles
SET role = 'Entrepreneur'
WHERE role IN ('Investor', 'Researcher');

-- Remove deprecated role-permission mappings.
DELETE FROM public.role_permissions
WHERE role IN ('Investor', 'Researcher');

-- Replace role constraint so removed roles cannot be inserted again.
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IN ('Entrepreneur', 'SME', 'Student', 'Tenant', 'Admin', 'Super Admin'));

COMMIT;
