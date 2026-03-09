import React, { useState, useEffect } from 'react';
import { View, Pressable, Image, ScrollView, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/useTheme';
import { Feather } from '@expo/vector-icons';
import { withAuthGuard } from '@/components/withAuthGuard';
import { facilitiesService, Facility, VRSection } from '@/services/facilities.service';
import { TabsLayoutHeader } from '@/components/Header';

type ThemeColors = ReturnType<typeof useTheme>['colors'];

function CenterDetailScreen() {
  const params = useLocalSearchParams<{ id: string; name: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id ?? '';
  const paramName = Array.isArray(params.name) ? params.name[0] : params.name;
  const { colors } = useTheme();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [sections, setSections] = useState<VRSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [fac, secs] = await Promise.all([
          facilitiesService.getFacilityById(id),
          facilitiesService.getSectionsByFacilityId(id),
        ]);
        if (!cancelled) {
          setFacility(fac);
          setSections(secs ?? []);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load facility');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const getImageSource = (): { uri: string } | number | null => {
    if (!facility?.image_url) return null;
    if (facility.image_url.startsWith('http')) return { uri: facility.image_url };
    return facilitiesService.getFacilityCardImage(facility.image_url) ?? null;
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center p-6">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-muted-foreground mt-3">Loading facility…</Text>
      </View>
    );
  }

  if (error || !facility) {
    return (
      <View className="flex-1 bg-background justify-center items-center p-6">
        <Text className="text-muted-foreground text-center">{error || 'Center not found.'}</Text>
      </View>
    );
  }

  const displayName = paramName || facility.name;
  const imageSource = getImageSource();

  return (
    <View className="flex-1 bg-background">
      <View className="bg-background">
        <TabsLayoutHeader
          title={displayName}
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
            Services, equipment, and contact information.
          </Text>
        </TabsLayoutHeader>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 12, paddingTop: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="p-3 rounded-xl mb-5 bg-card shadow-sm">
          <Text className="text-base text-foreground">
            {facility.description}
          </Text>
        </View>

        {imageSource && (
          <View className="mb-5 rounded-xl overflow-hidden">
            <Image
              source={imageSource}
              className="w-full h-48"
              resizeMode="cover"
            />
          </View>
        )}

        <View className="mb-5">
          <Text className="text-lg font-bold text-foreground mb-3">Services & Capabilities</Text>
          {sections.length > 0 ? (
            sections.map((section, index) => (
              <View key={section.id || index} className="mb-4">
                <View className="flex-row items-start mb-2">
                  <Feather name="check-circle" size={20} color={colors.secondary} />
                  <View className="ml-2.5 flex-1">
                    <Text className="text-base font-semibold text-foreground">{section.title}</Text>
                    {section.description ? (
                      <Text className="text-base text-foreground mt-1">{section.description}</Text>
                    ) : null}
                  </View>
                </View>
                {Array.isArray(section.details) && section.details.length > 0 && (
                  <View className="ml-7 mt-1">
                    {section.details.map((d, i) => (
                      <View key={i} className="flex-row items-start mb-1">
                        <Feather name="minus" size={14} color={colors.mutedForeground} />
                        <Text className="text-base text-foreground ml-2 flex-1">{d}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text className="text-muted-foreground">No services listed.</Text>
          )}
        </View>

        <View className="p-5 rounded-xl mb-5 bg-primary shadow-sm">
          <Text className="text-lg font-bold text-white mb-2">Get in Touch</Text>
          <Text className="text-sm text-white/90 mb-3">
            Contact us to learn more about how this center can support your innovation
          </Text>
          <Pressable
            className="flex-row items-center justify-center py-2.5 px-3 rounded-lg bg-white active:opacity-80"
            onPress={() => router.push('/enquiry-form')}
          >
            <Feather name="mail" size={18} color={colors.primary} />
            <Text className="text-base text-primary ml-2 font-semibold">Send Enquiry</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

export default withAuthGuard(CenterDetailScreen);
