/**
 * ViroReact 360° video viewer.
 *
 * vrModeEnabled={false} = mono mode: single view only (no split-screen).
 * Touch-drag to pan; gyroscope is disabled in this mode.
 */
import React, { useEffect, useRef } from 'react';
import { NativeSyntheticEvent, StyleSheet } from 'react-native';
import {
  ViroVRSceneNavigator,
  ViroScene,
  Viro360Video,
} from '@reactvision/react-viro';
import type { Hotspot, Scene } from '@/lib/scenes';

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
  const { videoUrl, onReady, onLoading, onError } =
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
