-- 1. Update the check constraint to allow 'Super Admin'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('Entrepreneur', 'Researcher', 'SME', 'Student', 'Investor', 'Tenant', 'Admin', 'Super Admin'));

-- 2. Promote Tebogo to Super Admin
UPDATE public.profiles 
SET role = 'Super Admin' 
WHERE email = 'tebogolekgothoane5@gmail.com';

-- 3. Verify the update
SELECT * FROM public.profiles WHERE email = 'tebogolekgothoane5@gmail.com';

