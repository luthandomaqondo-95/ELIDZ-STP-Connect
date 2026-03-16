import { supabase } from '@/lib/supabase';
import type { Hotspot, Scene } from '@/lib/scenes';

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
  details: string[];
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
  position: { x: number; y: number; z: number };
  target_scene_id: string;
  created_at: string;
}

export interface FacilityWithTour extends Facility {
  scenes: VRScene[];
  sections: VRSection[];
  initialSceneId?: string;
}

interface ServiceVideoRow {
  id: string;
  service_id: string;
  service_name: string;
  service_description: string;
  service_icon: string;
  service_color: string;
  service_image_url: string | null;
  title: string;
  section_description: string | null;
  details: unknown;
  video_url: string | null;
  thumbnail_url: string;
  is_initial: boolean;
  display_order: number;
  hotspots: unknown;
  created_at: string;
  updated_at: string;
}

const TOUR_CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

class FacilitiesService {
  private tourCache = new Map<
    string,
    { data: { facility: FacilityWithTour; scenes: Scene[] }; expires: number }
  >();

  private rowToFacility(row: ServiceVideoRow): Facility {
    return {
      id: row.service_id,
      name: row.service_name,
      type: 'Facility',
      location: row.service_name,
      description: row.service_description,
      image_url: row.service_image_url,
      icon: row.service_icon,
      color: row.service_color,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private rowToVRScene(row: ServiceVideoRow): VRScene {
    const hotspots = Array.isArray(row.hotspots) ? row.hotspots : [];
    return {
      id: row.id,
      facility_id: row.service_id,
      title: row.title,
      image_url: row.thumbnail_url,
      is_initial_scene: row.is_initial,
      regions: [],
      hotspots: hotspots.map((h: { id?: number; text?: string; targetSceneId?: string }) => ({
        id: String(h?.id ?? ''),
        scene_id: row.id,
        text: h?.text ?? '',
        position: { x: 0, y: 0, z: 0 },
        target_scene_id: h?.targetSceneId ?? '',
        created_at: row.created_at,
      })),
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private rowToScene(row: ServiceVideoRow): Scene {
    const hotspotsRaw = Array.isArray(row.hotspots) ? row.hotspots : [];
    const hotspots: Hotspot[] = hotspotsRaw.map((h: Record<string, unknown>) => ({
      id: Number(h?.id ?? 0),
      yaw: Number(h?.yaw ?? 0),
      pitch: Number(h?.pitch ?? 0),
      type: (h?.type as 'info' | 'navigation') ?? 'info',
      text: String(h?.text ?? ''),
      targetSceneId: h?.targetSceneId ? String(h.targetSceneId) : undefined,
      icon: h?.icon ? String(h.icon) : undefined,
    }));
    return {
      id: row.id,
      title: row.title,
      subtitle: `ELIDZ STP — ${row.service_name}`,
      videoUrl: row.video_url ?? '',
      thumbnailColor: row.service_color || '#0B1220',
      hotspots,
      serviceId: row.service_id,
    };
  }

  private rowToVRSection(row: ServiceVideoRow): VRSection {
    const details = Array.isArray(row.details) ? row.details : [];
    return {
      id: row.id,
      facility_id: row.service_id,
      title: row.title,
      description: row.section_description ?? '',
      details: details as string[],
      has_vr: true,
      vr_scene_id: row.id,
      display_order: row.display_order,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  /**
   * Get all facilities (services) - one row per service from facilities
   */
  async getAllFacilities(): Promise<Facility[]> {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .order('service_id', { ascending: true })
      .order('display_order', { ascending: true });

    if (error) {
      console.error('FacilitiesService.getAllFacilities error:', error);
      throw error;
    }

    const rows = (data ?? []) as ServiceVideoRow[];
    const seen = new Set<string>();
    const facilities: Facility[] = [];
    for (const row of rows) {
      if (!seen.has(row.service_id)) {
        seen.add(row.service_id);
        facilities.push(this.rowToFacility(row));
      }
    }
    return facilities.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get facility by ID
   */
  async getFacilityById(id: string): Promise<Facility | null> {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .eq('service_id', id)
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('FacilitiesService.getFacilityById error:', error);
      throw error;
    }

    return this.rowToFacility(data as ServiceVideoRow);
  }

  /**
   * Get all VR scenes (videos) for a facility
   */
  async getScenesByFacilityId(facilityId: string): Promise<VRScene[]> {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .eq('service_id', facilityId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('FacilitiesService.getScenesByFacilityId error:', error);
      throw error;
    }

    return ((data ?? []) as ServiceVideoRow[]).map((r) => this.rowToVRScene(r));
  }

  /**
   * Get all sections (services) for a facility
   */
  async getSectionsByFacilityId(facilityId: string): Promise<VRSection[]> {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .eq('service_id', facilityId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('FacilitiesService.getSectionsByFacilityId error:', error);
      throw error;
    }

    return ((data ?? []) as ServiceVideoRow[]).map((r) => this.rowToVRSection(r));
  }

  /**
   * Get a 360° scene by ID (for Viewer360). Returns null if not found or missing video_url.
   */
  async getSceneById(sceneId: string): Promise<Scene | null> {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .eq('id', sceneId)
      .single();

    if (error || !data) {
      if (error?.code === 'PGRST116') return null;
      console.error('FacilitiesService.getSceneById error:', error);
      return null;
    }

    const row = data as ServiceVideoRow;
    if (!row.video_url) return null;
    return this.rowToScene(row);
  }

  /**
   * Get all explorable 360° scenes for a facility (scene picker).
   * Only returns scenes for the given facility so the picker stays scoped.
   */
  async getScenesForFacilityViewer(facilityId: string): Promise<Scene[]> {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .eq('service_id', facilityId)
      .not('video_url', 'is', null)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('FacilitiesService.getScenesForFacilityViewer error:', error);
      return [];
    }

    return ((data ?? []) as ServiceVideoRow[]).map((r) => this.rowToScene(r));
  }

  /**
   * Get all explorable 360° scenes (any facility with video_url).
   * Used by standalone viewer when no facility context.
   */
  async getScenesForViewer(): Promise<Scene[]> {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .not('video_url', 'is', null)
      .order('service_id', { ascending: true })
      .order('display_order', { ascending: true });

    if (error) {
      console.error('FacilitiesService.getScenesForViewer error:', error);
      return [];
    }

    return ((data ?? []) as ServiceVideoRow[]).map((r) => this.rowToScene(r));
  }

  /**
   * Get initial scene ID for a facility. Fetches from facilities where
   * service_id = facilityId and is_initial = true.
   */
  async getInitialSceneIdForFacility(facilityId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('facilities')
      .select('id')
      .eq('service_id', facilityId)
      .eq('is_initial', true)
      .not('video_url', 'is', null)
      .order('display_order', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return (data as { id: string }).id;
  }

  /**
   * Get complete facility with VR tour data in a single query.
   * Optimized to minimize round trips for faster loading.
   */
  async getFacilityWithTour(facilityId: string): Promise<FacilityWithTour | null> {
    const { data, error } = await supabase
      .from('facilities')
      .select('id, service_id, service_name, service_description, service_icon, service_color, service_image_url, title, section_description, details, video_url, thumbnail_url, is_initial, display_order, hotspots, created_at, updated_at')
      .eq('service_id', facilityId)
      .order('display_order', { ascending: true });

    if (error || !data?.length) {
      if (error) console.error('FacilitiesService.getFacilityWithTour error:', error);
      return null;
    }

    const rows = data as ServiceVideoRow[];
    const first = rows[0];
    const facility = this.rowToFacility(first);
    const scenes = rows.map((r) => this.rowToVRScene(r));
    const sections = rows.map((r) => this.rowToVRSection(r));
    const initialScene = scenes.find((s) => s.is_initial_scene);

    return {
      ...facility,
      scenes,
      sections,
      initialSceneId: initialScene?.id,
    };
  }

  /**
   * Get facility tour data with Scene[] for the viewer in one query.
   * Cached for 2 min to speed up back-navigation.
   */
  async getFacilityTourWithScenes(facilityId: string): Promise<{
    facility: FacilityWithTour | null;
    scenes: Scene[];
  }> {
    const cached = this.tourCache.get(facilityId);
    if (cached && Date.now() < cached.expires) {
      return cached.data;
    }

    const { data, error } = await supabase
      .from('facilities')
      .select('id, service_id, service_name, service_description, service_icon, service_color, service_image_url, title, section_description, details, video_url, thumbnail_url, is_initial, display_order, hotspots, created_at, updated_at')
      .eq('service_id', facilityId)
      .order('display_order', { ascending: true });

    if (error || !data?.length) {
      if (error) console.error('FacilitiesService.getFacilityTourWithScenes error:', error);
      return { facility: null, scenes: [] };
    }

    const rows = data as ServiceVideoRow[];
    const first = rows[0];
    const facility = this.rowToFacility(first);
    const scenes = rows.map((r) => this.rowToVRScene(r));
    const sections = rows.map((r) => this.rowToVRSection(r));
    const initialScene = scenes.find((s) => s.is_initial_scene);
    const facilityWithTour: FacilityWithTour = {
      ...facility,
      scenes,
      sections,
      initialSceneId: initialScene?.id,
    };
    const viewerScenes = rows
      .filter((r) => r.video_url)
      .map((r) => this.rowToScene(r));

    const result = { facility: facilityWithTour, scenes: viewerScenes };
    if (facilityWithTour) {
      this.tourCache.set(facilityId, {
        data: result,
        expires: Date.now() + TOUR_CACHE_TTL_MS,
      });
    }
    return result;
  }

  /**
   * Resolve facility card image. Uses DB URL when available, or local assets.
   */
  getFacilityCardImage(imageUrl?: string | null): { uri: string } | number | null {
    if (!imageUrl?.trim()) return null;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return { uri: imageUrl };
    }
    const key = imageUrl.split('/').pop()?.toLowerCase() ?? '';
    const localMap: Record<string, number> = {
      'design-centre.png': require('../../assets/images/design-centre.png'),
      'innospace.png': require('../../assets/images/innospace.png'),
      'analytical-lab.png': require('../../assets/images/tenants/analytical-lab.png'),
      'renewable-energy.png': require('../../assets/images/renewable-energy.png'),
      'connect-solve.png': require('../../assets/images/connect-solve.png'),
    };
    return localMap[key] ?? null;
  }
}

export const facilitiesService = new FacilitiesService();
