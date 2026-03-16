-- ================================================================
-- ELIDZ Science & Technology Park - Comprehensive Seed
-- Real data from elidzstp.co.za, elidz.co.za
-- Tenants: https://www.elidzstp.co.za/tenants-2/
-- Run in Supabase SQL Editor (writes enabled)
-- ================================================================

-- ================================================================
-- 1. TENANTS - Update ELIDZ STP + Insert all 15 official tenants
-- ================================================================

UPDATE public.tenants SET
  name = 'ELIDZ Science & Technology Park',
  description = 'The East London IDZ Science and Technology Park (ELIDZ STP) is the only park of its kind in South Africa linked to an Industrial Development Zone. Conceived as a catalyst for growth, collaboration, incubation and the application of innovations for the high technology sector. Services include laboratory facilities, training platforms, Connect & Solve open innovation platform, networking solutions, and incubator services. Member of the International Association of Science Parks (IASP).',
  industry = 'Science & Technology Park / Innovation Hub',
  website = 'https://www.elidzstp.co.za',
  contact_email = 'kaylene@elidz.co.za',
  contact_phone = '+27 43 702 8217',
  location = 'Zone 1C, Block K, Lower Chester Road, Sunnyridge, East London, 5201',
  updated_at = NOW()
WHERE LOWER(name) LIKE '%elidz%' AND (LOWER(name) LIKE '%stp%' OR (LOWER(name) LIKE '%science%' AND LOWER(name) LIKE '%technology%'));

-- Official tenants from https://www.elidzstp.co.za/tenants-2/ (names match TenantLogo local assets)
INSERT INTO public.tenants (name, description, industry, logo_url, location, created_at, updated_at)
SELECT 'SAMRC', 'South African Medical Research Council. Tenant at ELIDZ STP.', 'Medical Research', 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/samrc.jpg', 'ELIDZ STP, East London', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) = 'samrc');

INSERT INTO public.tenants (name, description, industry, logo_url, location, created_at, updated_at)
SELECT 'Phokophela Investment Holdings', 'Phokophela Investment Holdings (PIH). Tenant at ELIDZ STP.', 'Investment', 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/pih.jpg', 'ELIDZ STP, East London', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) LIKE '%phokophela%');

INSERT INTO public.tenants (name, description, industry, logo_url, location, created_at, updated_at)
SELECT 'EC NGO Council', 'Eastern Cape NGO Coalition. Tenant at ELIDZ STP.', 'Civil Society', 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/ngo-1.jpg', 'ELIDZ STP, East London', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) LIKE '%ec ngoc%' OR LOWER(name) LIKE '%ngo council%');

INSERT INTO public.tenants (name, description, industry, logo_url, location, created_at, updated_at)
SELECT 'MSC Artisan Academy', 'MSC Artisan Academy. Automotive and manufacturing skills. Tenant at ELIDZ STP.', 'Skills Development', 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/msc.jpg', 'ELIDZ STP, East London', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) LIKE '%msc artisan%');

INSERT INTO public.tenants (name, description, industry, logo_url, location, created_at, updated_at)
SELECT 'Mfuraa', 'Mfuraa Projects. Tenant at ELIDZ STP.', 'Various', 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/mfuraa.jpg', 'ELIDZ STP, East London', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) = 'mfuraa');

INSERT INTO public.tenants (name, description, industry, logo_url, location, created_at, updated_at)
SELECT 'Long Life', 'Long Life ABET Consulting. Tenant at ELIDZ STP.', 'Consulting', 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/long-life.jpg', 'ELIDZ STP, East London', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) LIKE '%long life%');

INSERT INTO public.tenants (name, description, industry, logo_url, location, created_at, updated_at)
SELECT 'KGI BPO', 'KGI BPO. Business process outsourcing. Tenant at ELIDZ STP.', 'BPO', 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/kgi-bpo.jpg', 'ELIDZ STP, East London', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) LIKE '%kgi bpo%');

INSERT INTO public.tenants (name, description, industry, logo_url, location, created_at, updated_at)
SELECT 'ECSA', 'Engineering Council of South Africa. Tenant at ELIDZ STP.', 'Professional Body', 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/ecsa.jpg', 'ELIDZ STP, East London', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) = 'ecsa');

INSERT INTO public.tenants (name, description, industry, logo_url, location, created_at, updated_at)
SELECT 'The Cortex Hub', 'Technology incubator and accelerator. Tenant at ELIDZ STP.', 'Technology Incubator', 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/cotex.jpg', 'ELIDZ STP, East London', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) LIKE '%cortex%' AND LOWER(name) LIKE '%hub%');

INSERT INTO public.tenants (name, description, industry, logo_url, location, created_at, updated_at)
SELECT 'Chemin', 'SEDA chemicals industry incubator. Tenant at ELIDZ STP.', 'Chemicals Incubator', 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/chemin-1.jpg', 'ELIDZ STP, East London', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) = 'chemin');

INSERT INTO public.tenants (name, description, industry, logo_url, location, created_at, updated_at)
SELECT 'Buffalo City Metropolitan Municipality', 'BCMM. Local government partner at ELIDZ STP.', 'Local Government', 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/bcmm.jpg', 'ELIDZ STP, East London', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) LIKE '%buffalo city%');

INSERT INTO public.tenants (name, description, industry, logo_url, location, created_at, updated_at)
SELECT 'AMN Environmental', 'AMN Environmental. Tenant at ELIDZ STP.', 'Environmental', 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/amn.jpg', 'ELIDZ STP, East London', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) LIKE '%amn environmental%');

INSERT INTO public.tenants (name, description, industry, logo_url, location, created_at, updated_at)
SELECT 'ECITI', 'Eastern Cape Information Technology Incubator. Tenant at ELIDZ STP.', 'ICT Incubator', 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/eciti-150x150.jpg', 'ELIDZ STP, East London', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) = 'eciti');

INSERT INTO public.tenants (name, description, industry, logo_url, location, created_at, updated_at)
SELECT 'KGI Holdings', 'KGI Holdings. Tenant at ELIDZ STP.', 'Various', 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/kgi.jpg', 'ELIDZ STP, East London', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) LIKE '%kgi holdings%');

INSERT INTO public.tenants (name, description, industry, logo_url, location, created_at, updated_at)
SELECT 'Zizi', 'Zizi. Tenant at ELIDZ STP.', 'Various', 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/zizi.jpg', 'ELIDZ STP, East London', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) = 'zizi');

INSERT INTO public.tenants (name, description, industry, website, contact_email, contact_phone, location, created_at, updated_at)
SELECT 'East London Industrial Development Zone (ELIDZ)', 'Public entity operating the ELIDZ STP. Promotes industrial development in the Eastern Cape.', 'Industrial Development Zone', 'https://www.elidz.co.za', 'info@elidz.co.za', '+27 43 702 8200', 'Lower Chester Road, Sunnyridge, East London, 5201', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE LOWER(name) LIKE '%east london industrial development zone%' AND LOWER(name) NOT LIKE '%science%');

-- ================================================================
-- 2. FACILITIES - Update with real ELIDZ STP descriptions
-- ================================================================

UPDATE public.facilities SET description = 'The ELIDZ Consulting and Analytical laboratory, the first of its kind in the Eastern Cape. Staffed by highly competent staff specializing in chemical and microbiological analysis. Provides water analysis with expansions planned for food, beverages and environmental analysis.', updated_at = NOW() WHERE id = 'food-water';
UPDATE public.facilities SET description = '3D printing and rapid prototyping. Services: 3D Printing, Laser Cutting & Engraving, CNC Lathe Machining, Desktop Milling. Entrepreneurs can bring CAD models into usable prototypes.', updated_at = NOW() WHERE id = 'design-centre';
UPDATE public.facilities SET description = 'Innospace - Innovation workspace. Broadcasting, videography, auditorium, digital units. Space where like-minded individuals work and relax.', updated_at = NOW() WHERE id = 'digital-hub';
UPDATE public.facilities SET description = 'Incubation through Chemin, ECITI and The Cortex Hub. ELIDZSTP finds the right incubation support for start-ups.', updated_at = NOW() WHERE id = 'automotive-incubator';
UPDATE public.facilities SET description = 'Catalyst for renewable energy skills in the Eastern Cape, South Africa and Africa. Full-service clean energy and sustainability center.', updated_at = NOW() WHERE id = 'renewable-energy';

-- ================================================================
-- 3. NEWS - Multiple real ELIDZ STP articles (source: elidz.co.za)
-- ================================================================

INSERT INTO public.news (title, content, image_url, published_at, created_at, updated_at)
SELECT 'Eastern Cape Innovation Challenge 2025 - Applications Open', 'ELIDZ STP in partnership with UNISA has launched the Eastern Cape Innovation Challenge 2025. Focus: Advanced Manufacturing, Sustainable Energy, Digital Economy, Automotive & Mobility, Agri-business & Aquaculture. Winners: R100,000 each + 12-month incubation. Deadline: 25 September 2025. Apply: elidzstp.co.za/elidz-stp-innovation-challenge-2025', 'https://www.elidzstp.co.za/wp-content/uploads/2025/08/web-home-banner-2.jpg', '2025-08-01'::date, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.news WHERE title LIKE '%Innovation Challenge 2025%');

INSERT INTO public.news (title, content, image_url, published_at, created_at, updated_at)
SELECT 'ELIDZ STP to Host 2025 Eastern Cape Innovation & Entrepreneurship Week', 'ELIDZ-STP hosts Innovation & Entrepreneurship Week (IEW) 24-28 Nov 2025. Theme: Innovate. Commercialise. Thrive. Includes 48-Hour Hackathon, IP & Commercialisation Workshop, Innovation Pitching & Awards. Over R1.5 million in innovation support unveiled.', 'https://www.elidzstp.co.za/wp-content/uploads/2019/08/RINP-BANNER-3.jpg', '2025-11-01'::date, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.news WHERE title LIKE '%Innovation & Entrepreneurship Week%');

INSERT INTO public.news (title, content, image_url, published_at, created_at, updated_at)
SELECT 'ELIDZ STP Head Ludwe Macingwane Elected IASP Africa Division President', 'Ludwe Macingwane, Head of ELIDZ Science & Technology Park, elected Africa Division President of the International Association of Science Parks (IASP). First black South African woman in this role. Assumed office 11 December 2024.', 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/home-banner5.jpg', '2024-12-03'::date, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.news WHERE title LIKE '%Macingwane%IASP%');

INSERT INTO public.news (title, content, image_url, published_at, created_at, updated_at)
SELECT 'ELIDZ STP Electric Vehicle Fundamentals Training - March 2025', 'ELIDZ-STP hosted a 5-day Professional Certificate in Fundamentals of Electric Vehicles (10-14 March 2025). 30 participants from 800+ applications. Training by EIT (Engineering Institute of Technology). Aligns with SA Automotive Masterplan 2035.', 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/design-centre.jpg', '2025-03-27'::date, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.news WHERE title LIKE '%Electric Vehicle%March%');

INSERT INTO public.news (title, content, image_url, published_at, created_at, updated_at)
SELECT 'ELIDZ Vision 2025: 62% Revenue Growth, R579.9M Investment, 5,205 Jobs', 'ELIDZ achieved 62% increase in revenue-generating capability, R579.9 million private sector investment, 5,205 active jobs, 21.9% industrial turnover growth. STP completed four prototypes, supported SMMEs through localization.', 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/renew-centre.jpg', '2025-11-13'::date, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.news WHERE title LIKE '%Vision 2025%62%');

-- ================================================================
-- 4. RESOURCES - Multiple ELIDZ STP links and tools
-- ================================================================

INSERT INTO public.resources (title, description, type, url, category, created_at, updated_at)
SELECT 'Connect & Solve', 'Open innovation platform connecting innovators, investors and solution providers with solution seekers across the Eastern Cape.', 'Link', 'https://www.connectandsolve.co.za', 'Innovation Platform', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.resources WHERE title = 'Connect & Solve');

INSERT INTO public.resources (title, description, type, url, category, created_at, updated_at)
SELECT 'ELIDZ STP Innovation Challenge 2025', 'Apply for the Eastern Cape Innovation Challenge. R100,000 per winner, mentorship, 12-month incubation.', 'Link', 'https://www.elidzstp.co.za/elidz-stp-innovation-challenge-2025/', 'Funding', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.resources WHERE title LIKE '%Innovation Challenge 2025%');

INSERT INTO public.resources (title, description, type, url, category, created_at, updated_at)
SELECT 'ELIDZ STP Design Centre', '3D printing, laser cutting, CNC machining, rapid prototyping services.', 'Link', 'https://www.elidzstp.co.za/design-centre/', 'Facilities', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.resources WHERE title LIKE '%Design Centre%');

INSERT INTO public.resources (title, description, type, url, category, created_at, updated_at)
SELECT 'ELIDZ STP Analytical Laboratory', 'Chemical and microbiological analysis. Water, food, environmental testing.', 'Link', 'https://www.elidzstp.co.za/analytical-laboratory/', 'Facilities', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.resources WHERE title LIKE '%Analytical Laboratory%');

INSERT INTO public.resources (title, description, type, url, category, created_at, updated_at)
SELECT 'ELIDZ STP Incubation', 'Incubation services through Chemin, ECITI and The Cortex Hub.', 'Link', 'https://www.elidzstp.co.za/incubation-2/', 'Incubation', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.resources WHERE title LIKE '%Incubation%');

-- ================================================================
-- 5. EVENTS - Real ELIDZ STP events (organizer_id nullable)
-- ================================================================

INSERT INTO public.events (title, description, date, location, registration_url, created_at, updated_at)
SELECT 'Eastern Cape Innovation & Entrepreneurship Week 2025', 'Innovate. Commercialise. Thrive. 48-Hour Hackathon, IP Workshop, Innovation Pitching & Awards. Over R1.5M in support.', '2025-11-24 09:00:00+02', 'ELIDZ STP, East London', 'https://www.elidzstp.co.za', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.events WHERE title LIKE '%Innovation & Entrepreneurship Week 2025%');

INSERT INTO public.events (title, description, date, location, registration_url, created_at, updated_at)
SELECT 'Eastern Cape Innovation Challenge 2025 - Awards Ceremony', 'Final presentation and awards. R100,000 per winner. 12-month incubation.', '2025-11-28 14:00:00+02', 'ELIDZ STP, East London', 'https://www.elidzstp.co.za/elidz-stp-innovation-challenge-2025/', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.events WHERE title LIKE '%Innovation Challenge 2025%Awards%');

INSERT INTO public.events (title, description, date, location, created_at, updated_at)
SELECT 'SMME Funding Information Seminar', 'Information session on SMME funding opportunities at ELIDZ STP.', '2025-06-15 10:00:00+02', 'ELIDZ STP, Zone 1C, Block K, East London', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.events WHERE title LIKE '%SMME Funding%');
