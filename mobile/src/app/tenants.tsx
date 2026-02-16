import React, { useMemo, useState } from 'react';
import { View, Pressable, TextInput, FlatList , Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Feather } from '@expo/vector-icons';
import { HeaderAvatar } from '@/components/HeaderAvatar';
import { HeaderNotificationIcon } from '@/components/HeaderNotificationIcon';
import { useColorScheme } from '@/hooks/use-theme-color';
import { COLORS } from '@/theme/colors';
import { useTenantsSearch } from '@/hooks/useSearch';
import { useDebounce } from '@/hooks/useDebounce';
import { TenantLogo } from '@/components/TenantLogo';

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
            <View className="pt-12 pb-6 px-6">
                <View className={`w-full self-center ${isTablet ? 'max-w-[1200px]' : 'max-w-full'}`}>
                    <View className="flex-row items-center justify-end mb-2">
                        <HeaderNotificationIcon />
                        <HeaderAvatar />
                    </View>
                    <View className="items-start mb-2">
                        <Text className={`text-foreground font-semibold ${isTablet ? 'text-[22px]' : 'text-xl'}`}>
                            Tenants
                        </Text>
                        <Text className="text-muted-foreground text-sm">
                            Discover our innovative partners and residents.
                        </Text>
                    </View>
                </View>

                {/* Search Bar */}
                <View className={`flex-row items-center bg-muted/50 border border-border h-12 rounded-xl px-4 mt-6 w-full self-center ${isTablet ? 'max-w-[1200px]' : 'max-w-full'}`}>
                    <Feather name="search" size={20} color="#9CA3AF" />
                    <TextInput
                        className="flex-1 ml-3 text-base text-foreground"
                        placeholder="Search tenants..."
                        placeholderTextColor="#D1D5DB"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
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
