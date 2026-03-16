-- Add Laser Cutting to Design Centre (from ELIDZ STP website: 3D Printing, Laser Cutting, CNC)
-- Make all facility scenes explorable via scene picker (getScenesForViewer returns all with video_url)
-- Add navigation hotspots between Design Centre and Digital Hub sub-facilities

INSERT INTO public.facilities (
  id, service_id, service_name, service_description, service_icon, service_color,
  service_image_url, title, section_description, details, video_url, thumbnail_url,
  is_initial, display_order, hotspots, created_at, updated_at
)
SELECT
  'laser-cutting', 'design-centre', service_name, service_description, service_icon, service_color,
  service_image_url, 'Laser Cutting and Engraving',
  'Laser cutting and engraving for wood, acrylic, plastics and metals. From single items to large production runs.',
  '["Laser cutting", "Laser engraving", "Wood, acrylic, plastics, metals"]'::jsonb,
  video_url, thumbnail_url, false, 1,
  '[{"id":1,"yaw":0,"pitch":-8,"type":"info","text":"The laser cutter/engraver allows for intricate detail on wood, acrylic, plastics and metals.","icon":"info"},{"id":2,"yaw":-60,"pitch":0,"type":"navigation","text":"CAD and 3D Printing","targetSceneId":"cad-3d-printing","icon":"arrow-right"},{"id":3,"yaw":90,"pitch":0,"type":"navigation","text":"CNC Milling","targetSceneId":"cnc-milling","icon":"arrow-right"}]'::jsonb,
  timezone('utc', now()), timezone('utc', now())
FROM public.facilities WHERE id = 'cad-3d-printing'
ON CONFLICT (id) DO NOTHING;

-- Fix display_order for Design Centre
UPDATE public.facilities SET display_order = 0 WHERE id = 'cad-3d-printing';
UPDATE public.facilities SET display_order = 1 WHERE id = 'laser-cutting';
UPDATE public.facilities SET display_order = 2 WHERE id = 'cnc-milling';

-- Add navigation between Design Centre scenes (CAD <-> Laser <-> CNC)
UPDATE public.facilities SET hotspots = '[
  {"id":1,"yaw":30,"pitch":-6,"type":"info","text":"The ELIDZ STP Design Centre assists entrepreneurs in rapid prototyping. Services include laser cutting, 3D printing, and CNC milling.","icon":"info"},
  {"id":2,"yaw":-70,"pitch":0,"type":"navigation","text":"Laser Cutting","targetSceneId":"laser-cutting","icon":"arrow-right"},
  {"id":3,"yaw":120,"pitch":-2,"type":"navigation","text":"CNC Milling","targetSceneId":"cnc-milling","icon":"arrow-right"},
  {"id":4,"yaw":-120,"pitch":0,"type":"navigation","text":"Digital Hub","targetSceneId":"broadcasting","icon":"arrow-right"},
  {"id":5,"yaw":60,"pitch":-1,"type":"navigation","text":"Renewable Energy Centre","targetSceneId":"main-facility","icon":"arrow-right"}
]'::jsonb WHERE id = 'cad-3d-printing';

UPDATE public.facilities SET hotspots = '[
  {"id":1,"yaw":0,"pitch":-8,"type":"info","text":"CNC lathe machines shape metal and solid materials. The centre has expertise to assist in creating the perfect final product.","icon":"info"},
  {"id":2,"yaw":-90,"pitch":0,"type":"navigation","text":"CAD and 3D Printing","targetSceneId":"cad-3d-printing","icon":"arrow-right"},
  {"id":3,"yaw":60,"pitch":0,"type":"navigation","text":"Laser Cutting","targetSceneId":"laser-cutting","icon":"arrow-right"}
]'::jsonb WHERE id = 'cnc-milling';
