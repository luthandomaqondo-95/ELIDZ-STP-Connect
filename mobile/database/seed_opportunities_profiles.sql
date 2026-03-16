-- ================================================================
-- ELIDZ STP - Opportunities & Profiles Note
-- Run in Supabase SQL Editor AFTER you have at least one user signed up
-- ================================================================

-- PROFILES: Created automatically when users sign up (via auth trigger).
-- You cannot insert profiles directly - they require auth.users.
-- Ensure you have at least one user: sign up in the app, or use
-- Supabase Dashboard > Authentication > Users > Invite User.
-- Once you have a profile, opportunities will use it as posted_by.

-- ================================================================
-- OPPORTUNITIES - Real ELIDZ STP programs (requires 1+ profile)
-- ================================================================

-- Eastern Cape Innovation Challenge 2025
INSERT INTO public.opportunities (title, description, type, category, requirements, deadline, posted_by, tenant_id, status, created_at, updated_at)
SELECT
  'Eastern Cape Innovation Challenge 2025',
  'ELIDZ STP in partnership with UNISA. R100,000 per winner (5 winners). Focus: Advanced Manufacturing, Sustainable Energy, Digital Economy, Automotive & Mobility, Agri-business & Aquaculture. 12-month incubation, mentorship, technical support. Apply: elidzstp.co.za/elidz-stp-innovation-challenge-2025',
  'Funding',
  'Innovation',
  'Eastern Cape residents. New or significantly enhanced solutions. Proposal template from ELIDZ website. Deadline: 25 September 2025.',
  '2025-09-25',
  p.id,
  (SELECT id FROM public.tenants WHERE LOWER(name) LIKE '%elidz%' AND LOWER(name) LIKE '%stp%' LIMIT 1),
  'active',
  NOW(),
  NOW()
FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM public.opportunities WHERE title = 'Eastern Cape Innovation Challenge 2025')
LIMIT 1;

-- Pre-Incubation Program - The Cortex Hub
INSERT INTO public.opportunities (title, description, type, category, requirements, posted_by, tenant_id, status, created_at, updated_at)
SELECT
  'Pre-Incubation Program - The Cortex Hub',
  'Equips early-stage SMMEs with foundational skills for the Incubation phase. Technical and business knowledge, product development prep, market entry readiness.',
  'Mentorship',
  'Business Development',
  'Early-stage SMMEs. Application: https://forms.gle/nq2umWk67fL9i1SV9',
  p.id,
  (SELECT id FROM public.tenants WHERE LOWER(name) LIKE '%cortex%' AND LOWER(name) LIKE '%hub%' LIMIT 1),
  'active',
  NOW(),
  NOW()
FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM public.opportunities WHERE title = 'Pre-Incubation Program - The Cortex Hub')
LIMIT 1;

-- Incubation Program - The Cortex Hub
INSERT INTO public.opportunities (title, description, type, category, requirements, posted_by, tenant_id, status, created_at, updated_at)
SELECT
  'Incubation Program - The Cortex Hub',
  '12-month launchpad for tech entrepreneurs. Business planning, product development, hands-on guidance, access to facilities. Transforms ideas into viable business models.',
  'Mentorship',
  'Business Development',
  'Aspiring tech entrepreneurs. 12-month commitment. Application: https://forms.gle/nq2umWk67fL9i1SV9',
  p.id,
  (SELECT id FROM public.tenants WHERE LOWER(name) LIKE '%cortex%' AND LOWER(name) LIKE '%hub%' LIMIT 1),
  'active',
  NOW(),
  NOW()
FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM public.opportunities WHERE title = 'Incubation Program - The Cortex Hub')
LIMIT 1;

-- Acceleration Program - The Cortex Hub
INSERT INTO public.opportunities (title, description, type, category, requirements, posted_by, tenant_id, status, created_at, updated_at)
SELECT
  'Acceleration Program - The Cortex Hub',
  '12-month intensive program for startups ready to scale. Weekly sprint objectives, industry mentorship, direct customer engagement. Rapid growth, investor readiness, market expansion.',
  'Mentorship',
  'Business Development',
  'Startups ready to scale. Application: https://forms.gle/nq2umWk67fL9i1SV9',
  p.id,
  (SELECT id FROM public.tenants WHERE LOWER(name) LIKE '%cortex%' AND LOWER(name) LIKE '%hub%' LIMIT 1),
  'active',
  NOW(),
  NOW()
FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM public.opportunities WHERE title = 'Acceleration Program - The Cortex Hub')
LIMIT 1;

-- Chemin Chemicals Incubation
INSERT INTO public.opportunities (title, description, type, category, requirements, posted_by, tenant_id, status, created_at, updated_at)
SELECT
  'Chemin Chemicals Industry Incubation',
  'SEDA incubator for downstream chemicals. Lab space, testing facilities, manufacturing equipment, office space, seed finance. Collaborations with universities, experts, financing agencies.',
  'Mentorship',
  'Chemicals',
  'Early-stage technology-based businesses in downstream chemicals. Part of SEDA Technology Incubation Programme.',
  p.id,
  (SELECT id FROM public.tenants WHERE LOWER(name) = 'chemin' LIMIT 1),
  'active',
  NOW(),
  NOW()
FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM public.opportunities WHERE title = 'Chemin Chemicals Industry Incubation')
LIMIT 1;

-- ECITI ICT Incubation
INSERT INTO public.opportunities (title, description, type, category, requirements, posted_by, tenant_id, status, created_at, updated_at)
SELECT
  'ECITI ICT Incubation Programme',
  'Eastern Cape Information Technology Incubator. Office space, technology infrastructure, business mentorship, technical training, industry and academic network connections.',
  'Mentorship',
  'ICT',
  'ICT-focused startups. Application via ECITI.',
  p.id,
  (SELECT id FROM public.tenants WHERE LOWER(name) = 'eciti' LIMIT 1),
  'active',
  NOW(),
  NOW()
FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM public.opportunities WHERE title = 'ECITI ICT Incubation Programme')
LIMIT 1;

-- Design Centre Access
INSERT INTO public.opportunities (title, description, type, category, requirements, posted_by, tenant_id, status, created_at, updated_at)
SELECT
  'ELIDZ STP Design Centre - Prototyping Services',
  '3D printing, laser cutting, CNC machining, rapid prototyping. Bring CAD models and get usable prototypes. For entrepreneurs, researchers and industry.',
  'Partnership',
  'Manufacturing',
  'Design concept (CAD model). Contact ELIDZ STP for access.',
  p.id,
  (SELECT id FROM public.tenants WHERE LOWER(name) LIKE '%elidz%' AND LOWER(name) LIKE '%stp%' LIMIT 1),
  'active',
  NOW(),
  NOW()
FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM public.opportunities WHERE title = 'ELIDZ STP Design Centre - Prototyping Services')
LIMIT 1;

-- Analytical Laboratory Testing
INSERT INTO public.opportunities (title, description, type, category, requirements, posted_by, tenant_id, status, created_at, updated_at)
SELECT
  'Analytical Laboratory - Testing Services',
  'Chemical and microbiological analysis. Water testing. Expansions planned for food, beverages, environmental analysis. First of its kind in the Eastern Cape.',
  'Partnership',
  'Testing',
  'Samples for analysis. Contact ELIDZ STP.',
  p.id,
  (SELECT id FROM public.tenants WHERE LOWER(name) LIKE '%elidz%' AND LOWER(name) LIKE '%stp%' LIMIT 1),
  'active',
  NOW(),
  NOW()
FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM public.opportunities WHERE title = 'Analytical Laboratory - Testing Services')
LIMIT 1;
