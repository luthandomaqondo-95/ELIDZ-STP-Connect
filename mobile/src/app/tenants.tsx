import React, { useMemo, useState } from 'react';
import { View, Pressable, TextInput, FlatList , Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-theme-color';
import { COLORS } from '@/theme/colors';
import { useTenantsSearch } from '@/hooks/useSearch';
import { useDebounce } from '@/hooks/useDebounce';
import { TenantLogo } from '@/components/TenantLogo';
import { TabsLayoutHeader } from '@/components/Header';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function TenantsScreen() {
    const { colorScheme } = useColorScheme();
    const colors = COLORS[colorScheme];
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('All');

    // Debounce search query to avoid too many requests
    const debouncedSearch = useDebounce(searchQuery, 300);

    const { data: tenants, isLoading, error } = useTenantsSearch(debouncedSearch);

    const filters = useMemo(() => {
        const locations = Array.from(
            new Set(
                (tenants || [])
                    .map((tenant) => tenant.location?.trim())
                    .filter((location): location is string => Boolean(location))
            )
        ).sort((a, b) => a.localeCompare(b));
        return ['All', ...locations];
    }, [tenants]);

    const filteredTenants = (tenants || []).filter((tenant) => {
        if (selectedFilter === 'All') return true;
        return tenant.location?.toLowerCase() === selectedFilter.toLowerCase();
    });

    function renderTenant({ item }: any) {
        return (
            <Pressable
                className="flex-row items-center p-4 rounded-xl mb-3 bg-card active:opacity-70 shadow-sm"
                onPress={() => router.push({ pathname: '/tenant-detail', params: { id: item.id } })}
            >
                <View className={`w-14 h-14 rounded-xl justify-center items-center overflow-hidden bg-white/10`}>
                    <TenantLogo name={item.name} logoUrl={item.logo_url} />
                </View>
                <View className="flex-1 ml-4">
                    <Text className="text-base font-semibold">{item.name}</Text>
                    <Text className="text-sm text-muted-foreground mt-1">
                        {item.industry}
                    </Text>
                    <Text className="text-xs text-muted-foreground mt-1" numberOfLines={1}>
                        {item.description}
                    </Text>
                </View>
                <Feather name="chevron-right" size={20} color={colors.grayMuted} />
            </Pressable>
        );
    }

    return (
        <View className="flex-1">
            {/* Header */}
            <View className="bg-background">
                <TabsLayoutHeader title="Tenants" variant="navy">
                    <View className={`w-full self-center ${isTablet ? 'max-w-[1200px]' : 'max-w-full'}`}>
                        <Text className="text-white/80 text-base mb-6">
                            Discover our innovative partners and residents.
                        </Text>

                        {/* Search Bar */}
                        <View className="flex-row items-center bg-white/10 border border-white/20 h-12 rounded-xl px-4">
                            <Feather name="search" size={20} color={colors.whiteOpacity70} />
                            <TextInput
                                className="flex-1 ml-3 text-base text-white"
                                placeholder="Search tenants..."
                                placeholderTextColor={colors.whiteOpacity50}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                    </View>
                </TabsLayoutHeader>
            </View>

            <View className="px-6 mt-4 flex-1">
                <View>
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={filters}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <Pressable
                                className={`px-4 py-2 rounded-lg mr-3 active:opacity-70 ${selectedFilter === item ? '' : 'bg-white border border-gray-200'}`}
                                style={selectedFilter === item ? { backgroundColor: colors.primary } : {}}
                                onPress={() => setSelectedFilter(item)}
                            >
                                <Text className={`text-sm ${selectedFilter === item ? 'text-white' : 'text-gray-600'}`}>
                                    {item}
                                </Text>
                            </Pressable>
                        )}
                        className="mb-4"
                        contentContainerStyle={{ paddingRight: 24 }}
                    />
                </View>

                {isLoading ? (
                    <Text className="text-center text-muted-foreground mt-10">Loading tenants...</Text>
                ) : error ? (
                    <Text className="text-center text-red-500 mt-10">Error loading tenants.</Text>
                ) : filteredTenants.length === 0 ? (
                    <Text className="text-center text-muted-foreground mt-10">No tenants found.</Text>
                ) : (
                    <FlatList
                        data={filteredTenants}
                        renderItem={renderTenant}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </View>
    );
}
