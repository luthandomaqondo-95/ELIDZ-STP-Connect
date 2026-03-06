-- ================================================================
-- ELIDZ Science & Technology Park - Company Information
-- Populated from research via Playwright MCP (elidzstp.co.za, elidz.co.za)
-- Tenants list from: https://www.elidzstp.co.za/tenants-2/
-- Run in Supabase SQL Editor
-- ================================================================

-- Update existing ELIDZ STP tenant with comprehensive research data
UPDATE public.tenants
SET
  name = 'ELIDZ Science & Technology Park',
  description = 'The East London IDZ Science and Technology Park (ELIDZ STP) is the only park of its kind in South Africa linked to an Industrial Development Zone. Conceived as a catalyst for growth, collaboration, incubation and the application of innovations for the high technology sector. The park is designed as an attractive, functional and interactive space to encourage the exchange of ideas and facilitate the development of creative technical solutions to problems. Its services include laboratory facilities, training platforms, an open innovation platform (Connect & Solve), networking solutions, and incubator services. The ELIDZ has located 2 incubators in the STP through the organisation''s incubator programme, geared towards advancing techpreneurship skills amongst youth of the Eastern Cape Province. Member of the International Association of Science Parks (IASP).',
  industry = 'Science & Technology Park / Innovation Hub',
  website = 'https://www.elidzstp.co.za',
  contact_email = 'kaylene@elidz.co.za',
  contact_phone = '+27 43 702 8217',
  location = 'Zone 1C, Block K, Lower Chester Road, Sunnyridge, East London, 5201',
  updated_at = TIMEZONE('utc', NOW())
WHERE LOWER(name) LIKE '%elidz%' AND (LOWER(name) LIKE '%stp%' OR LOWER(name) LIKE '%science%technology%');

-- ================================================================
-- OFFICIAL TENANTS from https://www.elidzstp.co.za/tenants-2/
-- (15 tenants listed by logo on the official ELIDZ STP Tenants page)
-- ================================================================

INSERT INTO public.tenants (name, description, industry, logo_url, location, created_at, updated_at)
SELECT 'SAMRC', 'South African Medical Research Council - tenant at ELIDZ STP.', 'Medical Research', 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/samrc.jpg', 'ELIDZ STP, East London', TIMEZONE('utc', NOW()), TIMEZONE('utc', NOW())
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) = 'samrc');

INSERT INTO public.tenants (name, description, industry, logo_url, location, created_at, updated_at)
SELECT 'PIH', 'PIH - tenant at ELIDZ Science & Technology Park.', 'Various', 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/pih.jpg', 'ELIDZ STP, East London', TIMEZONE('utc', NOW()), TIMEZONE('utc', NOW())
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) = 'pih');

INSERT INTO public.tenants (name, description, industry, logo_url, location, created_at, updated_at)
SELECT 'EC NGO Council', 'Eastern Cape NGO Council - tenant at ELIDZ STP.', 'Civil Society', 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/ngo-1.jpg', 'ELIDZ STP, East London', TIMEZONE('utc', NOW()), TIMEZONE('utc', NOW())
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) LIKE '%ec ngoc%' OR LOWER(name) LIKE '%ngo council%');

INSERT INTO public.tenants (name, description, industry, logo_url, location, created_at, updated_at)
SELECT 'MSC', 'MSC - tenant at ELIDZ Science & Technology Park.', 'Various', 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/msc.jpg', 'ELIDZ STP, East London', TIMEZONE('utc', NOW()), TIMEZONE('utc', NOW())
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) = 'msc');

INSERT INTO public.tenants (name, description, industry, logo_url, location, created_at, updated_at)
SELECT 'Mfuraa', 'Mfuraa - tenant at ELIDZ Science & Technology Park.', 'Various', 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/mfuraa.jpg', 'ELIDZ STP, East London', TIMEZONE('utc', NOW()), TIMEZONE('utc', NOW())
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) = 'mfuraa');

INSERT INTO public.tenants (name, description, industry, logo_url, location, created_at, updated_at)
SELECT 'Long Life', 'Long Life - tenant at ELIDZ Science & Technology Park.', 'Various', 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/long-life.jpg', 'ELIDZ STP, East London', TIMEZONE('utc', NOW()), TIMEZONE('utc', NOW())
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) LIKE '%long life%');

INSERT INTO public.tenants (name, description, industry, logo_url, location, created_at, updated_at)
SELECT 'KGI BPO', 'KGI BPO - tenant at ELIDZ Science & Technology Park.', 'BPO / Business Services', 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/kgi-bpo.jpg', 'ELIDZ STP, East London', TIMEZONE('utc', NOW()), TIMEZONE('utc', NOW())
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) LIKE '%kgi bpo%');

INSERT INTO public.tenants (name, description, industry, logo_url, location, created_at, updated_at)
SELECT 'ECSA', 'ECSA - tenant at ELIDZ Science & Technology Park.', 'Various', 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/ecsa.jpg', 'ELIDZ STP, East London', TIMEZONE('utc', NOW()), TIMEZONE('utc', NOW())
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) = 'ecsa');

INSERT INTO public.tenants (name, description, industry, logo_url, location, created_at, updated_at)
SELECT 'The Cortex Hub', 'Technology incubator and accelerator for young entrepreneurs. Tenant at ELIDZ STP.', 'Technology Incubator', 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/cotex.jpg', 'ELIDZ STP, East London', TIMEZONE('utc', NOW()), TIMEZONE('utc', NOW())
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) LIKE '%cortex%' AND LOWER(name) LIKE '%hub%');

INSERT INTO public.tenants (name, description, industry, logo_url, location, created_at, updated_at)
SELECT 'Chemin', 'SEDA chemicals industry incubator. Tenant at ELIDZ Science & Technology Park.', 'Chemicals Incubator', 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/chemin-1.jpg', 'ELIDZ STP, East London', TIMEZONE('utc', NOW()), TIMEZONE('utc', NOW())
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) = 'chemin');

INSERT INTO public.tenants (name, description, industry, logo_url, location, created_at, updated_at)
SELECT 'BCMM', 'Buffalo City Metropolitan Municipality - tenant at ELIDZ STP.', 'Local Government', 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/bcmm.jpg', 'ELIDZ STP, East London', TIMEZONE('utc', NOW()), TIMEZONE('utc', NOW())
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) = 'bcmm');

INSERT INTO public.tenants (name, description, industry, logo_url, location, created_at, updated_at)
SELECT 'AMN', 'AMN - tenant at ELIDZ Science & Technology Park.', 'Various', 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/amn.jpg', 'ELIDZ STP, East London', TIMEZONE('utc', NOW()), TIMEZONE('utc', NOW())
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) = 'amn');

INSERT INTO public.tenants (name, description, industry, logo_url, location, created_at, updated_at)
SELECT 'ECITI', 'Eastern Cape Information Technology Incubator. Tenant at ELIDZ Science & Technology Park.', 'ICT Incubator', 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/eciti-150x150.jpg', 'ELIDZ STP, East London', TIMEZONE('utc', NOW()), TIMEZONE('utc', NOW())
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) = 'eciti');

INSERT INTO public.tenants (name, description, industry, logo_url, location, created_at, updated_at)
SELECT 'KGI', 'KGI - tenant at ELIDZ Science & Technology Park.', 'Various', 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/kgi.jpg', 'ELIDZ STP, East London', TIMEZONE('utc', NOW()), TIMEZONE('utc', NOW())
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(TRIM(name)) = 'kgi');

INSERT INTO public.tenants (name, description, industry, logo_url, location, created_at, updated_at)
SELECT 'Zizi', 'Zizi - tenant at ELIDZ Science & Technology Park.', 'Various', 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/zizi.jpg', 'ELIDZ STP, East London', TIMEZONE('utc', NOW()), TIMEZONE('utc', NOW())
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) = 'zizi');

-- Insert East London IDZ (parent organization) if not exists
INSERT INTO public.tenants (name, description, industry, website, contact_email, contact_phone, location, created_at, updated_at)
SELECT
  'East London Industrial Development Zone (ELIDZ)',
  'The East London Industrial Development Zone (ELIDZ) is a public entity that operates the ELIDZ Science & Technology Park. It promotes clean administration and industrial development in the Eastern Cape. The ELIDZ STP is made possible by the ELIDZ. Main services include investment facilitation, industrial development, and support for the Science & Technology Park.',
  'Industrial Development Zone',
  'https://www.elidz.co.za',
  'info@elidz.co.za',
  '+27 43 702 8200',
  'Lower Chester Road, Sunnyridge, East London, 5201, South Africa',
  TIMEZONE('utc', NOW()),
  TIMEZONE('utc', NOW())
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) LIKE '%east london industrial development zone%' AND LOWER(name) NOT LIKE '%science%');

-- Update facilities with more detailed descriptions from ELIDZ STP research
UPDATE public.facilities
SET
  description = 'The ELIDZ Consulting and Analytical laboratory, the first of its kind in the Eastern Cape province, serves as an ideal testing hub. Staffed by highly competent staff specializing in chemical and microbiological analysis. Provides analyses of water with expansions planned for food, beverages and environmental analysis.',
  updated_at = TIMEZONE('utc', NOW())
WHERE id = 'food-water';

UPDATE public.facilities
SET
  description = '3D printing and rapid prototyping facility. Entrepreneurs, researchers and industry can bring or transmit a design concept (typically a CAD model) into a usable prototype. Services include 3D Printing, Laser Cutting & Engraving, CNC Lathe Machining, and Desktop Milling.',
  updated_at = TIMEZONE('utc', NOW())
WHERE id = 'design-centre';

UPDATE public.facilities
SET
  description = 'Innospace - Innovation workspace using the latest design techniques to create impactful, interactive and attractive workspaces. A space where like-minded individuals can work and relax. Includes broadcasting, videography, auditorium, and digital units.',
  updated_at = TIMEZONE('utc', NOW())
WHERE id = 'digital-hub';

UPDATE public.facilities
SET
  description = 'Incubation services through tenants Chemin, ECITI and The Cortex Hub. These incubators offer start-ups the assistance they need to become fully fledged businesses. ELIDZSTP will endeavor to find the right incubation support for start-ups that do not fall within their specific services.',
  updated_at = TIMEZONE('utc', NOW())
WHERE id = 'automotive-incubator';

UPDATE public.facilities
SET
  description = 'A catalyst and leader in the development and growth of skills within the renewable energy sector, not only within the Eastern Cape, but also South Africa and into Africa. Full-service clean energy and sustainability center.',
  updated_at = TIMEZONE('utc', NOW())
WHERE id = 'renewable-energy';

-- Add a news item about ELIDZ STP (if news table exists and we want to populate)
INSERT INTO public.news (title, content, image_url, published_at, created_at, updated_at)
SELECT
  'ELIDZ STP Innovation Challenge 2025 - Call for Applications',
  'Are you an Eastern Cape innovator with a solution for one of the Eastern Cape Province''s pressing challenges? The ELIDZ STP in partnership with UNISA has launched the Eastern Cape Innovation Challenge 2025. Focus areas: Agriculture (Agro-processing and Aquaculture), Automotive, ICT and Electronics, Renewable Energy and Manufacturing. Winners receive R100,000 in prize money and access to mentorship, technical support, and 12-month incubation programmes. Register at elidzstp.co.za.',
  'https://www.elidzstp.co.za/wp-content/uploads/2025/08/web-home-banner-2.jpg',
  TIMEZONE('utc', NOW()),
  TIMEZONE('utc', NOW()),
  TIMEZONE('utc', NOW())
WHERE NOT EXISTS (SELECT 1 FROM public.news WHERE title LIKE '%Innovation Challenge 2025%');

-- Add Connect & Solve as a resource (open innovation platform)
INSERT INTO public.resources (title, description, type, url, category, created_at, updated_at)
SELECT
  'Connect & Solve',
  'Open innovation platform connecting innovators, investors and solution providers with solution seekers in government, academia, civil society and the private sector within the Eastern Cape and beyond.',
  'Link',
  'https://www.connectandsolve.co.za',
  'Innovation Platform',
  TIMEZONE('utc', NOW()),
  TIMEZONE('utc', NOW())
WHERE NOT EXISTS (SELECT 1 FROM public.resources WHERE title = 'Connect & Solve');
