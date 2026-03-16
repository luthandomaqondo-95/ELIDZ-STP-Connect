export interface Hotspot {
  id: number;
  yaw: number;
  pitch: number;
  type: "info" | "navigation";
  text?: string;
  targetSceneId?: string;
  icon?: string;
}

export interface Scene {
  id: string;
  title: string;
  subtitle: string;
  videoUrl: string;
  thumbnailColor: string;
  hotspots: Hotspot[];
  /** Facility/service this scene belongs to (for scoping scene picker). */
  serviceId?: string;
}
