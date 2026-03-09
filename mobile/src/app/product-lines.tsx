import React, { useState, useEffect } from 'react';
import { View, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { analyticsService } from '@/services/analytics.service';
import { facilitiesService, Facility } from '@/services/facilities.service';
import { TabsLayoutHeader } from '@/components/Header';
import { useColorScheme } from '@/hooks/use-theme-color';
import { COLORS } from '@/theme/colors';

const FEATHER_ICONS = ['droplet', 'pen-tool', 'zap', 'globe', 'home', 'trending-up', 'users', 'monitor', 'settings'] as const;

function mapIcon(icon?: string): (typeof FEATHER_ICONS)[number] {
  if (icon && FEATHER_ICONS.includes(icon as any)) return icon as (typeof FEATHER_ICONS)[number];
  return 'home';
}

export default function ProductLinesScreen() {
  const { colorScheme } = useColorScheme();
  const colors = COLORS[colorScheme];
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await facilitiesService.getAllFacilities();
        if (!cancelled) setFacilities(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load facilities');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="bg-background">
          <TabsLayoutHeader
            title="Centers of Excellence"
            variant="navy"
            showActions={false}
            left={
              <Pressable
                onPress={() => router.back()}
                className="p-2 bg-white/10 rounded-full"
              >
                <Feather name="arrow-left" size={20} color="white" />
              </Pressable>
            }
          >
            <Text className="text-white/80 text-base">
              Explore our specialized centers designed to support innovation and growth
            </Text>
          </TabsLayoutHeader>
        </View>

        <View className="mt-6 px-4">
        {loading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="text-muted-foreground mt-3">Loading facilities...</Text>
          </View>
        ) : error ? (
          <View className="py-12 px-4">
            <Text className="text-destructive text-center">{error}</Text>
          </View>
        ) : (
          facilities.map((facility) => (
            <View className="mb-4" key={facility.id}>
              <Pressable
                className="flex-row items-center p-4 rounded-xl bg-card active:opacity-70 mb-2 shadow-sm"
                onPress={() => {
                  analyticsService.recordVisit('lab', facility.id, facility.name);
                  router.push({ pathname: '/center-detail', params: { id: facility.id, name: facility.name } });
                }}
              >
                <View
                  className="w-14 h-14 rounded-xl justify-center items-center"
                  style={{ backgroundColor: facility.color || '#0066CC' }}
                >
                  <Feather name={mapIcon(facility.icon)} size={28} color="#FFFFFF" />
                </View>
                <View className="flex-1 ml-4">
                  <Text className="text-lg font-bold mb-2 text-foreground">{facility.name}</Text>
                  <Text className="text-muted-foreground text-sm">
                    {facility.description}
                  </Text>
                </View>
                <Feather name="chevron-right" size={24} color="rgb(var(--muted-foreground))" />
              </Pressable>
              <Pressable
                className="flex-row items-center justify-center py-3 rounded-xl mx-1 active:opacity-70"
                style={{ backgroundColor: facility.color || '#0066CC' }}
                onPress={() => router.push({ pathname: '/vr-tour', params: { id: facility.id, name: facility.name } })}
              >
                <Feather name="eye" size={18} color="#FFFFFF" />
                <Text className="text-white text-sm ml-2 font-semibold">
                  VR Tour
                </Text>
              </Pressable>
            </View>
          ))
        )}
        </View>
      </ScrollView>
    </View>
  );
}

