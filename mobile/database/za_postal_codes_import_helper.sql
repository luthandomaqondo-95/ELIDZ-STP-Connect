-- One-time helper for importing GeoNames ZA CSV via Supabase Dashboard.
-- The Supabase Table Editor import runs under your logged-in role, so RLS can block inserts.
--
-- Steps:
-- 1) Run: `alter table ... disable row level security;`
-- 2) Import CSV in Dashboard
-- 3) Run: `alter table ... enable row level security;`

alter table public.za_postal_codes disable row level security;

-- After import, re-enable RLS:
-- alter table public.za_postal_codes enable row level security;

