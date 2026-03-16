-- Update tenants with complete information gathered from research
-- This script updates tenant details, opportunities, capabilities, and contact information

-- ================================================================
-- THE CORTEX HUB - Complete Update
-- ================================================================

UPDATE public.tenants
SET 
  name = 'The Cortex Hub',
  description = 'A technology incubator and accelerator aimed at helping young entrepreneurs build products, teams, and scalable businesses. Located in East London, South Africa, dedicated to supporting startups that develop socially impactful solutions. We provide a collaborative community for start-ups building innovative solutions with a focus on social impact, offering resources and support for the entire start-up process, from ideation to launch.',
  industry = 'Technology Incubator',
  location = 'Incubators',
  website = 'https://www.thecortexhub.africa',
  contact_email = 'partnerships@thecortexhub.africa',
  contact_phone = NULL, -- Phone not found on website
  updated_at = TIMEZONE('utc', NOW())
WHERE LOWER(name) LIKE '%cortex%' AND LOWER(name) LIKE '%hub%';

-- Insert if doesn't exist
INSERT INTO public.tenants (name, description, industry, location, website, contact_email, created_at, updated_at)
SELECT 
  'The Cortex Hub',
  'A technology incubator and accelerator aimed at helping young entrepreneurs build products, teams, and scalable businesses. Located in East London, South Africa, dedicated to supporting startups that develop socially impactful solutions. We provide a collaborative community for start-ups building innovative solutions with a focus on social impact, offering resources and support for the entire start-up process, from ideation to launch.',
  'Technology Incubator',
  'Incubators',
  'https://www.thecortexhub.africa',
  'partnerships@thecortexhub.africa',
  TIMEZONE('utc', NOW()),
  TIMEZONE('utc', NOW())
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) LIKE '%cortex%' AND LOWER(name) LIKE '%hub%');

-- ================================================================
-- CHEMIN - Update with available information
-- ================================================================

UPDATE public.tenants
SET 
  name = 'Chemin',
  description = 'A not-for-profit business incubator under the Small Enterprise Development Agency''s (SEDA) program, specializing in the downstream chemicals industry. It supports early-stage technology-based businesses with resources like lab space, testing facilities (metals, detergents, water, coal, petroleum products, pharmaceutical tests), manufacturing equipment, office space, seed finance, and collaborations with universities, experts, financing agencies, and government departments. It promotes collaboration, innovation, ingenuity, and wealth creation.',
  industry = 'Business Incubator',
  location = 'Incubators',
  updated_at = TIMEZONE('utc', NOW())
WHERE LOWER(name) LIKE '%chemin%';

-- Insert if doesn't exist
INSERT INTO public.tenants (name, description, industry, location, created_at, updated_at)
SELECT 
  'Chemin',
  'A not-for-profit business incubator under the Small Enterprise Development Agency''s (SEDA) program, specializing in the downstream chemicals industry. It supports early-stage technology-based businesses with resources like lab space, testing facilities (metals, detergents, water, coal, petroleum products, pharmaceutical tests), manufacturing equipment, office space, seed finance, and collaborations with universities, experts, financing agencies, and government departments. It promotes collaboration, innovation, ingenuity, and wealth creation.',
  'Business Incubator',
  'Incubators',
  TIMEZONE('utc', NOW()),
  TIMEZONE('utc', NOW())
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) LIKE '%chemin%');

-- ================================================================
-- ECITI - Update with available information
-- ================================================================

UPDATE public.tenants
SET 
  name = 'ECITI (Eastern Cape Information Technology Institute)',
  description = 'A non-profit business incubator established by the Eastern Cape Development Corporation (ECDC) in 2004, specializing in the information communications technology (ICT) and film sectors. It supports small, medium, and micro enterprises (SMMEs) with infrastructure, mentorship, training, linkages to industry and academic networks, and information resources to reduce business failure risks for start-ups. It moved into the STP on July 20, 2012.',
  industry = 'Business Incubator',
  location = 'Incubators',
  updated_at = TIMEZONE('utc', NOW())
WHERE (LOWER(name) LIKE '%eciti%' OR LOWER(name) LIKE '%eastern cape information technology%');

-- Insert if doesn't exist
INSERT INTO public.tenants (name, description, industry, location, created_at, updated_at)
SELECT 
  'ECITI (Eastern Cape Information Technology Institute)',
  'A non-profit business incubator established by the Eastern Cape Development Corporation (ECDC) in 2004, specializing in the information communications technology (ICT) and film sectors. It supports small, medium, and micro enterprises (SMMEs) with infrastructure, mentorship, training, linkages to industry and academic networks, and information resources to reduce business failure risks for start-ups. It moved into the STP on July 20, 2012.',
  'Business Incubator',
  'Incubators',
  TIMEZONE('utc', NOW()),
  TIMEZONE('utc', NOW())
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) LIKE '%eciti%' OR LOWER(name) LIKE '%eastern cape information technology%');

-- ================================================================
-- ECNGOC - Update with available information
-- ================================================================

UPDATE public.tenants
SET 
  name = 'ECNGOC (Eastern Cape NGO Coalition)',
  description = 'A representative structure for civil society organizations (NGOs and CBOs) in the Eastern Cape, focused on socio-economic transformation for marginalized communities. It strengthens organizational capacity for development activities, influences relations between civil society, local government, and communities, and promotes asset-based community-driven development (ABCD). Services include NGO legislation and compliance support, sustainability initiatives, and citizen-oriented leadership development on accountability and engagement.',
  industry = 'NGO Services',
  location = 'Incubators',
  updated_at = TIMEZONE('utc', NOW())
WHERE (LOWER(name) LIKE '%ecngoc%' OR LOWER(name) LIKE '%ecngc%' OR (LOWER(name) LIKE '%eastern cape%' AND LOWER(name) LIKE '%ngo%'));

-- Insert if doesn't exist
INSERT INTO public.tenants (name, description, industry, location, created_at, updated_at)
SELECT 
  'ECNGOC (Eastern Cape NGO Coalition)',
  'A representative structure for civil society organizations (NGOs and CBOs) in the Eastern Cape, focused on socio-economic transformation for marginalized communities. It strengthens organizational capacity for development activities, influences relations between civil society, local government, and communities, and promotes asset-based community-driven development (ABCD). Services include NGO legislation and compliance support, sustainability initiatives, and citizen-oriented leadership development on accountability and engagement.',
  'NGO Services',
  'Incubators',
  TIMEZONE('utc', NOW()),
  TIMEZONE('utc', NOW())
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) LIKE '%ecngoc%' OR LOWER(name) LIKE '%ecngc%' OR (LOWER(name) LIKE '%eastern cape%' AND LOWER(name) LIKE '%ngo%'));

-- ================================================================
-- CREATE OPPORTUNITIES FOR THE CORTEX HUB
-- ================================================================

-- Note: This assumes you have a user profile ID to use as posted_by
-- Replace 'YOUR_ADMIN_USER_ID' with an actual user ID or set to NULL if not required

-- Pre-Incubation Program Opportunity
INSERT INTO public.opportunities (title, description, type, category, requirements, posted_by, tenant_id, status, created_at, updated_at)
SELECT 
  'Pre-Incubation Program - The Cortex Hub',
  'The Pre-Incubation Program aims to equip early-stage SMMEs with the foundational skills required to progress into the Incubation phase. By providing technical and business knowledge, the program prepares startups for more advanced product development and market entry.',
  'Mentorship',
  'Business Development',
  'Early-stage SMMEs looking to develop foundational business and technical skills. Application required.',
  NULL, -- Set to actual user ID if available
  (SELECT id FROM public.tenants WHERE LOWER(name) LIKE '%cortex%' AND LOWER(name) LIKE '%hub%' LIMIT 1),
  'active',
  TIMEZONE('utc', NOW()),
  TIMEZONE('utc', NOW())
WHERE NOT EXISTS (
  SELECT 1 FROM public.opportunities 
  WHERE title = 'Pre-Incubation Program - The Cortex Hub'
);

-- Incubation Program Opportunity
INSERT INTO public.opportunities (title, description, type, category, requirements, posted_by, tenant_id, status, created_at, updated_at)
SELECT 
  'Incubation Program - The Cortex Hub',
  'Our incubation program is a launchpad for aspiring tech entrepreneurs. Over 12 months, participants delve into business planning and product development, receiving hands-on guidance and access to our state-of-the-art facilities. This program is tailored to transform innovative ideas into viable business models, equipping participants with essential skills and knowledge.',
  'Mentorship',
  'Business Development',
  'Aspiring tech entrepreneurs with innovative ideas. 12-month commitment. Application required via: https://forms.gle/nq2umWk67fL9i1SV9',
  NULL, -- Set to actual user ID if available
  (SELECT id FROM public.tenants WHERE LOWER(name) LIKE '%cortex%' AND LOWER(name) LIKE '%hub%' LIMIT 1),
  'active',
  TIMEZONE('utc', NOW()),
  TIMEZONE('utc', NOW())
WHERE NOT EXISTS (
  SELECT 1 FROM public.opportunities 
  WHERE title = 'Incubation Program - The Cortex Hub'
);

-- Acceleration Program Opportunity
INSERT INTO public.opportunities (title, description, type, category, requirements, posted_by, tenant_id, status, created_at, updated_at)
SELECT 
  'Acceleration Program - The Cortex Hub',
  'Designed for startups ready to scale, our acceleration program offers an intensive 12-month experience. It includes weekly sprint objectives, mentorship from industry experts, and direct customer engagement. This program is focused on rapid growth, helping startups refine their business models, attract investors, and expand their market reach.',
  'Mentorship',
  'Business Development',
  'Startups ready to scale. 12-month intensive program. Weekly sprint objectives. Application required via: https://forms.gle/nq2umWk67fL9i1SV9',
  NULL, -- Set to actual user ID if available
  (SELECT id FROM public.tenants WHERE LOWER(name) LIKE '%cortex%' AND LOWER(name) LIKE '%hub%' LIMIT 1),
  'active',
  TIMEZONE('utc', NOW()),
  TIMEZONE('utc', NOW())
WHERE NOT EXISTS (
  SELECT 1 FROM public.opportunities 
  WHERE title = 'Acceleration Program - The Cortex Hub'
);

-- ================================================================
-- VERIFICATION QUERY
-- ================================================================

SELECT 
  name,
  industry,
  location,
  website,
  contact_email,
  LEFT(description, 100) as description_preview
FROM public.tenants 
WHERE LOWER(name) LIKE '%cortex%' 
   OR LOWER(name) LIKE '%chemin%'
   OR LOWER(name) LIKE '%eciti%'
   OR LOWER(name) LIKE '%ecngoc%'
   OR LOWER(name) LIKE '%ecngc%'
ORDER BY name;

