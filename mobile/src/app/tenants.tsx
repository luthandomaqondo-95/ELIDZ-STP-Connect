import React, { useState } from 'react';
import { View, Pressable, TextInput, FlatList } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { HeaderAvatar } from '@/components/HeaderAvatar';
import { useTenantsSearch } from '@/hooks/useSearch';
import { useDebounce } from '@/hooks/useDebounce';
import { TenantLogo } from '@/components/TenantLogo';

export default function TenantsScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('All');

    // Debounce search query to avoid too many requests
    const debouncedSearch = useDebounce(searchQuery, 300);

    const { data: tenants, isLoading, error } = useTenantsSearch(debouncedSearch);

    const filters = ['All', 'Renewable Energy Centre of Excellence', 'Incubators', 'Analytical Laboratory', 'Design Centre', 'Digital Hub'];

    // Client-side filtering for specific centers if needed, or update hook to support it.
    // Since the hook searches generally, we can filter by center locally if the data is small,
    // or assume the search param covers it. But the UI has a filter bar.
    // Let's filter client side for the 'center' or 'industry' field if 'All' is not selected.
    // Note: The DB data might not have 'center' field populated exactly as the hardcoded filters.
    // We might need to map or just filter by description/industry.
    // The previous code had `tenant.center`. The DB schema has `industry` and `location`.
    // I'll filter by `industry` or `location` or checking if name/description contains the filter.

    const filteredTenants = (tenants || []).filter((tenant) => {
        if (selectedFilter === 'All') return true;
        // Map filters to loose matches in DB fields
        const filterLower = selectedFilter.toLowerCase();
        return (
            tenant.industry?.toLowerCase().includes(filterLower) ||
            tenant.description?.toLowerCase().includes(filterLower) ||
            tenant.location?.toLowerCase().includes(filterLower) ||
            tenant.name.toLowerCase().includes(filterLower)
        );
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
                <Feather name="chevron-right" size={20} color="rgb(153, 153, 158)" />
            </Pressable>
        );
    }

    return (
        <View className="flex-1">
            {/* Header */}
            <LinearGradient
                colors={['#002147', '#003366']}
                className="pt-12 pb-6 px-6 rounded-b-[30px] shadow-lg"
            >
                <View className="flex-row justify-between items-center">
                    <Text className="text-white text-3xl font-bold mb-2">Tenants</Text>
                    <HeaderAvatar />
                </View>
                <Text className="text-white/80 text-base">
                    Discover our innovative partners and residents.
                </Text>

                {/* Search Bar */}
                <View className="flex-row items-center bg-white/10 border border-white/20 h-12 rounded-xl px-4 mt-6 backdrop-blur-sm">
                    <Feather name="search" size={20} color="rgba(255,255,255,0.7)" />
                    <TextInput
                        className="flex-1 ml-3 text-base text-white"
                        placeholder="Search tenants..."
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </LinearGradient>

            <View className="px-6 mt-4 flex-1">
                <View>
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={filters}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <Pressable
                                className={`px-4 py-2 rounded-lg mr-3 active:opacity-70 ${selectedFilter === item ? 'bg-[#002147]' : 'bg-white border border-gray-200'}`}
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
