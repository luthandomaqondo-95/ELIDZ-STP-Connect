import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Text } from '@/components/ui/text';
import { ScreenScrollView } from '@/components/ScreenScrollView';
import Viewer360, { type Viewer360Ref } from '@/components/Viewer360';
import HotspotModal from '@/components/HotspotModal';
import { TenantLogo } from '@/components/TenantLogo';
import {
  facilitiesService,
  type FacilityWithTour,
} from '@/services/facilities.service';
import { tenantService } from '@/services/tenant.service';
import type { Tenant } from '@/types';
import type { Hotspot, Scene } from '@/lib/scenes';

type ViewMode = 'panorama' | 'sections';

export default function VRTourScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const facilityId = params.id as string | undefined;

  const [facilityWithTour, setFacilityWithTour] =
    useState<FacilityWithTour | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('panorama');
  const [currentSection, setCurrentSection] = useState(0);
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalText, setModalText] = useState('');
  const [showScenePicker, setShowScenePicker] = useState(false);
  const [viewerKey, setViewerKey] = useState(0);
  const viewerRef = useRef<Viewer360Ref | null>(null);
  const [availableScenes, setAvailableScenes] = useState<Scene[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function loadTour() {
      if (!facilityId) {
        setFacilityWithTour(null);
        setTenants([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setCurrentSection(0);
      setViewMode('panorama');

      try {
        const [{ facility, scenes }, dbTenants] = await Promise.all([
          facilitiesService.getFacilityTourWithScenes(facilityId),
          tenantService.getTenantsByFacilityId(facilityId),
        ]);
        if (!isMounted) return;
        setFacilityWithTour(facility);
        setAvailableScenes(scenes);
        setTenants(dbTenants || []);

        if (!facility) return;

        const sceneId = facility.initialSceneId ?? scenes.at(0)?.id;
        const initialScene = sceneId ? scenes.find((s) => s.id === sceneId) ?? scenes[0] : scenes[0] ?? null;
        if (isMounted && initialScene) setCurrentScene(initialScene);
      } catch (error) {
        console.error('Error loading VR tour:', error);
        if (isMounted) {
          setFacilityWithTour(null);
          setTenants([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadTour();
    return () => {
      isMounted = false;
    };
  }, [facilityId]);

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
          availableScenes.find((s) => s.id === hotspot.targetSceneId) ??
          (await facilitiesService.getSceneById(hotspot.targetSceneId));
        if (target) {
          setIsLoading(true);
          setCurrentScene(target);
          if (target.serviceId && target.serviceId !== facilityWithTour?.id) {
            const targetScenes = await facilitiesService.getScenesForFacilityViewer(target.serviceId);
            setAvailableScenes(targetScenes);
          }
        }
      }
    },
    [availableScenes, facilityWithTour?.id]
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

  const handleEnquiry = () => {
    if (!facilityWithTour) return;
    const section = facilityWithTour.sections[currentSection];
    router.push({
      pathname: '/enquiry-form',
      params: {
        type: 'Facility',
        facilityId: facilityWithTour.id,
        subject: section
          ? `Enquiry: ${section.title} (${facilityWithTour.name})`
          : `Enquiry: ${facilityWithTour.name}`,
      },
    });
  };

  const handleBooking = () => {
    if (!facilityWithTour) return;
    const section = facilityWithTour.sections[currentSection];
    router.push({
      pathname: '/enquiry-form',
      params: {
        type: 'Facility',
        facilityId: facilityWithTour.id,
        subject: section
          ? `Booking Request: ${section.title} (${facilityWithTour.name})`
          : `Booking Request: ${facilityWithTour.name}`,
      },
    });
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

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#3B6E8F" />
        <Text className="mt-4 text-muted-foreground">Loading tour...</Text>
      </View>
    );
  }

  if (!facilityId || !facilityWithTour) {
    return (
      <ScreenScrollView>
        <View className="flex-1 items-center justify-center py-12 px-6">
          <Text className="text-xl font-semibold text-foreground mb-4">
            Tour unavailable
          </Text>
          <Text className="text-center text-muted-foreground mb-6">
            We could not find the requested virtual tour. Please select a
            facility from the Services page.
          </Text>
          <Pressable
            className="px-6 py-3 rounded-full bg-primary"
            onPress={() => router.replace('/(tabs)/services')}
          >
            <Text className="text-white font-semibold">Back to VR Tours</Text>
          </Pressable>
        </View>
      </ScreenScrollView>
    );
  }

  const activeScene = currentScene ?? null;
  const hasSections = facilityWithTour.sections.length > 0;
  const section = hasSections
    ? facilityWithTour.sections[currentSection]
    : undefined;

  return (
    <View className="flex-1 bg-background">
      <View
        className="px-4 pt-12 pb-6 flex-row items-center"
        style={{ backgroundColor: facilityWithTour.color }}
      >
        <Pressable
          onPress={() => router.back()}
          className="p-2 bg-white/20 rounded-full shrink-0"
        >
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </Pressable>
        <View className="flex-1 items-center mx-3">
          <Text
            className="text-white text-base font-bold text-center"
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {facilityWithTour.name}
          </Text>
          <Text
            className="text-white/80 text-xs mt-1 text-center"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {viewMode === 'panorama'
              ? (activeScene?.title ?? '')
              : 'Virtual Tour Details'}
          </Text>
        </View>
        <View className="flex-row gap-2 items-center shrink-0">
          {viewMode === 'sections' && (
            <Pressable
              className="p-2 rounded-full bg-white/20"
              onPress={() => setViewMode('panorama')}
            >
              <Feather name="camera" size={20} color="#FFFFFF" />
            </Pressable>
          )}
          <Pressable
            className={`p-2 rounded-full ${
              viewMode === 'sections' ? 'bg-white text-primary' : 'bg-white/20'
            }`}
            onPress={() => hasSections && setViewMode('sections')}
            disabled={!hasSections}
          >
            <Feather
              name="list"
              size={20}
              color={viewMode === 'sections' ? facilityWithTour.color : '#FFFFFF'}
            />
          </Pressable>
        </View>
      </View>

      {viewMode === 'panorama' && activeScene ? (
        <View className="flex-1">
          <Viewer360
            ref={viewerRef}
            key={viewerKey}
            scene={activeScene}
            onHotspotTap={handleHotspotTap}
            onReady={handleReady}
            onLoading={handleLoading}
            onError={handleError}
          />

          {!!errorMessage && (
            <View className="absolute left-4 right-4 bottom-20 bg-slate-900/95 rounded-xl p-4 flex-row items-center gap-2 border border-amber-500/50 z-50">
              <Feather name="alert-circle" size={18} color="#FFC107" />
              <Text className="flex-1 text-white text-sm" numberOfLines={2}>
                {errorMessage}
              </Text>
              <Pressable
                onPress={retry}
                className="px-3 py-2 rounded-lg bg-cyan-500/20"
              >
                <Text className="text-cyan-400 font-semibold text-sm">
                  Retry
                </Text>
              </Pressable>
            </View>
          )}

          {showScenePicker && (
            <View className="absolute left-4 right-4 bottom-24 bg-slate-900/95 rounded-xl p-3 border border-cyan-500/20 z-50">
              {availableScenes.map((s) => (
                <Pressable
                  key={s.id}
                  onPress={() => switchScene(s)}
                  className={`flex-row items-center gap-3 py-3 px-3 rounded-lg ${
                    s.id === activeScene?.id ? 'bg-cyan-500/10' : ''
                  }`}
                >
                  <View
                    className={`w-2 h-2 rounded-full ${
                      s.id === activeScene?.id ? 'bg-cyan-500' : 'bg-slate-500'
                    }`}
                  />
                  <Text
                    className={`flex-1 text-sm ${
                      s.id === activeScene?.id ? 'text-cyan-400' : 'text-white'
                    }`}
                    numberOfLines={1}
                  >
                    {s.title}
                  </Text>
                  {s.id === activeScene?.id && (
                    <Feather name="check" size={16} color="#06B6D4" />
                  )}
                </Pressable>
              ))}
            </View>
          )}

          <View className="absolute top-4 left-4 right-4 flex-row justify-between items-center z-40">
            <Pressable
              onPress={() => viewerRef.current?.toggleGyro?.()}
              className="px-4 py-3 rounded-xl active:opacity-90"
            >
              <Text className="font-semibold text-sm text-black">
                Use gyroscope
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setShowScenePicker(!showScenePicker)}
              className="p-2 rounded-full bg-black/40"
            >
              <Feather name="layers" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-6 py-6"
          showsVerticalScrollIndicator={false}
        >
          {section ? (
            <View className="bg-card rounded-2xl p-6 shadow-sm border border-border mb-6">
              <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-border">
                <View>
                  <Text className="text-sm text-muted-foreground uppercase font-semibold">
                    Current Location
                  </Text>
                  <Text className="text-2xl font-bold text-foreground mt-1">
                    {section.title}
                  </Text>
                </View>
                <View className="bg-primary/10 px-3 py-1 rounded-full">
                  <Text className="text-primary font-bold">
                    {currentSection + 1}/{facilityWithTour.sections.length}
                  </Text>
                </View>
              </View>

              <Text className="text-base text-muted-foreground leading-6 mb-6">
                {section.description}
              </Text>

              <Text className="text-lg font-semibold text-foreground mb-4">
                Key Features
              </Text>
              {(section.details || []).map((detail, index) => (
                <View key={index} className="flex-row items-center mb-3">
                  <View
                    className="w-2 h-2 rounded-full mr-3"
                    style={{ backgroundColor: facilityWithTour.color }}
                  />
                  <Text className="text-base text-foreground flex-1">
                    {detail}
                  </Text>
                </View>
              ))}

              <View className="mt-4 flex-row gap-3 flex-wrap">
                {section.vr_scene_id && (
                  <Pressable
                    className="px-4 py-3 rounded-full bg-primary active:opacity-90 flex-row items-center"
                    onPress={async () => {
                      const scene =
                        availableScenes.find((s) => s.id === section.vr_scene_id) ??
                        (await facilitiesService.getSceneById(section.vr_scene_id!));
                      if (scene) {
                        setCurrentScene(scene);
                        setViewMode('panorama');
                      }
                    }}
                  >
                    <Feather name="camera" size={16} color="#FFFFFF" />
                    <Text className="ml-2 text-white font-semibold text-sm">
                      View 360° tour
                    </Text>
                  </Pressable>
                )}
                <Pressable
                  className="px-4 py-3 rounded-full bg-accent active:opacity-90"
                  onPress={handleBooking}
                >
                  <View className="flex-row items-center justify-center">
                    <Feather name="calendar" size={16} color="#FFFFFF" />
                    <Text className="ml-2 text-white font-semibold text-sm">
                      Request Booking / Enquiry
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>
          ) : (
            <View className="bg-card rounded-2xl p-6 shadow-sm border border-border mb-6">
              <Text className="text-lg font-semibold text-foreground mb-2">
                Tour Details
              </Text>
              <Text className="text-muted-foreground">
                Explore the 360° video tour above to view this facility. Tap the
                layers icon to switch between scenes.
              </Text>
              <Pressable
                className="mt-4 px-4 py-3 rounded-full bg-accent active:opacity-90"
                onPress={handleBooking}
              >
                <View className="flex-row items-center justify-center">
                  <Feather name="mail" size={16} color="#FFFFFF" />
                  <Text className="ml-2 text-white font-semibold text-sm">
                    Request Booking / Enquiry
                  </Text>
                </View>
              </Pressable>
            </View>
          )}

          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Tenants in this Wing
            </Text>
            {tenants.length === 0 && (
              <Text className="text-muted-foreground">
                No tenants listed for this facility.
              </Text>
            )}
            {tenants.map((tenant) => (
              <Pressable
                key={tenant.id}
                className="bg-card p-4 rounded-xl mb-3 flex-row items-center border border-border active:opacity-90"
                onPress={() =>
                  router.push({
                    pathname: '/tenant-detail',
                    params: {
                      id: tenant.id,
                      name: tenant.name,
                      tenant: JSON.stringify(tenant),
                    },
                  })
                }
              >
                <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3">
                  <TenantLogo name={tenant.name} logoUrl={tenant.logo_url} />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-foreground">
                    {tenant.name}
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    {tenant.description}
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color="rgb(var(--muted-foreground))" />
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}

      {viewMode === 'sections' && hasSections && (
        <View className="flex-row justify-between items-center p-6 border-t border-border bg-background">
          <Pressable
            className={`flex-row items-center ${
              currentSection === 0 ? 'opacity-50' : 'active:opacity-70'
            }`}
            onPress={() => {
              const prevSection = Math.max(0, currentSection - 1);
              setCurrentSection(prevSection);
            }}
            disabled={currentSection === 0}
          >
            <Feather name="chevron-left" size={24} color="rgb(var(--foreground))" />
            <Text className="ml-2 font-semibold text-foreground">Previous</Text>
          </Pressable>

          <View className="flex-row gap-2">
            {facilityWithTour.sections.map((_, index) => (
              <View
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentSection ? '' : 'bg-muted'
                }`}
                style={
                  index === currentSection
                    ? { backgroundColor: facilityWithTour.color }
                    : {}
                }
              />
            ))}
          </View>

          <Pressable
            className={`flex-row items-center ${
              currentSection === facilityWithTour.sections.length - 1
                ? 'opacity-50'
                : 'active:opacity-70'
            }`}
            onPress={() => {
              const nextSection = Math.min(
                facilityWithTour.sections.length - 1,
                currentSection + 1
              );
              setCurrentSection(nextSection);
            }}
            disabled={currentSection === facilityWithTour.sections.length - 1}
          >
            <Text className="mr-2 font-semibold text-foreground">Next</Text>
            <Feather name="chevron-right" size={24} color="rgb(var(--foreground))" />
          </Pressable>
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
