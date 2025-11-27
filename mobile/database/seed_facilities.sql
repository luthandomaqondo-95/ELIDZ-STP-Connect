-- ================================================================
-- SEED DATA FOR FACILITIES AND VR TOURS
-- ================================================================

-- Note: Run this after running schema.sql

-- Insert Facilities
INSERT INTO public.facilities (id, name, type, location, description, image_url, icon, color) VALUES
('food-water', 'Analytical Laboratory', 'Facility', 'Analytical Laboratory', 'Advanced testing facilities, including Food & Water Testing and Technology Labs', 'connect-solve.png', 'droplet', '#0066CC'),
('design-centre', 'Design Centre', 'Facility', 'Design Centre', 'Innovation hub for product design and prototyping', 'design-centre.png', 'pen-tool', '#FF6600'),
('digital-hub', 'Digital Hub', 'Facility', 'Digital Hub', 'Technology acceleration and digital transformation center', 'innospace.png', 'monitor', '#28A745'),
('automotive-incubator', 'Automotive & Manufacturing Incubator', 'Facility', 'Incubators', 'Advanced manufacturing and automotive innovation incubator', 'renewable-energy.png', 'settings', '#6F42C1'),
('renewable-energy', 'Renewable Energy Centre', 'Facility', 'Renewable Energy Centre', 'Clean energy solutions and sustainability projects', 'renewable-energy.png', 'zap', '#E83E8C')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  location = EXCLUDED.location,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  updated_at = NOW();

-- ================================================================
-- ANALYTICAL LABORATORY (food-water)
-- ================================================================

-- Insert VR Scenes
INSERT INTO public.vr_scenes (id, facility_id, title, image_url, is_initial_scene) VALUES
('main-lab', 'food-water', 'Analytical Laboratory', 'analyticlaboratory.jpeg', true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  image_url = EXCLUDED.image_url,
  is_initial_scene = EXCLUDED.is_initial_scene,
  updated_at = NOW();

-- Insert VR Regions for main-lab
INSERT INTO public.vr_regions (scene_id, name, angle, width) VALUES
('main-lab', 'Lab Benches', 0, 90),
('main-lab', 'Testing Equipment', 120, 60),
('main-lab', 'Sample Storage', 240, 60);

-- Insert VR Sections (Services)
INSERT INTO public.vr_sections (facility_id, title, description, details, has_vr, vr_scene_id, display_order) VALUES
('food-water', 'Analytical Services', 'Full-service analytical testing laboratory with SANAS accreditation.', 
  '["Sample intake and documentation", "Microbiology testing", "Chemical analysis", "Water quality testing", "Food safety testing", "Environmental testing"]'::jsonb,
  true, 'main-lab', 1),
('food-water', 'Food & Technology Lab', 'Specialized food and water technology services.', 
  '["Advanced food safety analysis", "Water purification testing", "Technology development"]'::jsonb,
  true, 'main-lab', 2);

-- ================================================================
-- DESIGN CENTRE
-- ================================================================

-- Insert VR Scenes
INSERT INTO public.vr_scenes (id, facility_id, title, image_url, is_initial_scene) VALUES
('cad-3d-printing', 'design-centre', 'CAD and 3D Printing', 'cadand3dprinting.jpeg', true),
('cnc-milling', 'design-centre', 'CNC Milling', 'cncmilling.jpeg', false)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  image_url = EXCLUDED.image_url,
  is_initial_scene = EXCLUDED.is_initial_scene,
  updated_at = NOW();

-- Insert VR Regions for cad-3d-printing
INSERT INTO public.vr_regions (scene_id, name, angle, width) VALUES
('cad-3d-printing', '3D Printers', 0, 60),
('cad-3d-printing', 'CAD Workstations', 90, 60),
('cad-3d-printing', 'Entrance', 180, 60),
('cad-3d-printing', 'Material Storage', 270, 60);

-- Insert VR Regions for cnc-milling
INSERT INTO public.vr_regions (scene_id, name, angle, width) VALUES
('cnc-milling', 'CNC Machine', 30, 80),
('cnc-milling', 'Control Panel', 0, 40),
('cnc-milling', 'Tool Storage', 200, 60),
('cnc-milling', 'Material Area', 300, 60);

-- Insert VR Sections (Services)
INSERT INTO public.vr_sections (facility_id, title, description, details, has_vr, vr_scene_id, display_order) VALUES
('design-centre', 'CAD and 3D Printing', 'Professional design and rapid prototyping.', 
  '["CAD workstations", "3D printers", "Design software"]'::jsonb,
  true, 'cad-3d-printing', 1),
('design-centre', 'CNC Milling', 'Precision machining and fabrication.', 
  '["CNC mills", "Precision tools", "Material processing"]'::jsonb,
  true, 'cnc-milling', 2);

-- ================================================================
-- DIGITAL HUB
-- ================================================================

-- Insert VR Scenes
INSERT INTO public.vr_scenes (id, facility_id, title, image_url, is_initial_scene) VALUES
('broadcasting', 'digital-hub', 'Broadcasting and Videography', 'broadcastingandvideography.jpeg', true),
('auditorium', 'digital-hub', 'Auditorium', 'auditorium.jpeg', false),
('digital-units', 'digital-hub', 'Digital Units', 'digitalunits.jpeg', false)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  image_url = EXCLUDED.image_url,
  is_initial_scene = EXCLUDED.is_initial_scene,
  updated_at = NOW();

-- Insert VR Regions for broadcasting
INSERT INTO public.vr_regions (scene_id, name, angle, width) VALUES
('broadcasting', 'Podcast Station', 0, 70),
('broadcasting', 'Studio Lighting', 90, 60),
('broadcasting', 'Camera Equipment', 180, 60),
('broadcasting', 'Backdrop Area', 270, 80);

-- Insert VR Regions for auditorium
INSERT INTO public.vr_regions (scene_id, name, angle, width) VALUES
('auditorium', 'Seating Area', 0, 120),
('auditorium', 'Presentation Stage', 180, 60),
('auditorium', 'Projection Screen', 180, 40),
('auditorium', 'Main Entrance', 270, 40);

-- Insert VR Regions for digital-units
INSERT INTO public.vr_regions (scene_id, name, angle, width) VALUES
('digital-units', 'Tech Workstations', 0, 100),
('digital-units', 'Meeting Area', 120, 60),
('digital-units', 'Relaxation Zone', 240, 60);

-- Insert VR Sections (Services)
INSERT INTO public.vr_sections (facility_id, title, description, details, has_vr, vr_scene_id, display_order) VALUES
('digital-hub', 'Auditorium', 'Professional presentation and event space.', 
  '["Stage lighting", "Sound system", "Seating for 100+"]'::jsonb,
  true, 'auditorium', 1),
('digital-hub', 'Broadcasting and Videography', 'Complete video production studio.', 
  '["HD cameras", "Lighting equipment", "Editing software"]'::jsonb,
  true, 'broadcasting', 2),
('digital-hub', 'Digital Units', 'Technology development and innovation spaces.', 
  '["Co-working areas", "Tech labs", "Innovation hubs"]'::jsonb,
  true, 'digital-units', 3);

-- ================================================================
-- AUTOMOTIVE & MANUFACTURING INCUBATOR
-- ================================================================

-- Insert VR Scenes
INSERT INTO public.vr_scenes (id, facility_id, title, image_url, is_initial_scene) VALUES
('ancillary-services', 'automotive-incubator', 'Shared Ancillary Services', 'sharedancilary.jpeg', true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  image_url = EXCLUDED.image_url,
  is_initial_scene = EXCLUDED.is_initial_scene,
  updated_at = NOW();

-- Insert VR Regions for ancillary-services
INSERT INTO public.vr_regions (scene_id, name, angle, width) VALUES
('ancillary-services', 'Meeting Space', 0, 100),
('ancillary-services', 'Office Cubicles', 120, 80),
('ancillary-services', 'Lounge Area', 240, 60);

-- Insert VR Sections (Services)
INSERT INTO public.vr_sections (facility_id, title, description, details, has_vr, vr_scene_id, display_order) VALUES
('automotive-incubator', 'Industrial Incubation Unit', 'Dedicated manufacturing space for automotive startups.', 
  '["Advanced manufacturing equipment", "Prototyping facilities", "Testing and validation labs"]'::jsonb,
  false, NULL, 1),
('automotive-incubator', 'Shared Ancillary Services', 'Common facilities supporting all incubator tenants.', 
  '["Meeting rooms", "Conference facilities", "Business support services"]'::jsonb,
  true, 'ancillary-services', 2);

-- ================================================================
-- RENEWABLE ENERGY CENTRE
-- ================================================================

-- Insert VR Scenes
INSERT INTO public.vr_scenes (id, facility_id, title, image_url, is_initial_scene) VALUES
('main-facility', 'renewable-energy', 'Renewable Energy Centre', 'renewableenergy.jpeg', true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  image_url = EXCLUDED.image_url,
  is_initial_scene = EXCLUDED.is_initial_scene,
  updated_at = NOW();

-- Insert VR Regions for main-facility
INSERT INTO public.vr_regions (scene_id, name, angle, width) VALUES
('main-facility', 'Training Workstations', 0, 100),
('main-facility', 'Electrical Panels', 90, 60),
('main-facility', 'Control Systems', 270, 60),
('main-facility', 'Equipment Storage', 180, 60);

-- Insert VR Sections (Services)
INSERT INTO public.vr_sections (facility_id, title, description, details, has_vr, vr_scene_id, display_order) VALUES
('renewable-energy', 'Complete Renewable Energy Services', 'Full-service clean energy and sustainability center.', 
  '["Solar panel testing", "Wind energy testing", "Battery storage solutions", "Energy efficiency research", "Sustainable technology development"]'::jsonb,
  true, 'main-facility', 1);

-- ================================================================
-- SUMMARY
-- ================================================================
-- Total Facilities: 5
-- Total VR Scenes: 9
-- Total VR Sections (Services): 13
-- All 360-degree tour images are referenced and stored in the database

