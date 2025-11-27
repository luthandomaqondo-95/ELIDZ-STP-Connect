import { supabase } from '@/lib/supabase';

export interface Facility {
    id: string;
    name: string;
    type: string;
    location: string;
    description: string;
    image_url: string | null;
    icon: string;
    color: string;
    created_at: string;
    updated_at: string;
}

export interface VRScene {
    id: string;
    facility_id: string;
    title: string;
    image_url: string;
    is_initial_scene: boolean;
    regions?: VRRegion[];
    hotspots?: VRHotspot[];
    created_at: string;
    updated_at: string;
}

export interface VRSection {
    id: string;
    facility_id: string;
    title: string;
    description: string;
    details: string[]; // Parsed from JSONB
    has_vr: boolean;
    vr_scene_id: string | null;
    display_order: number;
    created_at: string;
    updated_at: string;
}

export interface VRRegion {
    id: string;
    scene_id: string;
    name: string;
    angle: number;
    width: number;
    created_at: string;
}

export interface VRHotspot {
    id: string;
    scene_id: string;
    text: string;
    position: {
        x: number;
        y: number;
        z: number;
    };
    target_scene_id: string;
    created_at: string;
}

export interface FacilityWithTour extends Facility {
    scenes: VRScene[];
    sections: VRSection[];
    initialSceneId?: string;
}

class FacilitiesService {
    /**
     * Get all facilities
     */
    async getAllFacilities(): Promise<Facility[]> {
        const { data, error } = await supabase
            .from('facilities')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error('FacilitiesService.getAllFacilities error:', error);
            throw error;
        }

        return data as Facility[];
    }

    /**
     * Get facility by ID
     */
    async getFacilityById(id: string): Promise<Facility | null> {
        const { data, error } = await supabase
            .from('facilities')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            console.error('FacilitiesService.getFacilityById error:', error);
            throw error;
        }

        return data as Facility;
    }

    /**
     * Get all VR scenes for a facility
     */
    async getScenesByFacilityId(facilityId: string): Promise<VRScene[]> {
        const { data, error } = await supabase
            .from('vr_scenes')
            .select('*')
            .eq('facility_id', facilityId);

        if (error) {
            console.error('FacilitiesService.getScenesByFacilityId error:', error);
            throw error;
        }

        // Fetch regions and hotspots for each scene
        const scenes = data as VRScene[];
        const scenesWithDetails = await Promise.all(
            scenes.map(async (scene) => {
                const [regions, hotspots] = await Promise.all([
                    this.getRegionsBySceneId(scene.id),
                    this.getHotspotsBySceneId(scene.id)
                ]);

                return {
                    ...scene,
                    regions,
                    hotspots: hotspots.map(h => ({
                        ...h,
                        position: {
                            x: Number(h.position.x),
                            y: Number(h.position.y),
                            z: Number(h.position.z)
                        }
                    }))
                };
            })
        );

        return scenesWithDetails;
    }

    /**
     * Get all sections (services) for a facility
     */
    async getSectionsByFacilityId(facilityId: string): Promise<VRSection[]> {
        const { data, error } = await supabase
            .from('vr_sections')
            .select('*')
            .eq('facility_id', facilityId)
            .order('display_order', { ascending: true });

        if (error) {
            console.error('FacilitiesService.getSectionsByFacilityId error:', error);
            throw error;
        }

        return (data as any[]).map(section => ({
            ...section,
            details: Array.isArray(section.details) ? section.details : []
        })) as VRSection[];
    }

    /**
     * Get regions for a scene
     */
    async getRegionsBySceneId(sceneId: string): Promise<VRRegion[]> {
        const { data, error } = await supabase
            .from('vr_regions')
            .select('*')
            .eq('scene_id', sceneId);

        if (error) {
            console.error('FacilitiesService.getRegionsBySceneId error:', error);
            return [];
        }

        return data as VRRegion[];
    }

    /**
     * Get hotspots for a scene
     */
    async getHotspotsBySceneId(sceneId: string): Promise<VRHotspot[]> {
        const { data, error } = await supabase
            .from('vr_hotspots')
            .select('*')
            .eq('scene_id', sceneId);

        if (error) {
            console.error('FacilitiesService.getHotspotsBySceneId error:', error);
            return [];
        }

        return (data as any[]).map(hotspot => ({
            ...hotspot,
            position: {
                x: hotspot.position_x,
                y: hotspot.position_y,
                z: hotspot.position_z
            }
        })) as VRHotspot[];
    }

    /**
     * Get complete facility with VR tour data
     */
    async getFacilityWithTour(facilityId: string): Promise<FacilityWithTour | null> {
        const facility = await this.getFacilityById(facilityId);
        if (!facility) return null;

        const [scenes, sections] = await Promise.all([
            this.getScenesByFacilityId(facilityId),
            this.getSectionsByFacilityId(facilityId)
        ]);

        const initialScene = scenes.find(s => s.is_initial_scene);

        return {
            ...facility,
            scenes,
            sections,
            initialSceneId: initialScene?.id
        };
    }

    /**
     * Get image URL for a 360 tour image
     * Static mapping required for React Native bundler
     */
    getImageUrl(imageFileName: string, facilityId: string): any {
        // Static mapping of all 360 images (required by Metro bundler)
        const imageMap: Record<string, any> = {
            // Analytical Laboratory
            'analyticlaboratory.jpeg': require('../../assets/videos/360-tours/analytical-laboratory/analyticlaboratory.jpeg'),
            
            // Design Centre
            'cadand3dprinting.jpeg': require('../../assets/videos/360-tours/design-centre/cadand3dprinting.jpeg'),
            'cncmilling.jpeg': require('../../assets/videos/360-tours/design-centre/cncmilling.jpeg'),
            
            // Digital Hub - Auditorium
            'auditorium.jpeg': require('../../assets/videos/360-tours/digital-hub/auditorium/auditorium.jpeg'),
            
            // Digital Hub - Broadcasting
            'broadcastingandvideography.jpeg': require('../../assets/videos/360-tours/digital-hub/broadcasting-studio/broadcastingandvideography.jpeg'),
            
            // Digital Hub - Digital Units
            'digitalunits.jpeg': require('../../assets/videos/360-tours/digital-hub/digital-units/digitalunits.jpeg'),
            
            // Automotive Incubator
            'sharedancilary.jpeg': require('../../assets/videos/360-tours/automotive-incubator/shared-ancillary-services/sharedancilary.jpeg'),
            
            // Renewable Energy
            'renewableenergy.jpeg': require('../../assets/videos/360-tours/renewable-energy/renewableenergy.jpeg'),
        };

        const image = imageMap[imageFileName];
        
        if (!image) {
            console.error(`Image not found in static map: ${imageFileName}`);
            return null;
        }

        return image;
    }
}

export const facilitiesService = new FacilitiesService();

