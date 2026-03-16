-- ================================================================
-- ELIDZ STP - Events Seed
-- Run in Supabase SQL Editor
-- Requires: public.events table (from schema.sql)
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
