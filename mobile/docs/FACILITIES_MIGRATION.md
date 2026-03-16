# Facilities & VR Tours Database Migration

## Overview
This migration moves all hardcoded facility and VR tour data from the codebase into the Supabase database, enabling dynamic content management.

## Database Tables Created

### 1. **facilities**
Main facilities/buildings table
- `id` (TEXT) - Primary key (e.g., 'food-water', 'design-centre')
- `name` - Facility name
- `type` - Facility type
- `location` - Physical location
- `description` - Facility description
- `image_url` - Image filename
- `icon` - Feather icon name
- `color` - Hex color code
- Timestamps

### 2. **vr_scenes**
360-degree tour scenes
- `id` (TEXT) - Scene identifier (e.g., 'main-lab')
- `facility_id` - Foreign key to facilities
- `title` - Scene title
- `image_url` - 360 image filename
- `is_initial_scene` - Boolean for starting scene
- Timestamps

### 3. **vr_sections**
Services/areas within facilities
- `id` (UUID) - Primary key
- `facility_id` - Foreign key to facilities
- `title` - Section/service name
- `description` - Service description
- `details` (JSONB) - Array of detail strings
- `has_vr` - Boolean for VR availability
- `vr_scene_id` - Foreign key to vr_scenes
- `display_order` - Integer for sorting
- Timestamps

### 4. **vr_regions**
Labeled areas within 360 scenes
- `id` (UUID) - Primary key
- `scene_id` - Foreign key to vr_scenes
- `name` - Region name
- `angle` - Rotation angle in degrees
- `width` - Width in degrees

### 5. **vr_hotspots**
Navigation points between scenes
- `id` (UUID) - Primary key
- `scene_id` - Foreign key to vr_scenes
- `text` - Hotspot label
- `position_x`, `position_y`, `position_z` - 3D position
- `target_scene_id` - Foreign key to target scene

## Migration Steps

### Step 1: Run Schema Migration
```sql
-- Run the entire schema.sql file in Supabase SQL Editor
-- This will create all necessary tables with indexes and triggers
```

### Step 2: Seed Data
```sql
-- Run seed_facilities.sql in Supabase SQL Editor
-- This will populate:
-- - 5 Facilities
-- - 9 VR Scenes
-- - 13 VR Sections (Services)
-- - All VR Regions
```

## Data Migrated

### Facilities (5 total):
1. **Analytical Laboratory** (food-water)
   - Color: #0066CC
   - Icon: droplet
   - 1 VR Scene, 2 Services

2. **Design Centre** (design-centre)
   - Color: #FF6600
   - Icon: pen-tool
   - 2 VR Scenes, 2 Services

3. **Digital Hub** (digital-hub)
   - Color: #28A745
   - Icon: monitor
   - 3 VR Scenes, 3 Services

4. **Automotive & Manufacturing Incubator** (automotive-incubator)
   - Color: #6F42C1
   - Icon: settings
   - 1 VR Scene, 2 Services

5. **Renewable Energy Centre** (renewable-energy)
   - Color: #E83E8C
   - Icon: zap
   - 1 VR Scene, 1 Service

### 360 Tour Images (9 total):
All images are stored in `mobile/assets/videos/360-tours/` and referenced in the database:

- Analytical Laboratory: `analyticlaboratory.jpeg`
- Design Centre: `cadand3dprinting.jpeg`, `cncmilling.jpeg`
- Digital Hub: `auditorium.jpeg`, `broadcastingandvideography.jpeg`, `digitalunits.jpeg`
- Automotive Incubator: `sharedancilary.jpeg`
- Renewable Energy: `renewableenergy.jpeg`

## New Service Layer

### `facilitiesService` Methods:

```typescript
// Get all facilities
await facilitiesService.getAllFacilities();

// Get single facility
await facilitiesService.getFacilityById('food-water');

// Get facility with complete tour data
await facilitiesService.getFacilityWithTour('digital-hub');

// Get scenes for a facility
await facilitiesService.getScenesByFacilityId('design-centre');

// Get sections (services) for a facility
await facilitiesService.getSectionsByFacilityId('renewable-energy');

// Get image URL (converts filename to require() path)
facilitiesService.getImageUrl('analyticlaboratory.jpeg', 'food-water');
```

## UI Updates

The `services.tsx` screen now:
- ✅ Fetches facilities from database on mount
- ✅ Loads facility tour data dynamically
- ✅ Shows loading states
- ✅ Uses database field names (`has_vr`, `target_scene_id`, etc.)
- ✅ Resolves 360 image paths automatically

## Image Path Resolution

The service automatically resolves image paths:
```typescript
// Database stores: "analyticlaboratory.jpeg"
// Service returns: require('../../assets/videos/360-tours/analytical-laboratory/analyticlaboratory.jpeg')
```

## Testing

### 1. Test Facility List
```
1. Navigate to Services tab
2. Should see 5 facilities
3. Each should have icon, name, description, location
```

### 2. Test Facility Detail
```
1. Click any facility
2. Should see facility header with icon and name
3. Should see list of services
4. Services with VR should have eye icon
```

### 3. Test VR Tour
```
1. Click service with VR icon
2. Should load 360-degree image
3. Should show scene title
4. Can toggle between panorama and sections view
```

### 4. Test Database Query
```sql
-- Verify all data is loaded
SELECT COUNT(*) FROM facilities; -- Should be 5
SELECT COUNT(*) FROM vr_scenes; -- Should be 9
SELECT COUNT(*) FROM vr_sections; -- Should be 13
SELECT COUNT(*) FROM vr_regions; -- Should be ~30
```

## Benefits

### Before (Hardcoded):
- ❌ Data scattered across multiple files
- ❌ Requires code deploy to update content
- ❌ No admin interface
- ❌ Difficult to maintain

### After (Database):
- ✅ Centralized data management
- ✅ Update content without code changes
- ✅ Ready for admin panel
- ✅ Easy to extend

## Future Enhancements

### Admin Panel (Recommended):
```typescript
// Create, update, delete facilities
await facilitiesService.createFacility(data);
await facilitiesService.updateFacility(id, data);
await facilitiesService.deleteFacility(id);

// Upload 360 images to Supabase Storage
await supabase.storage.from('vr-tours').upload(path, file);

// Manage scenes and hotspots
await facilitiesService.createScene(data);
await facilitiesService.createHotspot(data);
```

### Content Management:
- Add/edit facilities without touching code
- Upload new 360 images
- Reorder services
- Enable/disable VR tours
- Track view analytics

## Troubleshooting

### Images not loading:
- Check image paths in `getImageUrl()` method
- Verify images exist in assets folder
- Check console for require() errors

### Data not showing:
- Verify schema.sql ran successfully
- Verify seed_facilities.sql ran successfully
- Check Supabase logs for errors
- Verify RLS policies (should be public read for now)

### Scenes not connecting:
- Check hotspot `target_scene_id` matches actual scene ID
- Verify scenes belong to same facility

## Rollback

If needed, you can revert to hardcoded data:
```typescript
// In services.tsx, change imports back to:
import { FACILITIES, getVRTourDataById } from '@/data/vrToursData';

// Remove facilitiesService calls
// Use old FACILITIES constant
```

## Database Backup

Before running migrations:
```sql
-- Backup existing data (if any)
CREATE TABLE facilities_backup AS SELECT * FROM facilities;
CREATE TABLE vr_scenes_backup AS SELECT * FROM vr_scenes;
```

---

## Summary Checklist

- [ ] Run `schema.sql` in Supabase SQL Editor
- [ ] Run `seed_facilities.sql` in Supabase SQL Editor
- [ ] Verify 5 facilities created
- [ ] Verify 9 VR scenes created
- [ ] Test Services tab in app
- [ ] Test clicking into a facility
- [ ] Test opening a VR tour
- [ ] Verify images load correctly

**Total Migration Time**: ~5 minutes
**Data Volume**: 5 facilities, 9 scenes, 13 sections, ~30 regions

