-- 1. Drop the current constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. Re-add the constraint including 'SMME' (used by mobile app) and 'SME' (legacy/schema default)
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('Entrepreneur', 'Researcher', 'SME', 'SMME', 'Student', 'Investor', 'Tenant', 'Admin', 'Super Admin'));

