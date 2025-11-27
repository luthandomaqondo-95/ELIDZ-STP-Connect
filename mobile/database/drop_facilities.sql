-- ================================================================
-- DROP FACILITIES TABLES (Run this first if you have existing tables with wrong schema)
-- ================================================================

-- This script drops all facilities-related tables in the correct order
-- Run this BEFORE running schema.sql if you get type mismatch errors

-- Drop in reverse dependency order
DROP TABLE IF EXISTS public.vr_hotspots CASCADE;
DROP TABLE IF EXISTS public.vr_regions CASCADE;
DROP TABLE IF EXISTS public.vr_sections CASCADE;
DROP TABLE IF EXISTS public.vr_scenes CASCADE;
DROP TABLE IF EXISTS public.facilities CASCADE;

-- Verify tables are dropped
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'vr_%' OR tablename = 'facilities';

