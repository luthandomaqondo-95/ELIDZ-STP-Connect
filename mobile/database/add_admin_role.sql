ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('Entrepreneur', 'Researcher', 'SME', 'Student', 'Investor', 'Tenant', 'Admin'));

