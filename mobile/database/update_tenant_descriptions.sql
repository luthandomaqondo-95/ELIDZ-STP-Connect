-- Update tenant descriptions and ensure correct data
-- This script updates specific tenants with detailed descriptions
-- It will update existing tenants or insert them if they don't exist

-- Update or Insert Chemin
-- First, try to update existing records
UPDATE public.tenants
SET 
  description = 'A not-for-profit business incubator under the Small Enterprise Development Agency''s program, specializing in the downstream chemicals industry. It supports early-stage technology-based businesses with resources like lab space, testing facilities, manufacturing equipment, office space, seed finance, and collaborations with universities, experts, financing agencies, and government departments. It promotes collaboration, innovation, ingenuity, and wealth creation.',
  updated_at = TIMEZONE('utc', NOW())
WHERE LOWER(name) LIKE '%chemin%'
  AND (description IS NULL OR description = '' OR description != 'A not-for-profit business incubator under the Small Enterprise Development Agency''s program, specializing in the downstream chemicals industry. It supports early-stage technology-based businesses with resources like lab space, testing facilities, manufacturing equipment, office space, seed finance, and collaborations with universities, experts, financing agencies, and government departments. It promotes collaboration, innovation, ingenuity, and wealth creation.');

-- Update or Insert ECITI (Eastern Cape Information Technology Institute)
-- First, try to update existing records
UPDATE public.tenants
SET 
  name = CASE 
    WHEN LOWER(name) NOT LIKE '%eastern cape information technology institute%' 
    THEN 'ECITI (Eastern Cape Information Technology Institute)'
    ELSE name
  END,
  description = 'A non-profit business incubator established by the Eastern Cape Development Corporation (ECDC) in 2004, specializing in the information communications technology (ICT) and film sectors. It supports small, medium, and micro enterprises (SMMEs) with infrastructure, mentorship, training, linkages to industry and academic networks, and information resources to reduce business failure risks for start-ups. It moved into the STP on July 20, 2012.',
  updated_at = TIMEZONE('utc', NOW())
WHERE (LOWER(name) LIKE '%eciti%' OR LOWER(name) LIKE '%eastern cape information technology%')
  AND (description IS NULL OR description = '' OR description != 'A non-profit business incubator established by the Eastern Cape Development Corporation (ECDC) in 2004, specializing in the information communications technology (ICT) and film sectors. It supports small, medium, and micro enterprises (SMMEs) with infrastructure, mentorship, training, linkages to industry and academic networks, and information resources to reduce business failure risks for start-ups. It moved into the STP on July 20, 2012.');

-- Update or Insert The Cortex Hub
-- First, try to update existing records
UPDATE public.tenants
SET 
  name = CASE 
    WHEN LOWER(name) NOT LIKE '%the cortex hub%' 
    THEN 'The Cortex Hub'
    ELSE name
  END,
  description = 'A technology incubator and accelerator aimed at helping young entrepreneurs build products, teams, and scalable businesses. It provides early-stage funding for expenses, places entrepreneurs in incubation or acceleration programs based on business stage, and exposes them to a tech environment for idea generation and value creation.',
  updated_at = TIMEZONE('utc', NOW())
WHERE (LOWER(name) LIKE '%cortex%' AND LOWER(name) LIKE '%hub%')
  AND (description IS NULL OR description = '' OR description != 'A technology incubator and accelerator aimed at helping young entrepreneurs build products, teams, and scalable businesses. It provides early-stage funding for expenses, places entrepreneurs in incubation or acceleration programs based on business stage, and exposes them to a tech environment for idea generation and value creation.');

-- Update or Insert ECNGOC (Eastern Cape NGO Coalition)
-- First, try to update existing records
UPDATE public.tenants
SET 
  name = CASE 
    WHEN LOWER(name) NOT LIKE '%eastern cape ngo coalition%' 
    THEN 'ECNGOC (Eastern Cape NGO Coalition)'
    ELSE name
  END,
  description = 'A representative structure for civil society organizations (NGOs and CBOs) in the Eastern Cape, focused on socio-economic transformation for marginalized communities. It strengthens organizational capacity for development activities, influences relations between civil society, local government, and communities, and promotes asset-based community-driven development (ABCD). Services include NGO legislation and compliance support, sustainability initiatives, and citizen-oriented leadership development on accountability and engagement.',
  updated_at = TIMEZONE('utc', NOW())
WHERE (LOWER(name) LIKE '%ecngoc%' OR LOWER(name) LIKE '%ecngc%' OR (LOWER(name) LIKE '%eastern cape%' AND LOWER(name) LIKE '%ngo%'))
  AND (description IS NULL OR description = '' OR description != 'A representative structure for civil society organizations (NGOs and CBOs) in the Eastern Cape, focused on socio-economic transformation for marginalized communities. It strengthens organizational capacity for development activities, influences relations between civil society, local government, and communities, and promotes asset-based community-driven development (ABCD). Services include NGO legislation and compliance support, sustainability initiatives, and citizen-oriented leadership development on accountability and engagement.');

-- Insert tenants if they don't exist
INSERT INTO public.tenants (name, description, industry, location, created_at, updated_at)
SELECT 'Chemin', 
       'A not-for-profit business incubator under the Small Enterprise Development Agency''s program, specializing in the downstream chemicals industry. It supports early-stage technology-based businesses with resources like lab space, testing facilities, manufacturing equipment, office space, seed finance, and collaborations with universities, experts, financing agencies, and government departments. It promotes collaboration, innovation, ingenuity, and wealth creation.',
       'Business Incubator',
       'Incubators',
       TIMEZONE('utc', NOW()),
       TIMEZONE('utc', NOW())
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) LIKE '%chemin%');

INSERT INTO public.tenants (name, description, industry, location, created_at, updated_at)
SELECT 'ECITI (Eastern Cape Information Technology Institute)',
       'A non-profit business incubator established by the Eastern Cape Development Corporation (ECDC) in 2004, specializing in the information communications technology (ICT) and film sectors. It supports small, medium, and micro enterprises (SMMEs) with infrastructure, mentorship, training, linkages to industry and academic networks, and information resources to reduce business failure risks for start-ups. It moved into the STP on July 20, 2012.',
       'Business Incubator',
       'Incubators',
       TIMEZONE('utc', NOW()),
       TIMEZONE('utc', NOW())
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) LIKE '%eciti%' OR LOWER(name) LIKE '%eastern cape information technology%');

INSERT INTO public.tenants (name, description, industry, location, created_at, updated_at)
SELECT 'The Cortex Hub',
       'A technology incubator and accelerator aimed at helping young entrepreneurs build products, teams, and scalable businesses. It provides early-stage funding for expenses, places entrepreneurs in incubation or acceleration programs based on business stage, and exposes them to a tech environment for idea generation and value creation.',
       'Technology Incubator',
       'Incubators',
       TIMEZONE('utc', NOW()),
       TIMEZONE('utc', NOW())
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) LIKE '%cortex%' AND LOWER(name) LIKE '%hub%');

INSERT INTO public.tenants (name, description, industry, location, created_at, updated_at)
SELECT 'ECNGOC (Eastern Cape NGO Coalition)',
       'A representative structure for civil society organizations (NGOs and CBOs) in the Eastern Cape, focused on socio-economic transformation for marginalized communities. It strengthens organizational capacity for development activities, influences relations between civil society, local government, and communities, and promotes asset-based community-driven development (ABCD). Services include NGO legislation and compliance support, sustainability initiatives, and citizen-oriented leadership development on accountability and engagement.',
       'NGO Services',
       'Incubators',
       TIMEZONE('utc', NOW()),
       TIMEZONE('utc', NOW())
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) LIKE '%ecngoc%' OR LOWER(name) LIKE '%ecngc%' OR (LOWER(name) LIKE '%eastern cape%' AND LOWER(name) LIKE '%ngo%'));

-- Verify updates
SELECT name, LEFT(description, 100) as description_preview 
FROM public.tenants 
WHERE LOWER(name) LIKE '%chemin%' 
   OR LOWER(name) LIKE '%eciti%' 
   OR LOWER(name) LIKE '%cortex%' 
   OR LOWER(name) LIKE '%ecngoc%'
   OR LOWER(name) LIKE '%ecngc%'
ORDER BY name;

