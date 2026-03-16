import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { ScreenScrollView } from '@/components/ScreenScrollView';
import { TabsLayoutHeader } from '@/components/Header';
import { facilitiesService, type Facility } from '@/services/facilities.service';
import { tenantService } from '@/services/tenant.service';
import type { Tenant } from '@/types';
import { useColorScheme } from '@/hooks/use-theme-color';
import { COLORS } from '@/theme/colors';

/** Match tenant to facility by facility_id (source of truth from DB). */
const tenantMatchesFacility = (tenant: Tenant, facilityId: string) =>
  tenant.facility_id === facilityId;

export default function ServicesScreen() {
  const { colorScheme } = useColorScheme();
  const colors = COLORS[colorScheme];
  const [searchQuery, setSearchQuery] = useState('');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [dbFacilities, dbTenants] = await Promise.all([
          facilitiesService.getAllFacilities(),
          tenantService.getTenants(200),
        ]);
        if (!isMounted) return;
        setFacilities(dbFacilities || []);
        setTenants(dbTenants || []);
      } catch (error) {
        console.error('Error loading services:', error);
        if (isMounted) {
          setFacilities([]);
          setTenants([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredItems = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase().trim();
    if (!lowerQuery) return facilities;

    return facilities.filter((facility) => {
      const matchesFacility =
        facility.name.toLowerCase().includes(lowerQuery) ||
        facility.description.toLowerCase().includes(lowerQuery);

      const matchesTenant = tenants.some(
        (tenant) =>
          tenantMatchesFacility(tenant, facility.id) &&
          tenant.name.toLowerCase().includes(lowerQuery)
      );

      return matchesFacility || matchesTenant;
    });
  }, [searchQuery, facilities, tenants]);

  const resolveFacilityImage = (facility: Facility) => {
    const resolved = facilitiesService.getFacilityCardImage(facility.image_url);
    if (resolved) return resolved;
    return require('../../../assets/images/connect-solve.png');
  };

  return (
    <ScreenScrollView insetTop={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="bg-background">
        <TabsLayoutHeader title="Virtual Tours" variant="navy">
          <View className="px-0">
            <Text className="text-white/80 text-base">
              Explore the ELIDZ Science & Technology Park campus virtually with 360° video tours.
            </Text>
          </View>
        </TabsLayoutHeader>
      </View>

      <View className="flex-row items-center px-4 h-12 rounded-full border border-border mx-6 mb-6 bg-card mt-6">
        <Feather name="search" size={20} color={colors.textSecondary} />
        <TextInput
          className="flex-1 ml-3 text-base text-foreground"
          placeholder="Search rooms, labs, or tenants..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View className="px-6 pb-6">
        {loading && (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color={colors.accent} />
            <Text className="text-muted-foreground mt-4">Loading facilities...</Text>
          </View>
        )}

        {!loading &&
          filteredItems.map((facility) => (
            <Pressable
              key={facility.id}
              className="mb-4 bg-card rounded-xl overflow-hidden shadow-sm border border-border active:opacity-90 flex-row"
              onPress={() =>
                router.push({ pathname: '/vr-tour', params: { id: facility.id } })
              }
            >
              {/* Left: Image */}
              <View className="w-28 h-28 shrink-0 bg-muted relative">
                <Image
                  source={resolveFacilityImage(facility)}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                <View className="absolute inset-0 bg-black/30 items-center justify-center">
                  <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
                    <Feather name="play-circle" size={20} color={colors.white} />
                  </View>
                </View>
              </View>

              {/* Right: Title and content */}
              <View className="flex-1 p-4 min-w-0 justify-center">
                <View className="flex-row items-center justify-between mb-1">
                  <Text
                    className="text-base font-bold text-foreground flex-1 mr-2"
                    numberOfLines={2}
                  >
                    {facility.name}
                  </Text>
                  <Feather
                    name={facility.icon as any}
                    size={18}
                    color={facility.color}
                  />
                </View>
                <Text
                  className="text-muted-foreground text-sm"
                  numberOfLines={2}
                >
                  {facility.description}
                </Text>
              </View>
            </Pressable>
          ))}

        {!loading && filteredItems.length === 0 && (
          <View className="items-center py-12">
            <Feather name="map" size={48} color={colors.textSecondary} />
            <Text className="text-muted-foreground text-base mt-4 text-center">
              No facilities found matching &quot;{searchQuery}&quot;
            </Text>
          </View>
        )}
      </View>
    </ScreenScrollView>
  );
}
