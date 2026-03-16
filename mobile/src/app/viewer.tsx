import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Pressable,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import Viewer360, { type Viewer360Ref } from '@/components/Viewer360';
import HotspotModal from '@/components/HotspotModal';
import { Text } from '@/components/ui/text';
import { facilitiesService } from '@/services/facilities.service';
import type { Hotspot, Scene } from '@/lib/scenes';
import { cn } from '@/lib/utils';

export default function ViewerScreen() {
  const { sceneId } = useLocalSearchParams<{ sceneId?: string }>();
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [scenes, setScenes] = useState<Scene[]>([]);
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalText, setModalText] = useState('');
  const [showScenePicker, setShowScenePicker] = useState(false);
  const [viewerKey, setViewerKey] = useState(0);
  const viewerRef = useRef<Viewer360Ref | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const sceneList = await facilitiesService.getScenesForViewer();
        if (!isMounted) return;
        setScenes(sceneList);
        const requestedId = sceneId?.trim();
        const initialScene = requestedId
          ? (sceneList.find((s) => s.id === requestedId) ??
            (await facilitiesService.getSceneById(requestedId)))
          : sceneList[0] ?? null;
        if (initialScene) setCurrentScene(initialScene);
      } catch (e) {
        if (isMounted) setErrorMessage(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [sceneId]);

  useEffect(() => {
    if (isLoading) {
      loadingTimerRef.current = setTimeout(() => setIsLoading(false), 15000);
    }
    return () => {
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    };
  }, [isLoading, viewerKey]);

  const handleHotspotTap = useCallback(
    async (hotspot: Hotspot) => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      if (hotspot.type === 'info') {
        setModalText(hotspot.text || '');
        setModalVisible(true);
      } else if (hotspot.type === 'navigation' && hotspot.targetSceneId) {
        const target =
          scenes.find((s) => s.id === hotspot.targetSceneId) ??
          (await facilitiesService.getSceneById(hotspot.targetSceneId));
        if (target) {
          setIsLoading(true);
          setCurrentScene(target);
        }
      }
    },
    [scenes]
  );

  const handleReady = useCallback(() => {
    setIsLoading(false);
    setErrorMessage(null);
  }, []);

  const handleLoading = useCallback(() => {
    setIsLoading(true);
    setErrorMessage(null);
  }, []);

  const handleError = useCallback((msg: string) => {
    setIsLoading(false);
    setErrorMessage(msg || 'Video failed to load');
  }, []);

  const handleBack = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  const switchScene = (scene: Scene) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsLoading(true);
    setErrorMessage(null);
    setCurrentScene(scene);
    setShowScenePicker(false);
  };

  const retry = () => {
    setIsLoading(true);
    setErrorMessage(null);
    setViewerKey((k) => k + 1);
  };

  const bottomInset = insets.bottom || (Platform.OS === 'web' ? 34 : 0);
  const topInset = insets.top || webTopInset;

  if (!currentScene) {
    return (
      <View className="flex-1 bg-viewer-bg items-center justify-center">
        <ActivityIndicator size="large" color="rgb(var(--viewer-cyan))" />
        <Text className="text-viewer-muted mt-4">Loading viewer...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-viewer-bg">
      <StatusBar barStyle="light-content" hidden />

      <Viewer360
        ref={viewerRef}
        key={viewerKey}
        scene={currentScene}
        onHotspotTap={handleHotspotTap}
        onReady={handleReady}
        onLoading={handleLoading}
        onError={handleError}
      />

      {isLoading && (
        <View className="absolute inset-0 items-center justify-center gap-4 z-50 bg-viewer-bg/85">
          <ActivityIndicator size="large" color="rgb(var(--viewer-cyan))" />
          <Text className="text-[15px] text-viewer-muted">Loading scene...</Text>
        </View>
      )}

      {!!errorMessage && (
        <View
          className="absolute left-4 right-4 flex-row items-center gap-2 py-3 px-3 rounded-xl bg-slate-900/92 border border-amber-500/35 z-[60]"
          style={{ bottom: bottomInset + 18 }}
        >
          <Ionicons name="warning" size={18} color="rgb(var(--viewer-warning))" />
          <Text className="flex-1 text-slate-200 text-xs leading-4" numberOfLines={3}>
            {errorMessage}
          </Text>
          <Pressable onPress={retry} className="py-2 px-2 rounded-lg bg-cyan-500/20 border border-cyan-500/35 active:opacity-70">
            <Text className="text-viewer-cyan text-xs font-bold">Retry</Text>
          </Pressable>
        </View>
      )}

      <View
        className="absolute top-0 left-0 right-0 flex-row items-center justify-between px-3 pb-2 z-20"
        style={{ paddingTop: topInset + 8 }}
      >
        <Pressable onPress={handleBack} className="w-11 h-11 rounded-full bg-black/40 items-center justify-center active:opacity-60">
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </Pressable>

        <View className="flex-row items-center gap-2 bg-black/50 px-4 py-2 rounded-xl max-w-[200px]">
          <Ionicons
            name="radio-button-on"
            size={8}
            color={isLoading ? 'rgb(var(--viewer-warning))' : 'rgb(var(--viewer-success))'}
          />
          <Text className="text-sm font-semibold text-white" numberOfLines={1}>
            {currentScene.title}
          </Text>
        </View>

        <Pressable
          onPress={() => setShowScenePicker(!showScenePicker)}
          className="w-11 h-11 rounded-full bg-black/40 items-center justify-center active:opacity-60"
        >
          <Ionicons name="layers" size={22} color="#fff" />
        </Pressable>
      </View>

      <View
        className="absolute left-4 z-[100]"
        style={{ bottom: bottomInset + 16 }}
      >
        <Pressable
          onPress={() => viewerRef.current?.toggleGyro?.()}
          className="py-3 px-4 rounded-xl bg-viewer-bg/92 border border-cyan-500/50 active:opacity-80"
        >
          <Text className="text-slate-200 text-sm font-semibold">Use gyroscope</Text>
        </Pressable>
      </View>

      {showScenePicker && (
        <View
          className="absolute left-4 right-4 bg-slate-900/95 rounded-2xl p-2 z-30 border border-cyan-500/12"
          style={{ bottom: bottomInset + 16 }}
        >
          {scenes.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => switchScene(s)}
              className={cn(
                'flex-row items-center gap-3 py-3 px-3 rounded-xl',
                s.id === currentScene.id && 'bg-cyan-500/8'
              )}
            >
              <View
                className={cn(
                  'w-2 h-2 rounded-full',
                  s.id === currentScene.id ? 'bg-viewer-cyan' : 'bg-viewer-muted'
                )}
              />
              <View className="flex-1">
                <Text
                  className={cn(
                    'text-[15px] font-semibold',
                    s.id === currentScene.id ? 'text-viewer-cyan' : 'text-white'
                  )}
                  numberOfLines={1}
                >
                  {s.title}
                </Text>
                <Text className="text-viewer-muted text-xs mt-0.5" numberOfLines={1}>
                  {s.hotspots.length} hotspot{s.hotspots.length !== 1 ? 's' : ''}
                </Text>
              </View>
              {s.id === currentScene.id && (
                <Ionicons name="checkmark-circle" size={20} color="rgb(var(--viewer-cyan))" />
              )}
            </Pressable>
          ))}
        </View>
      )}

      <HotspotModal
        visible={modalVisible}
        text={modalText}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}
