-- ================================================================
-- Consolidate panoramic viewer tables into one centralized table
-- Drops: vr_hotspots, vr_regions, vr_sections, vr_scenes, facilities
-- Creates: service_videos (services + their 360° videos)
-- ================================================================

-- 1. Create the centralized service_videos table
CREATE TABLE IF NOT EXISTS public.service_videos (
  id TEXT PRIMARY KEY,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  service_description TEXT NOT NULL,
  service_icon TEXT NOT NULL,
  service_color TEXT NOT NULL,
  service_image_url TEXT,
  title TEXT NOT NULL,
  section_description TEXT,
  details JSONB DEFAULT '[]'::jsonb,
  video_url TEXT,
  thumbnail_url TEXT NOT NULL,
  is_initial BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  hotspots JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- 2. Migrate data from facilities + vr_scenes + vr_sections
INSERT INTO public.service_videos (
  id,
  service_id,
  service_name,
  service_description,
  service_icon,
  service_color,
  service_image_url,
  title,
  section_description,
  details,
  video_url,
  thumbnail_url,
  is_initial,
  display_order,
  hotspots,
  created_at,
  updated_at
)
SELECT
  vs.id,
  f.id AS service_id,
  f.name AS service_name,
  f.description AS service_description,
  f.icon AS service_icon,
  f.color AS service_color,
  f.image_url AS service_image_url,
  vs.title,
  COALESCE(
    (SELECT ss.description FROM public.vr_sections ss
     WHERE ss.vr_scene_id = vs.id AND ss.facility_id = vs.facility_id
     ORDER BY ss.display_order LIMIT 1),
    ''
  ) AS section_description,
  COALESCE(
    (SELECT ss.details FROM public.vr_sections ss
     WHERE ss.vr_scene_id = vs.id AND ss.facility_id = vs.facility_id
     ORDER BY ss.display_order LIMIT 1),
    '[]'::jsonb
  ) AS details,
  NULL AS video_url,
  vs.image_url AS thumbnail_url,
  vs.is_initial_scene AS is_initial,
  COALESCE(
    (SELECT MIN(ss.display_order) FROM public.vr_sections ss
     WHERE ss.vr_scene_id = vs.id AND ss.facility_id = vs.facility_id),
    0
  ) AS display_order,
  '[]'::jsonb AS hotspots,
  vs.created_at,
  vs.updated_at
FROM public.vr_scenes vs
JOIN public.facilities f ON f.id = vs.facility_id;

-- 3. Add innospace service (no vr_scenes in DB, add placeholder)
INSERT INTO public.service_videos (
  id,
  service_id,
  service_name,
  service_description,
  service_icon,
  service_color,
  service_image_url,
  title,
  section_description,
  details,
  video_url,
  thumbnail_url,
  is_initial,
  display_order,
  hotspots,
  created_at,
  updated_at
) VALUES (
  'innospace-main',
  'innospace',
  'INNOSPACE',
  'Collaborative workspace with hot desks, boardroom, project room and meeting lounge. Seven hot desk spaces available for booking.',
  'home',
  '#23A2B8',
  'innospace.png',
  'INNOSPACE',
  'Hot desk spaces and meeting facilities for knowledge-based enterprises.',
  '["Hot desk spaces", "Boardroom", "Project room", "Meeting lounge"]'::jsonb,
  NULL,
  'innospace.png',
  true,
  0,
  '[]'::jsonb,
  timezone('utc', now()),
  timezone('utc', now())
) ON CONFLICT (id) DO NOTHING;

-- 4. Drop panoramic tables (reverse dependency order)
DROP TABLE IF EXISTS public.vr_hotspots CASCADE;
DROP TABLE IF EXISTS public.vr_regions CASCADE;
DROP TABLE IF EXISTS public.vr_sections CASCADE;
DROP TABLE IF EXISTS public.vr_scenes CASCADE;
DROP TABLE IF EXISTS public.facilities CASCADE;

-- 5. Enable RLS
ALTER TABLE public.service_videos ENABLE ROW LEVEL SECURITY;

-- 6. Allow public read (match previous facilities policy)
CREATE POLICY "service_videos_select_policy"
  ON public.service_videos FOR SELECT
  USING (true);
