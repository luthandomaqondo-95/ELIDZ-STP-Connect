/**
 * ViroReact 360° video viewer.
 *
 * Gyroscope is AUTOMATIC — ViroVRSceneNavigator uses the device's native
 * rotation-vector sensor. No expo-sensors, no DeviceOrientationEvent, no
 * manual quaternion math required.
 *
 * vrModeEnabled={false} = "magic window" mode: single-screen, phone acts
 * as a window into the 360° world. The scene rotates as you physically
 * move the device.
 */
import React, { useEffect, useRef } from 'react';
import { NativeSyntheticEvent, StyleSheet } from 'react-native';
import {
  ViroVRSceneNavigator,
  ViroScene,
  Viro360Video,
  ViroNode,
  ViroSphere,
  ViroMaterials,
} from '@reactvision/react-viro';
import type { Hotspot, Scene } from '@/lib/scenes';

// Register hotspot sphere materials once at module load time.
ViroMaterials.createMaterials({
  navHotspot: {
    lightingModel: 'Constant',
    diffuseColor: 'rgba(6,182,212,0.9)',
  },
  infoHotspot: {
    lightingModel: 'Constant',
    diffuseColor: 'rgba(139,92,246,0.9)',
  },
});

/** Converts spherical yaw/pitch angles to a Cartesian position in Viro space. */
function yawPitchToPosition(
  yaw: number,
  pitch: number,
  radius = 3.5
): [number, number, number] {
  const y = (yaw * Math.PI) / 180;
  const p = (pitch * Math.PI) / 180;
  return [
    radius * Math.cos(p) * Math.sin(y),
    radius * Math.sin(p),
    -radius * Math.cos(p) * Math.cos(y),
  ];
}

interface AppProps {
  videoUrl: string;
  hotspots: Hotspot[];
  onHotspotTap: (h: Hotspot) => void;
  onReady: () => void;
  onLoading: () => void;
  onError: (msg: string) => void;
}

/**
 * The scene rendered inside ViroVRSceneNavigator.
 * Must be defined outside the parent render tree (ViroReact requirement).
 * Data flows in via sceneNavigator.viroAppProps, which is reactive —
 * updating viroAppProps on the navigator re-renders this component.
 */
function Scene360({
  sceneNavigator,
}: {
  sceneNavigator: { viroAppProps: AppProps };
}) {
  const { videoUrl, hotspots, onHotspotTap, onReady, onLoading, onError } =
    sceneNavigator.viroAppProps;

  const readyCalled = useRef(false);

  useEffect(() => {
    readyCalled.current = false;
    onLoading();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoUrl]);

  return (
    <ViroScene>
      <Viro360Video
        source={{ uri: videoUrl }}
        loop
        muted
        paused={false}
        onBufferEnd={() => {
          if (!readyCalled.current) {
            readyCalled.current = true;
            onReady();
          }
        }}
        onError={(e: NativeSyntheticEvent<{ error: Error }>) =>
          onError(e?.nativeEvent?.error?.message ?? 'Failed to load 360° video')
        }
      />

      {hotspots.map((h) => (
        <ViroNode
          key={h.id}
          position={yawPitchToPosition(h.yaw, h.pitch)}
          onClick={() => onHotspotTap(h)}
        >
          <ViroSphere
            radius={0.12}
            materials={[h.type === 'navigation' ? 'navHotspot' : 'infoHotspot']}
          />
        </ViroNode>
      ))}
    </ViroScene>
  );
}

export interface ViroViewer360Props {
  scene: Scene;
  onHotspotTap: (hotspot: Hotspot) => void;
  onReady: () => void;
  onLoading: () => void;
  onError: (message: string) => void;
}

export default function ViroViewer360({
  scene,
  onHotspotTap,
  onReady,
  onLoading,
  onError,
}: ViroViewer360Props) {
  return (
    <ViroVRSceneNavigator
      vrModeEnabled={false}
      initialScene={{ scene: Scene360 as () => React.JSX.Element }}
      viroAppProps={{
        videoUrl: scene.videoUrl,
        hotspots: scene.hotspots,
        onHotspotTap,
        onReady,
        onLoading,
        onError,
      }}
      style={StyleSheet.absoluteFill}
    />
  );
}
