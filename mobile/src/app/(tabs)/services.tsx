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

const normalize = (value?: string) =>
  (value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const getFacilityAliases = (facility: Facility) => {
  const aliases = [facility.id, facility.name, facility.location];
  if (facility.id === 'automotive-incubator') aliases.push('incubators');
  if (facility.id === 'food-water') aliases.push('analytical laboratory');
  if (facility.id === 'design-centre') aliases.push('design centre');
  if (facility.id === 'digital-hub') aliases.push('digital hub');
  if (facility.id === 'renewable-energy') aliases.push('renewable energy centre');
  return aliases.map(normalize).filter(Boolean);
};

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
      const aliases = getFacilityAliases(facility);
      const matchesFacility =
        facility.name.toLowerCase().includes(lowerQuery) ||
        facility.description.toLowerCase().includes(lowerQuery);

      const matchesTenant = tenants.some(
        (tenant) =>
          aliases.some(
            (alias) =>
              normalize(tenant.location).includes(alias) || alias.includes(normalize(tenant.location))
          ) && tenant.name.toLowerCase().includes(lowerQuery)
      );

      return matchesFacility || matchesTenant;
    });
  }, [searchQuery, facilities, tenants]);

  const resolveFacilityImage = (facility: Facility) => {
    if (facility.image_url?.startsWith('http')) {
      return { uri: facility.image_url };
    }
    if (facility.image_url) {
      const cardImage = facilitiesService.getFacilityCardImage(facility.image_url);
      if (cardImage) return cardImage;
    }
    return require('../../../assets/images/connect-solve.png');
  };

  return (
    <ScreenScrollView insetTop={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="bg-background">
        <TabsLayoutHeader title="Virtual Tours" variant="navy">
          <View className="px-0">
            <Text className="text-white/80 text-base">
              Explore the ELIDZ Science & Technology Park campus virtually.
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
          filteredItems.map((facility) => {
            const aliases = getFacilityAliases(facility);
            const tenantsInFacility = tenants.filter((tenant) => {
              const tenantLoc = normalize(tenant.location);
              return aliases.some(
                (alias) => tenantLoc.includes(alias) || alias.includes(tenantLoc)
              );
            });

            return (
              <Pressable
                key={facility.id}
                className="mb-4 bg-card rounded-xl overflow-hidden shadow-sm border border-border active:opacity-90 flex-row"
                onPress={() => router.push({ pathname: '/vr-tour', params: { id: facility.id } })}
              >
                {/* Left: Image */}
                <View className="w-28 h-28 shrink-0 bg-muted relative">
                  <Image source={resolveFacilityImage(facility)} className="w-full h-full" resizeMode="cover" />
                  <View className="absolute inset-0 bg-black/30 items-center justify-center">
                    <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
                      <Feather name="play-circle" size={20} color={colors.white} />
                    </View>
                  </View>
                </View>

                {/* Right: Title and content */}
                <View className="flex-1 p-4 min-w-0 justify-between">
                  <View>
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-base font-bold text-foreground flex-1 mr-2" numberOfLines={2}>
                        {facility.name}
                      </Text>
                      <Feather name={facility.icon as any} size={18} color={facility.color} />
                    </View>
                    <Text className="text-muted-foreground text-sm" numberOfLines={2}>
                      {facility.description}
                    </Text>
                  </View>
                  {tenantsInFacility.length > 0 && (
                    <View className="bg-muted/10 rounded-lg p-2 mt-2">
                      <Text className="text-xs font-semibold text-muted-foreground mb-1">
                        TENANTS IN THIS WING
                      </Text>
                      {tenantsInFacility.slice(0, 2).map((tenant) => (
                        <View key={tenant.id} className="flex-row items-center mb-0.5">
                          <View className="w-1 h-1 rounded-full bg-primary mr-1.5" />
                          <Text className="text-xs text-foreground" numberOfLines={1}>
                            {tenant.name}
                          </Text>
                        </View>
                      ))}
                      {tenantsInFacility.length > 2 && (
                        <Text className="text-xs text-muted-foreground mt-0.5 ml-2.5">
                          +{tenantsInFacility.length - 2} more
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}

        {!loading && filteredItems.length === 0 && (
          <View className="items-center py-12">
            <Feather name="map" size={48} color={colors.textSecondary} />
            <Text className="text-muted-foreground text-base mt-4 text-center">
              No facilities found matching "{searchQuery}"
            </Text>
          </View>
        )}
      </View>
    </ScreenScrollView>
  );
}

