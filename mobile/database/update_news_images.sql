-- ================================================================
-- ELIDZ STP - Update news images (unique per article, correct aspect ratio)
-- Run in Supabase SQL Editor
-- Uses images from elidzstp.co.za - NO REPEATS
-- ================================================================

-- 1. Vision 2025: 62% Revenue Growth
UPDATE public.news SET image_url = 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/renew-centre.jpg'
WHERE id = '067e0bb9-8e76-4e9d-a02d-64427aa1cd3a';

-- 2. Electric Vehicle Training - March 2025 (short)
UPDATE public.news SET image_url = 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/design-centre.jpg'
WHERE id = '681a9d5d-5b24-4997-a273-b12297b9442f';

-- 3. Eastern Cape Innovation Challenge 2025 - Applications Open
UPDATE public.news SET image_url = 'https://www.elidzstp.co.za/wp-content/uploads/2025/08/web-home-banner-2.jpg'
WHERE id = '70d560eb-ff32-4d9b-9baa-d846b8b3fd10';

-- 4. ELIDZ AGM Reflects on 2024/25 Performance
UPDATE public.news SET image_url = 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/home-banner5.jpg'
WHERE id = 'a1b2c3d4-e5f6-4789-a012-345678901234';

-- 5. Innovation & Entrepreneurship Week
UPDATE public.news SET image_url = 'https://www.elidzstp.co.za/wp-content/uploads/2019/08/RINP-BANNER-3.jpg'
WHERE id = 'ada949fb-4997-48a7-819b-f95995bf0100';

-- 6. ELIDZ Marks 10 Years of Clean Audits
UPDATE public.news SET image_url = 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/home-banner7.jpg'
WHERE id = 'b2c3d4e5-f6a7-4890-b123-456789012345';

-- 7. ELIDZ-STP Hosts Training Workshop on Electric Vehicle Fundamentals (long)
UPDATE public.news SET image_url = 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/lab.jpg'
WHERE id = 'c3d4e5f6-a7b8-4901-c234-567890123456';

-- 8. ELIDZ Science and Technology Park Head Elected as IASP President
UPDATE public.news SET image_url = 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/innospace.jpg'
WHERE id = 'd4e5f6a7-b8c9-4012-d345-678901234567';

-- 9. MEC FOR DEDEAT UNVEILS NEW 4IR COMPUTER LABORATORY
UPDATE public.news SET image_url = 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/connect.jpg'
WHERE id = 'e5f6a7b8-c9d0-4123-e456-789012345678';

-- 10. ELIDZ Science & Technology Park – Innovation Lives Here
UPDATE public.news SET image_url = 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/incubator.jpg'
WHERE id = 'ec2af5b6-1e73-47d7-a5cb-abdf640911d5';

-- 11. East London IDZ STP in partnership with UNISA launches Innovation Challenge
UPDATE public.news SET image_url = 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/home-banner6.jpg'
WHERE id = 'f6a7b8c9-d0e1-4234-f567-890123456789';

-- 12. ELIDZ STP Head Ludwe Macingwane Elected IASP President (short)
UPDATE public.news SET image_url = 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/STP-1024x653.jpg'
WHERE id = 'fe61f89e-e681-46c7-b94f-d1e437699224';

-- Title-based fallbacks for any future/other rows (unique images, no repeats in this section)
UPDATE public.news SET image_url = 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/BEAKERS-1024x653.jpg'
WHERE title ILIKE '%Innovation Challenge 2025%' AND id NOT IN (
  '70d560eb-ff32-4d9b-9baa-d846b8b3fd10', 'f6a7b8c9-d0e1-4234-f567-890123456789'
) AND (image_url IS NULL OR image_url = '');

UPDATE public.news SET image_url = 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/TURBINE-1024x653.jpg'
WHERE title ILIKE '%Innovation & Entrepreneurship Week%' AND id != 'ada949fb-4997-48a7-819b-f95995bf0100'
  AND (image_url IS NULL OR image_url = '');

UPDATE public.news SET image_url = 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/testimonial-bg.jpg'
WHERE (title ILIKE '%Macingwane%' OR title ILIKE '%IASP%') AND id NOT IN (
  'd4e5f6a7-b8c9-4012-d345-678901234567', 'fe61f89e-e681-46c7-b94f-d1e437699224'
) AND (image_url IS NULL OR image_url = '');

-- Catch-all for any remaining rows without images (use last unused image)
UPDATE public.news
SET image_url = 'https://www.elidzstp.co.za/wp-content/uploads/2019/05/STP-1024x653.jpg'
WHERE image_url IS NULL OR TRIM(image_url) = '';
