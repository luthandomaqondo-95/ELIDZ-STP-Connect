-- 1. First, drop the strict constraint so we can fix the data
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. Fix any rows that have invalid roles (e.g., 'User', 'guest', casing mismatches)
--    We set them to 'Tenant' as a safe default before re-applying the constraint.
UPDATE public.profiles
SET role = 'Tenant'
WHERE role NOT IN ('Entrepreneur', 'Researcher', 'SME', 'Student', 'Investor', 'Tenant', 'Admin', 'Super Admin');

-- 3. Re-add the constraint with 'Super Admin' included
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('Entrepreneur', 'Researcher', 'SME', 'Student', 'Investor', 'Tenant', 'Admin', 'Super Admin'));

-- 4. Promote Tebogo to Super Admin
UPDATE public.profiles 
SET role = 'Super Admin' 
WHERE email = 'tebogolekgothoane5@gmail.com';

-- 5. Verify the result
SELECT email, role FROM public.profiles WHERE email = 'tebogolekgothoane5@gmail.com';

