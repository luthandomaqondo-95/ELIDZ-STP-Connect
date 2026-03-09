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

        {/* Services & capabilities */}
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
                        <Feather name="minus" size={14} color={colors.textSecondary} />
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

        {/* Usage & safety guidance */}
        <View className="p-5 rounded-xl mb-5 bg-card shadow-sm border border-border">
          <Text className="text-lg font-bold text-foreground mb-2">Usage & Safety Guidance</Text>
          <Text className="text-sm text-muted-foreground mb-2">
            Before using this facility, please ensure that you:
          </Text>
          <View className="mt-1">
            <View className="flex-row items-start mb-1.5">
              <Feather name="check-circle" size={14} color={colors.secondary} />
              <Text className="text-xs text-foreground ml-2 flex-1">
                Have completed the required safety or induction briefing for this centre.
              </Text>
            </View>
            <View className="flex-row items-start mb-1.5">
              <Feather name="check-circle" size={14} color={colors.secondary} />
              <Text className="text-xs text-foreground ml-2 flex-1">
                Understand the operating procedures for equipment and labs you intend to use.
              </Text>
            </View>
            <View className="flex-row items-start mb-1.5">
              <Feather name="check-circle" size={14} color={colors.secondary} />
              <Text className="text-xs text-foreground ml-2 flex-1">
                Use the correct PPE and follow all signage and staff instructions while on site.
              </Text>
            </View>
            <View className="flex-row items-start">
              <Feather name="alert-triangle" size={14} color={colors.warning} />
              <Text className="text-xs text-foreground ml-2 flex-1">
                Report any safety concerns, damaged equipment, or access issues immediately using the
                issue reporting option below.
              </Text>
            </View>
          </View>
        </View>

        {/* Contact & issue reporting */}
        <View className="p-5 rounded-xl mb-5 bg-primary shadow-sm">
          <Text className="text-lg font-bold text-white mb-2">Get in Touch</Text>
          <Text className="text-sm text-white/90 mb-3">
            Contact us to learn more about how this center can support your innovation, or report any
            issues you encounter.
          </Text>
          <View className="flex-row gap-3">
            <Pressable
              className="flex-1 flex-row items-center justify-center py-2.5 px-3 rounded-lg bg-white active:opacity-80"
              onPress={() =>
                router.push({
                  pathname: '/enquiry-form',
                  params: {
                    type: 'Facility',
                    facilityId: facility.id,
                    subject: `Facility Enquiry: ${displayName}`,
                  },
                })
              }
            >
              <Feather name="mail" size={18} color={colors.primary} />
              <Text className="text-base text-primary ml-2 font-semibold">Send Enquiry</Text>
            </Pressable>
            <Pressable
              className="flex-1 flex-row items-center justify-center py-2.5 px-3 rounded-lg bg-black/10 border border-white/40 active:opacity-80"
              onPress={() =>
                router.push({
                  pathname: '/enquiry-form',
                  params: {
                    type: 'Facility',
                    facilityId: facility.id,
                    subject: `Facility Issue: ${displayName}`,
                  },
                })
              }
            >
              <Feather name="alert-triangle" size={18} color="white" />
              <Text className="text-base text-white ml-2 font-semibold">Report Issue</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default withAuthGuard(CenterDetailScreen);
