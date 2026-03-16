-- Fix za_postal_codes admin_name1 (province) assignments.
-- 0. CORRECTION: update specific rows with wrong province/place/coords (by id)
-- 1. CORRECT wrong assignments (e.g. Witbank, Nelspruit wrongly marked Gauteng)
-- 2. POPULATE null admin_name1 for known places
-- Run after loading ZA postal data.

-- ========== 0. CORRECTION: BULK UPDATE FROM CSV ==========
-- Do this first: load za_postal_codes.csv and run one bulk UPDATE (fast for 3,920 rows).
-- See: mobile/database/bulk_update_za_postal_codes_from_csv.sql
-- Steps: create za_postal_codes_import, import CSV, run the single UPDATE from that script.

-- ========== 1. FIX INCORRECT PROVINCE ASSIGNMENTS ==========
-- Places wrongly marked Gauteng that are actually Mpumalanga
UPDATE public.za_postal_codes SET admin_name1 = 'Mpumalanga'
WHERE country_code = 'ZA' AND admin_name1 = 'Gauteng'
  AND (place_name ILIKE 'Witbank%' OR place_name ILIKE 'Nelspruit%'
    OR place_name ILIKE 'Middelburg%' OR place_name ILIKE 'Barberton%'
    OR place_name ILIKE 'White River%' OR place_name ILIKE 'Whiteriver%'
    OR place_name ILIKE 'Witrivier%' OR place_name ILIKE 'Hazyview%'
    OR place_name ILIKE 'Sabie%' OR place_name ILIKE 'Graskop%'
    OR place_name ILIKE 'Belfast%' OR place_name ILIKE 'Lydenburg%'
    OR place_name ILIKE 'Carolina%' OR place_name ILIKE 'Hendrina%'
    OR place_name ILIKE 'Komatipoort%' OR place_name ILIKE 'Malelane%'
    OR place_name ILIKE 'Acornhoek%' OR place_name ILIKE 'Bushbuckridge%'
    OR place_name ILIKE 'Kabokweni%' OR place_name ILIKE 'Kanyamazane%'
    OR place_name ILIKE 'Mkhuhlu%' OR place_name ILIKE 'Ximhungwe%'
    OR place_name ILIKE 'Bosbokrand%' OR place_name ILIKE 'Thulamahashe%'
    OR place_name ILIKE 'Hluvukani%' OR place_name ILIKE 'Skukuza%'
    OR place_name ILIKE 'Shongwe Mission%' OR place_name ILIKE 'Kwalugedlane%'
    OR place_name ILIKE 'Mpudulle%' OR place_name ILIKE 'Driekop%'
    OR place_name ILIKE 'Penge%' OR place_name ILIKE 'Sekhukhune%');

-- Places wrongly marked Gauteng that are actually Limpopo
UPDATE public.za_postal_codes SET admin_name1 = 'Limpopo'
WHERE country_code = 'ZA' AND admin_name1 = 'Gauteng'
  AND (place_name ILIKE 'Burgersfort%' OR place_name ILIKE 'Phalaborwa%'
    OR place_name ILIKE 'Hoedspruit%' OR place_name ILIKE 'Namakgale%');

-- ========== 2. POPULATE NULL admin_name1 (and fix wrongly-assigned Gauteng) ==========
-- Use (admin_name1 IS NULL OR admin_name1 = 'Gauteng') so rows wrongly set to Gauteng get reassigned.

-- Rows where place_name is literally the province name (common in source data)
UPDATE public.za_postal_codes SET admin_name1 = 'Eastern Cape' WHERE country_code = 'ZA' AND (admin_name1 IS NULL OR admin_name1 = 'Gauteng') AND TRIM(COALESCE(place_name, '')) = 'Eastern Cape';
UPDATE public.za_postal_codes SET admin_name1 = 'Western Cape' WHERE country_code = 'ZA' AND (admin_name1 IS NULL OR admin_name1 = 'Gauteng') AND TRIM(COALESCE(place_name, '')) = 'Western Cape';
UPDATE public.za_postal_codes SET admin_name1 = 'Northern Cape' WHERE country_code = 'ZA' AND (admin_name1 IS NULL OR admin_name1 = 'Gauteng') AND TRIM(COALESCE(place_name, '')) = 'Northern Cape';
UPDATE public.za_postal_codes SET admin_name1 = 'KwaZulu-Natal' WHERE country_code = 'ZA' AND (admin_name1 IS NULL OR admin_name1 = 'Gauteng') AND (TRIM(COALESCE(place_name, '')) = 'KwaZulu-Natal' OR TRIM(COALESCE(place_name, '')) = 'KwaZulu Natal');
UPDATE public.za_postal_codes SET admin_name1 = 'Gauteng' WHERE country_code = 'ZA' AND admin_name1 IS NULL AND TRIM(COALESCE(place_name, '')) = 'Gauteng';
UPDATE public.za_postal_codes SET admin_name1 = 'Free State' WHERE country_code = 'ZA' AND (admin_name1 IS NULL OR admin_name1 = 'Gauteng') AND (TRIM(COALESCE(place_name, '')) = 'Free State' OR TRIM(COALESCE(place_name, '')) = 'Orange Free State');
UPDATE public.za_postal_codes SET admin_name1 = 'Limpopo' WHERE country_code = 'ZA' AND (admin_name1 IS NULL OR admin_name1 = 'Gauteng') AND TRIM(COALESCE(place_name, '')) = 'Limpopo';
UPDATE public.za_postal_codes SET admin_name1 = 'Mpumalanga' WHERE country_code = 'ZA' AND (admin_name1 IS NULL OR admin_name1 = 'Gauteng') AND TRIM(COALESCE(place_name, '')) = 'Mpumalanga';
UPDATE public.za_postal_codes SET admin_name1 = 'North West' WHERE country_code = 'ZA' AND (admin_name1 IS NULL OR admin_name1 = 'Gauteng') AND TRIM(COALESCE(place_name, '')) = 'North West';

-- Gauteng (by place name; only fill nulls so we do not overwrite other provinces)
UPDATE public.za_postal_codes SET admin_name1 = 'Gauteng'
WHERE country_code = 'ZA' AND admin_name1 IS NULL
  AND (place_name ILIKE 'Pretoria%' OR place_name ILIKE 'Centurion%'
    OR place_name ILIKE 'Atteridgeville%' OR place_name ILIKE 'Glenstantia%'
    OR place_name ILIKE 'Eersterus%' OR place_name ILIKE 'Doornpoort%'
    OR place_name ILIKE 'Laudium%' OR place_name ILIKE 'Menlo Park%'
    OR place_name ILIKE 'Garsfontein%' OR place_name ILIKE 'Faerie Glen%'
    OR place_name ILIKE 'Moreletapark%' OR place_name ILIKE 'Wapadrand%'
    OR place_name ILIKE 'Lyttelton%' OR place_name ILIKE 'Philip Nel Park%'
    OR place_name ILIKE 'Derdepoortpark%' OR place_name ILIKE 'Hercules%'
    OR place_name ILIKE 'Hatfield%' OR place_name ILIKE 'Moot%'
    OR place_name ILIKE 'Wierdapark%' OR place_name ILIKE 'Kromdraai%'
    OR place_name ILIKE 'Johannesburg%' OR place_name ILIKE 'Sandton%'
    OR place_name ILIKE 'Soweto%' OR place_name ILIKE 'Roodepoort%'
    OR place_name ILIKE 'Randburg%' OR place_name ILIKE 'Kempton Park%'
    OR place_name ILIKE 'Boksburg%' OR place_name ILIKE 'Benoni%'
    OR place_name ILIKE 'Germiston%' OR place_name ILIKE 'Springs%'
    OR place_name ILIKE 'Ekurhuleni%' OR place_name ILIKE 'Tshwane%'
    OR place_name ILIKE 'Midrand%' OR place_name ILIKE 'Alberton%'
    OR place_name ILIKE 'Brakpan%' OR place_name ILIKE 'Krugersdorp%');

-- Western Cape
UPDATE public.za_postal_codes SET admin_name1 = 'Western Cape'
WHERE country_code = 'ZA' AND (admin_name1 IS NULL OR admin_name1 = 'Gauteng')
  AND (place_name ILIKE 'Cape Town%' OR place_name ILIKE 'Stellenbosch%'
    OR place_name ILIKE 'Paarl%' OR place_name ILIKE 'Franschhoek%'
    OR place_name ILIKE 'George%' OR place_name ILIKE 'Knysna%'
    OR place_name ILIKE 'Mossel Bay%' OR place_name ILIKE 'Worcester%'
    OR place_name ILIKE 'Hermanus%' OR place_name ILIKE 'Somerset West%'
    OR place_name ILIKE 'Strand%' OR place_name ILIKE 'Simon''s Town%'
    OR place_name ILIKE 'Constantia%' OR place_name ILIKE 'Claremont%'
    OR place_name ILIKE 'Sea Point%' OR place_name ILIKE 'Camps Bay%'
    OR place_name ILIKE 'Bellville%' OR place_name ILIKE 'Parow%'
    OR place_name ILIKE 'Durbanville%' OR place_name ILIKE 'Mitchells Plain%'
    OR place_name ILIKE 'Khayelitsha%' OR place_name ILIKE 'Langebaan%');

-- KwaZulu-Natal
UPDATE public.za_postal_codes SET admin_name1 = 'KwaZulu-Natal'
WHERE country_code = 'ZA' AND (admin_name1 IS NULL OR admin_name1 = 'Gauteng')
  AND (place_name ILIKE 'Durban%' OR place_name ILIKE 'Pietermaritzburg%'
    OR place_name ILIKE 'Newcastle%' OR place_name ILIKE 'Pinetown%'
    OR place_name ILIKE 'Umhlanga%' OR place_name ILIKE 'Amanzimtoti%'
    OR place_name ILIKE 'Kokstad%' OR place_name ILIKE 'Ballito%'
    OR place_name ILIKE 'Richards Bay%' OR place_name ILIKE 'Ladysmith%'
    OR place_name ILIKE 'Scottburgh%' OR place_name ILIKE 'Margate%'
    OR place_name ILIKE 'Port Shepstone%' OR place_name ILIKE 'Empangeni%'
    OR place_name ILIKE 'Stanger%' OR place_name ILIKE 'eThekwini%');

-- Eastern Cape
UPDATE public.za_postal_codes SET admin_name1 = 'Eastern Cape'
WHERE country_code = 'ZA' AND (admin_name1 IS NULL OR admin_name1 = 'Gauteng')
  AND (place_name ILIKE 'Port Elizabeth%' OR place_name ILIKE 'East London%'
    OR place_name ILIKE 'Grahamstown%' OR place_name ILIKE 'Makhanda%'
    OR place_name ILIKE 'Gqeberha%' OR place_name ILIKE 'Uitenhage%'
    OR place_name ILIKE 'Graaff-Reinet%' OR place_name ILIKE 'Jeffreys Bay%'
    OR place_name ILIKE 'Queenstown%' OR place_name ILIKE 'Mthatha%'
    OR place_name ILIKE 'Bhisho%' OR place_name ILIKE 'Alice%'
    OR place_name ILIKE 'Cradock%' OR place_name ILIKE 'Grahamstown%');

-- Free State
UPDATE public.za_postal_codes SET admin_name1 = 'Free State'
WHERE country_code = 'ZA' AND (admin_name1 IS NULL OR admin_name1 = 'Gauteng')
  AND (place_name ILIKE 'Bloemfontein%' OR place_name ILIKE 'Welkom%'
    OR place_name ILIKE 'Kroonstad%' OR place_name ILIKE 'Bethlehem%'
    OR place_name ILIKE 'Sasolburg%' OR place_name ILIKE 'Parys%'
    OR place_name ILIKE 'Virginia%' OR place_name ILIKE 'Phuthaditjhaba%');

-- Limpopo
UPDATE public.za_postal_codes SET admin_name1 = 'Limpopo'
WHERE country_code = 'ZA' AND (admin_name1 IS NULL OR admin_name1 = 'Gauteng')
  AND (place_name ILIKE 'Polokwane%' OR place_name ILIKE 'Pietersburg%'
    OR place_name ILIKE 'Tzaneen%' OR place_name ILIKE 'Lephalale%'
    OR place_name ILIKE 'Mokopane%' OR place_name ILIKE 'Louis Trichardt%'
    OR place_name ILIKE 'Thohoyandou%' OR place_name ILIKE 'Giyani%'
    OR place_name ILIKE 'Modimolle%' OR place_name ILIKE 'Bela-Bela%');

-- Mpumalanga
UPDATE public.za_postal_codes SET admin_name1 = 'Mpumalanga'
WHERE country_code = 'ZA' AND (admin_name1 IS NULL OR admin_name1 = 'Gauteng')
  AND (place_name ILIKE 'Nelspruit%' OR place_name ILIKE 'Mbombela%'
    OR place_name ILIKE 'Witbank%' OR place_name ILIKE 'eMalahleni%'
    OR place_name ILIKE 'Middleburg%' OR place_name ILIKE 'Barberton%'
    OR place_name ILIKE 'White River%' OR place_name ILIKE 'Hazyview%'
    OR place_name ILIKE 'Kruger%' OR place_name ILIKE 'Sabie%'
    OR place_name ILIKE 'Ermelo%' OR place_name ILIKE 'Standerton%');

-- Northern Cape
UPDATE public.za_postal_codes SET admin_name1 = 'Northern Cape'
WHERE country_code = 'ZA' AND (admin_name1 IS NULL OR admin_name1 = 'Gauteng')
  AND (place_name ILIKE 'Kimberley%' OR place_name ILIKE 'Upington%'
    OR place_name ILIKE 'Springbok%' OR place_name ILIKE 'Kuruman%'
    OR place_name ILIKE 'De Aar%' OR place_name ILIKE 'Colesberg%'
    OR place_name ILIKE 'Prieska%' OR place_name ILIKE 'Calvinia%'
    OR place_name ILIKE 'Sutherland%' OR place_name ILIKE 'Alexander Bay%');

-- North West
UPDATE public.za_postal_codes SET admin_name1 = 'North West'
WHERE country_code = 'ZA' AND (admin_name1 IS NULL OR admin_name1 = 'Gauteng')
  AND (place_name ILIKE 'Rustenburg%' OR place_name ILIKE 'Potchefstroom%'
    OR place_name ILIKE 'Mahikeng%' OR place_name ILIKE 'Mafikeng%'
    OR place_name ILIKE 'Klerksdorp%' OR place_name ILIKE 'Brits%'
    OR place_name ILIKE 'Lichtenburg%' OR place_name ILIKE 'Zeerust%'
    OR place_name ILIKE 'Orkney%' OR place_name ILIKE 'Sun City%'
    OR place_name ILIKE 'Pilanesberg%');

-- ========== 3. FILL REMAINING NULL/GAUTENG admin_name1 BY COORDINATES (approximate SA bounds) ==========
-- Rows still null or wrongly Gauteng get assigned by rough lat/long boxes.
UPDATE public.za_postal_codes SET admin_name1 = 'Western Cape'
WHERE country_code = 'ZA' AND (admin_name1 IS NULL OR admin_name1 = 'Gauteng')
  AND latitude IS NOT NULL AND longitude IS NOT NULL
  AND latitude BETWEEN -35 AND -31.5
  AND longitude BETWEEN 17 AND 26;

UPDATE public.za_postal_codes SET admin_name1 = 'Eastern Cape'
WHERE country_code = 'ZA' AND (admin_name1 IS NULL OR admin_name1 = 'Gauteng')
  AND latitude IS NOT NULL AND longitude IS NOT NULL
  AND latitude BETWEEN -34 AND -30.5
  AND longitude BETWEEN 22 AND 31;

UPDATE public.za_postal_codes SET admin_name1 = 'Northern Cape'
WHERE country_code = 'ZA' AND (admin_name1 IS NULL OR admin_name1 = 'Gauteng')
  AND latitude IS NOT NULL AND longitude IS NOT NULL
  AND latitude BETWEEN -31 AND -26.5
  AND longitude BETWEEN 16 AND 26;

UPDATE public.za_postal_codes SET admin_name1 = 'Free State'
WHERE country_code = 'ZA' AND (admin_name1 IS NULL OR admin_name1 = 'Gauteng')
  AND latitude IS NOT NULL AND longitude IS NOT NULL
  AND latitude BETWEEN -30.5 AND -26.5
  AND longitude BETWEEN 24 AND 30;

UPDATE public.za_postal_codes SET admin_name1 = 'KwaZulu-Natal'
WHERE country_code = 'ZA' AND (admin_name1 IS NULL OR admin_name1 = 'Gauteng')
  AND latitude IS NOT NULL AND longitude IS NOT NULL
  AND latitude BETWEEN -31 AND -26.5
  AND longitude BETWEEN 29 AND 33;

UPDATE public.za_postal_codes SET admin_name1 = 'Mpumalanga'
WHERE country_code = 'ZA' AND (admin_name1 IS NULL OR admin_name1 = 'Gauteng')
  AND latitude IS NOT NULL AND longitude IS NOT NULL
  AND latitude BETWEEN -27 AND -24
  AND longitude BETWEEN 29 AND 32.5;

UPDATE public.za_postal_codes SET admin_name1 = 'Limpopo'
WHERE country_code = 'ZA' AND (admin_name1 IS NULL OR admin_name1 = 'Gauteng')
  AND latitude IS NOT NULL AND longitude IS NOT NULL
  AND latitude BETWEEN -25 AND -22
  AND longitude BETWEEN 27 AND 32;

UPDATE public.za_postal_codes SET admin_name1 = 'North West'
WHERE country_code = 'ZA' AND (admin_name1 IS NULL OR admin_name1 = 'Gauteng')
  AND latitude IS NOT NULL AND longitude IS NOT NULL
  AND latitude BETWEEN -27.5 AND -25
  AND longitude BETWEEN 22 AND 28;

UPDATE public.za_postal_codes SET admin_name1 = 'Gauteng'
WHERE country_code = 'ZA' AND (admin_name1 IS NULL OR admin_name1 = 'Gauteng')
  AND latitude IS NOT NULL AND longitude IS NOT NULL
  AND latitude BETWEEN -26.8 AND -25.5
  AND longitude BETWEEN 27 AND 29;
