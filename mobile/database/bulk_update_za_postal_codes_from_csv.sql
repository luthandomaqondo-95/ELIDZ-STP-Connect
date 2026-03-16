-- Bulk update za_postal_codes from a CSV (corrected province/place/coords).
-- Use this instead of thousands of VALUES in fix_za_postal_codes_admin_name1.sql.
--
-- HOW TO RUN (pick one):
--
-- A) Supabase Dashboard:
--    1. Create table (run "Create import table" below once).
--    2. Table Editor → za_postal_codes_import → Import data from CSV (za_postal_codes.csv).
--    3. Run the "Single UPDATE" section below.
--
-- B) psql (file on your machine):
--    1. Run "Create import table" below.
--    2. \copy public.za_postal_codes_import (country_code, postal_code, place_name, admin_name1, admin_name2, admin_name3, latitude, longitude, accuracy) FROM 'path/to/za_postal_codes.csv' WITH (FORMAT csv, HEADER true, NULL '');
--    3. Run the "Single UPDATE" section below.

-- ========== 1. CREATE IMPORT TABLE (run once) ==========
CREATE TABLE IF NOT EXISTS public.za_postal_codes_import (
  country_code text NOT NULL,
  postal_code text NOT NULL,
  place_name text,
  admin_name1 text,
  admin_name2 text,
  admin_name3 text,
  latitude text,
  longitude text,
  accuracy text
);

-- ========== 2. SINGLE BULK UPDATE ==========
-- Matches on (country_code, postal_code, place_name). One UPDATE for all ~3,920 rows.
-- CSV must have the same (country_code, postal_code, place_name) as the table (e.g. export from DB, fix columns, re-import).
UPDATE public.za_postal_codes z
SET
  place_name = i.place_name,
  admin_name1 = i.admin_name1,
  admin_name2 = i.admin_name2,
  admin_name3 = i.admin_name3,
  latitude = NULLIF(TRIM(i.latitude), '')::double precision,
  longitude = NULLIF(TRIM(i.longitude), '')::double precision,
  accuracy = NULLIF(TRIM(i.accuracy), '')::integer
FROM (
  SELECT DISTINCT ON (country_code, postal_code, place_name)
    country_code, postal_code, place_name, admin_name1, admin_name2, admin_name3,
    latitude, longitude, accuracy
  FROM public.za_postal_codes_import
  ORDER BY country_code, postal_code, place_name
) i
WHERE z.country_code = i.country_code
  AND z.postal_code = i.postal_code
  AND z.place_name = i.place_name;

-- Optional: drop staging table after a successful run
-- DROP TABLE IF EXISTS public.za_postal_codes_import;
