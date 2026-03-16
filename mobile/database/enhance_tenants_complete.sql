-- Enhance Tenants Table with Complete Details
-- This script adds new columns for services, capabilities, and comprehensive contact information
-- Then populates all tenants with detailed information from research

-- ================================================================
-- STEP 1: Add new columns to tenants table
-- ================================================================

-- Add services column (JSON or TEXT to store list of services)
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS services TEXT;

-- Add capabilities column (TEXT to store capabilities and specializations)
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS capabilities TEXT;

-- Add address column (physical address)
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS address TEXT;

-- Add social_media_links column (JSON or TEXT to store social media links)
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS social_media_links TEXT;

-- Add application_url column (for programs/opportunities applications)
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS application_url TEXT;

-- Add opening_hours column
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS opening_hours TEXT;

-- Add additional_contact_email column (for secondary contact)
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS additional_contact_email TEXT;

-- Add key_personnel column (TEXT to store team/leadership info)
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS key_personnel TEXT;

-- Add partners column (TEXT to store partner organizations)
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS partners TEXT;

-- ================================================================
-- STEP 2: Update THE CORTEX HUB with complete information
-- ================================================================

UPDATE public.tenants
SET 
  name = 'The Cortex Hub',
  description = 'A technology incubator and accelerator aimed at helping young entrepreneurs build products, teams, and scalable businesses. Located in East London, South Africa, dedicated to supporting startups that develop socially impactful solutions. We provide a collaborative community for start-ups building innovative solutions with a focus on social impact, offering resources and support for the entire start-up process, from ideation to launch.',
  industry = 'Technology Incubator',
  location = 'Incubators',
  website = 'https://www.thecortexhub.africa',
  contact_email = 'partnerships@thecortexhub.africa',
  additional_contact_email = 'info@thecortexhub.africa',
  address = '33 Church St, East London CBD, East London, 5201',
  contact_phone = NULL, -- Phone not found on website
  opening_hours = 'Monday to Friday, 8:00 am – 6:00 pm',
  application_url = 'https://forms.gle/nq2umWk67fL9i1SV9',
  services = 'Pre-Incubation Program: Equips early-stage SMMEs with foundational skills. Incubation Program (12 months): Launchpad for aspiring tech entrepreneurs with business planning and product development. Acceleration Program (12 months): Intensive program for startups ready to scale with weekly sprint objectives, mentorship, and direct customer engagement.',
  capabilities = 'Specialization Labs: Optic Fibre Lab (CFOT, FOS/D, CPCT certifications), Bare Metal as a Service Lab (data center automation), Automotive Ethernet Lab (5G connectivity, connected vehicles), Electronics & Hardware Lab (IoT, home automation, Arduino, Sensors), Robotics & Coding Lab (Make-wonder Dash Robotics, Tanks Coding kits), Arm Ecosystem Lab (Arm architecture in automotive and IoT), EC Film Hub (post-production, film editing), E-sports & Gaming Club (3D animation, game development). Key Features: Collaborative community, tailored support, mentorship, access to funding, sustainable solutions focus, expertise in product development, marketing, and fundraising.',
  social_media_links = 'Facebook: https://www.facebook.com/cortexhub | Instagram: https://www.instagram.com/cortexhub/ | Twitter: https://twitter.com/TheCortexHub | YouTube: https://www.youtube.com/channel/UCDLYDtTONuZQeR74h7vynNw',
  key_personnel = 'Dr Andile Ngcaba (Patron & Founder), Nico Muka (Non-Executive Chairman), Anda Ngcaba (Non-Executive Director), Sia Mausi (Operations Manager), Lunga Feni (Partnerships Associate), Nobulali Myataza (ESD Specialist), Babalwa Plaatjie (Administrator), Tim Chisale CA(SA) (Financial Manager)',
  partners = 'ECDC (Eastern Cape Development Corporation), NFVF (National Film and Video Foundation), Arm Engage, SOL-CON Foundation, LL-Hubs, MICT SETA Oceans Innovations, AWS Activate',
  updated_at = TIMEZONE('utc', NOW())
WHERE LOWER(name) LIKE '%cortex%' AND LOWER(name) LIKE '%hub%';

-- Insert if doesn't exist
INSERT INTO public.tenants (name, description, industry, location, website, contact_email, additional_contact_email, address, opening_hours, application_url, services, capabilities, social_media_links, key_personnel, partners, created_at, updated_at)
SELECT 
  'The Cortex Hub',
  'A technology incubator and accelerator aimed at helping young entrepreneurs build products, teams, and scalable businesses. Located in East London, South Africa, dedicated to supporting startups that develop socially impactful solutions. We provide a collaborative community for start-ups building innovative solutions with a focus on social impact, offering resources and support for the entire start-up process, from ideation to launch.',
  'Technology Incubator',
  'Incubators',
  'https://www.thecortexhub.africa',
  'partnerships@thecortexhub.africa',
  'info@thecortexhub.africa',
  '33 Church St, East London CBD, East London, 5201',
  NULL, -- contact_phone
  'Monday to Friday, 8:00 am – 6:00 pm',
  'https://forms.gle/nq2umWk67fL9i1SV9',
  'Pre-Incubation Program: Equips early-stage SMMEs with foundational skills. Incubation Program (12 months): Launchpad for aspiring tech entrepreneurs with business planning and product development. Acceleration Program (12 months): Intensive program for startups ready to scale with weekly sprint objectives, mentorship, and direct customer engagement.',
  'Specialization Labs: Optic Fibre Lab (CFOT, FOS/D, CPCT certifications), Bare Metal as a Service Lab (data center automation), Automotive Ethernet Lab (5G connectivity, connected vehicles), Electronics & Hardware Lab (IoT, home automation, Arduino, Sensors), Robotics & Coding Lab (Make-wonder Dash Robotics, Tanks Coding kits), Arm Ecosystem Lab (Arm architecture in automotive and IoT), EC Film Hub (post-production, film editing), E-sports & Gaming Club (3D animation, game development). Key Features: Collaborative community, tailored support, mentorship, access to funding, sustainable solutions focus, expertise in product development, marketing, and fundraising.',
  'Facebook: https://www.facebook.com/cortexhub | Instagram: https://www.instagram.com/cortexhub/ | Twitter: https://twitter.com/TheCortexHub | YouTube: https://www.youtube.com/channel/UCDLYDtTONuZQeR74h7vynNw',
  'Dr Andile Ngcaba (Patron & Founder), Nico Muka (Non-Executive Chairman), Anda Ngcaba (Non-Executive Director), Sia Mausi (Operations Manager), Lunga Feni (Partnerships Associate), Nobulali Myataza (ESD Specialist), Babalwa Plaatjie (Administrator), Tim Chisale CA(SA) (Financial Manager)',
  'ECDC (Eastern Cape Development Corporation), NFVF (National Film and Video Foundation), Arm Engage, SOL-CON Foundation, LL-Hubs, MICT SETA Oceans Innovations, AWS Activate',
  TIMEZONE('utc', NOW()),
  TIMEZONE('utc', NOW())
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) LIKE '%cortex%' AND LOWER(name) LIKE '%hub%');

-- ================================================================
-- STEP 3: Update CHEMIN with complete information (Verified from web search)
-- ================================================================

UPDATE public.tenants
SET 
  name = 'Chemin',
  description = 'A not-for-profit business incubator under the Small Enterprise Development Agency''s (SEDA) program, specializing in the downstream chemicals industry. It supports early-stage technology-based businesses with resources like lab space, testing facilities, manufacturing equipment, office space, seed finance, and collaborations with universities, experts, financing agencies, and government departments. It promotes collaboration, innovation, ingenuity, and wealth creation.',
  industry = 'Business Incubator',
  location = 'Incubators',
  website = 'http://www.chemin.co.za',
  contact_phone = '010 594 9843',
  address = 'Cnr Fish Eagle Str & Pigeon Rd, Fort Jackson (Industrial), Mdantsane, East London, 2519',
  opening_hours = 'Monday to Friday, 08:00 - 16:00',
  services = 'Incubation Models: Enterprise development support, early-stage business support. Laboratory Services: Metals testing, detergents testing, water testing, coal testing, petroleum products testing, pharmaceutical tests. Technical Services: Product development technology, technology transfer, collaboration with universities, experts, financing agencies, and government departments.',
  capabilities = 'Resources Provided: Lab space, testing facilities, manufacturing equipment, office space, seed finance, university collaborations, expert networks, financing agency connections, government department linkages. Focus Areas: Downstream chemicals industry, technology-based businesses, collaboration and innovation, wealth creation. Part of SEDA Technology Incubation Programme.',
  partners = 'SEDA (Small Enterprise Development Agency), Department of Small Business Development',
  updated_at = TIMEZONE('utc', NOW())
WHERE LOWER(name) LIKE '%chemin%';

-- Insert if doesn't exist
INSERT INTO public.tenants (name, description, industry, location, website, contact_phone, address, opening_hours, services, capabilities, partners, created_at, updated_at)
SELECT 
  'Chemin',
  'A not-for-profit business incubator under the Small Enterprise Development Agency''s (SEDA) program, specializing in the downstream chemicals industry. It supports early-stage technology-based businesses with resources like lab space, testing facilities, manufacturing equipment, office space, seed finance, and collaborations with universities, experts, financing agencies, and government departments. It promotes collaboration, innovation, ingenuity, and wealth creation.',
  'Business Incubator',
  'Incubators',
  'http://www.chemin.co.za',
  '010 594 9843',
  'Cnr Fish Eagle Str & Pigeon Rd, Fort Jackson (Industrial), Mdantsane, East London, 2519',
  'Monday to Friday, 08:00 - 16:00',
  'Incubation Models: Enterprise development support, early-stage business support. Laboratory Services: Metals testing, detergents testing, water testing, coal testing, petroleum products testing, pharmaceutical tests. Technical Services: Product development technology, technology transfer, collaboration with universities, experts, financing agencies, and government departments.',
  'Resources Provided: Lab space, testing facilities, manufacturing equipment, office space, seed finance, university collaborations, expert networks, financing agency connections, government department linkages. Focus Areas: Downstream chemicals industry, technology-based businesses, collaboration and innovation, wealth creation. Part of SEDA Technology Incubation Programme.',
  'SEDA (Small Enterprise Development Agency), Department of Small Business Development',
  TIMEZONE('utc', NOW()),
  TIMEZONE('utc', NOW())
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) LIKE '%chemin%');

-- ================================================================
-- STEP 4: Update ECITI with complete information
-- ================================================================

UPDATE public.tenants
SET 
  name = 'ECITI (Eastern Cape Information Technology Institute)',
  description = 'A non-profit business incubator established by the Eastern Cape Development Corporation (ECDC) in 2004, specializing in the information communications technology (ICT) and film sectors. It supports small, medium, and micro enterprises (SMMEs) with infrastructure, mentorship, training, linkages to industry and academic networks, and information resources to reduce business failure risks for start-ups. It moved into the STP on July 20, 2012.',
  industry = 'Business Incubator',
  location = 'Incubators',
  services = 'Infrastructure Support: Office space and facilities, technology infrastructure. Mentorship & Training: Business mentorship, technical training programs, industry-specific guidance. Network Linkages: Industry network connections, academic network connections, information resources.',
  capabilities = 'Focus Areas: Information Communications Technology (ICT), Film sector, Small Medium and Micro Enterprises (SMMEs), Start-up support, Business failure risk reduction. Established: 2004 by Eastern Cape Development Corporation (ECDC). Moved to STP: July 20, 2012.',
  partners = 'ECDC (Eastern Cape Development Corporation)',
  updated_at = TIMEZONE('utc', NOW())
WHERE (LOWER(name) LIKE '%eciti%' OR LOWER(name) LIKE '%eastern cape information technology%');

-- Insert if doesn't exist
INSERT INTO public.tenants (name, description, industry, location, services, capabilities, partners, created_at, updated_at)
SELECT 
  'ECITI (Eastern Cape Information Technology Institute)',
  'A non-profit business incubator established by the Eastern Cape Development Corporation (ECDC) in 2004, specializing in the information communications technology (ICT) and film sectors. It supports small, medium, and micro enterprises (SMMEs) with infrastructure, mentorship, training, linkages to industry and academic networks, and information resources to reduce business failure risks for start-ups. It moved into the STP on July 20, 2012.',
  'Business Incubator',
  'Incubators',
  'Infrastructure Support: Office space and facilities, technology infrastructure. Mentorship & Training: Business mentorship, technical training programs, industry-specific guidance. Network Linkages: Industry network connections, academic network connections, information resources.',
  'Focus Areas: Information Communications Technology (ICT), Film sector, Small Medium and Micro Enterprises (SMMEs), Start-up support, Business failure risk reduction. Established: 2004 by Eastern Cape Development Corporation (ECDC). Moved to STP: July 20, 2012.',
  'ECDC (Eastern Cape Development Corporation)',
  TIMEZONE('utc', NOW()),
  TIMEZONE('utc', NOW())
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) LIKE '%eciti%' OR LOWER(name) LIKE '%eastern cape information technology%');

-- ================================================================
-- STEP 5: Update ECNGOC with complete information
-- ================================================================

UPDATE public.tenants
SET 
  name = 'ECNGOC (Eastern Cape NGO Coalition)',
  description = 'A representative structure for civil society organizations (NGOs and CBOs) in the Eastern Cape, focused on socio-economic transformation for marginalized communities. It strengthens organizational capacity for development activities, influences relations between civil society, local government, and communities, and promotes asset-based community-driven development (ABCD). Services include NGO legislation and compliance support, sustainability initiatives, and citizen-oriented leadership development on accountability and engagement.',
  industry = 'NGO Services',
  location = 'Incubators',
  services = 'Organizational Capacity Building: Strengthening organizational capacity for development activities, NGO legislation and compliance support, sustainability initiatives. Advocacy & Influence: Influencing relations between civil society, local government, and communities, promoting asset-based community-driven development (ABCD). Leadership Development: Citizen-oriented leadership development, accountability and engagement training.',
  capabilities = 'Focus Areas: Socio-economic transformation, marginalized communities, civil society representation, community-driven development. Target: NGOs and CBOs (Community-Based Organizations) in the Eastern Cape.',
  updated_at = TIMEZONE('utc', NOW())
WHERE (LOWER(name) LIKE '%ecngoc%' OR LOWER(name) LIKE '%ecngc%' OR (LOWER(name) LIKE '%eastern cape%' AND LOWER(name) LIKE '%ngo%'));

-- Insert if doesn't exist
INSERT INTO public.tenants (name, description, industry, location, services, capabilities, created_at, updated_at)
SELECT 
  'ECNGOC (Eastern Cape NGO Coalition)',
  'A representative structure for civil society organizations (NGOs and CBOs) in the Eastern Cape, focused on socio-economic transformation for marginalized communities. It strengthens organizational capacity for development activities, influences relations between civil society, local government, and communities, and promotes asset-based community-driven development (ABCD). Services include NGO legislation and compliance support, sustainability initiatives, and citizen-oriented leadership development on accountability and engagement.',
  'NGO Services',
  'Incubators',
  'Organizational Capacity Building: Strengthening organizational capacity for development activities, NGO legislation and compliance support, sustainability initiatives. Advocacy & Influence: Influencing relations between civil society, local government, and communities, promoting asset-based community-driven development (ABCD). Leadership Development: Citizen-oriented leadership development, accountability and engagement training.',
  'Focus Areas: Socio-economic transformation, marginalized communities, civil society representation, community-driven development. Target: NGOs and CBOs (Community-Based Organizations) in the Eastern Cape.',
  TIMEZONE('utc', NOW()),
  TIMEZONE('utc', NOW())
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) LIKE '%ecngoc%' OR LOWER(name) LIKE '%ecngc%' OR (LOWER(name) LIKE '%eastern cape%' AND LOWER(name) LIKE '%ngo%'));

-- ================================================================
-- STEP 6: Update other common tenants with placeholder structure
-- ================================================================

-- Update SAMRC if exists
UPDATE public.tenants
SET 
  services = 'Medical research services, clinical trials support, research collaboration opportunities',
  capabilities = 'Medical research expertise, laboratory facilities, research network connections',
  updated_at = TIMEZONE('utc', NOW())
WHERE LOWER(name) LIKE '%samrc%' OR LOWER(name) LIKE '%south african medical research%';

-- Update ECSA if exists
UPDATE public.tenants
SET 
  services = 'Engineering professional services, certification support, professional development',
  capabilities = 'Engineering council services, professional registration, engineering standards',
  updated_at = TIMEZONE('utc', NOW())
WHERE LOWER(name) LIKE '%ecsa%' OR LOWER(name) LIKE '%engineering council%';

-- Update KGI BPO if exists
UPDATE public.tenants
SET 
  services = 'Business Process Outsourcing services, call center operations, customer service solutions',
  capabilities = 'BPO expertise, customer service training, operational support',
  updated_at = TIMEZONE('utc', NOW())
WHERE LOWER(name) LIKE '%kgi%' AND LOWER(name) LIKE '%bpo%';

-- Update KGI Holdings if exists
UPDATE public.tenants
SET 
  services = 'Business consulting, investment services, corporate solutions',
  capabilities = 'Business development, investment management, corporate advisory',
  updated_at = TIMEZONE('utc', NOW())
WHERE LOWER(name) LIKE '%kgi%' AND LOWER(name) NOT LIKE '%bpo%';

-- Update MSC Artisan Academy if exists
UPDATE public.tenants
SET 
  services = 'Automotive training programs, artisan skills development, technical education',
  capabilities = 'Automotive training expertise, skills development programs, technical certification',
  updated_at = TIMEZONE('utc', NOW())
WHERE LOWER(name) LIKE '%msc%' AND (LOWER(name) LIKE '%artisan%' OR LOWER(name) LIKE '%automotive%');

-- Update Phokophela if exists
UPDATE public.tenants
SET 
  services = 'Investment services, business development, financial advisory',
  capabilities = 'Investment management, business consulting, financial planning',
  updated_at = TIMEZONE('utc', NOW())
WHERE LOWER(name) LIKE '%phokophela%';

-- Update MFURAA if exists
UPDATE public.tenants
SET 
  services = 'Consulting services, project management, business advisory',
  capabilities = 'Business consulting, project management expertise, advisory services',
  updated_at = TIMEZONE('utc', NOW())
WHERE LOWER(name) LIKE '%mfuraa%';

-- Update Long Life ABET if exists
UPDATE public.tenants
SET 
  services = 'Adult Basic Education and Training (ABET), skills development programs, educational services',
  capabilities = 'ABET programs, adult education, skills training, literacy programs',
  updated_at = TIMEZONE('utc', NOW())
WHERE LOWER(name) LIKE '%longlife%' OR LOWER(name) LIKE '%long life%' OR LOWER(name) LIKE '%abet%';

-- ================================================================
-- STEP 7: Verification Query
-- ================================================================

SELECT 
  name,
  industry,
  location,
  website,
  contact_email,
  address,
  CASE 
    WHEN services IS NOT NULL AND LENGTH(services) > 0 THEN 'Yes'
    ELSE 'No'
  END as has_services,
  CASE 
    WHEN capabilities IS NOT NULL AND LENGTH(capabilities) > 0 THEN 'Yes'
    ELSE 'No'
  END as has_capabilities,
  LEFT(description, 50) as description_preview
FROM public.tenants 
ORDER BY name;

