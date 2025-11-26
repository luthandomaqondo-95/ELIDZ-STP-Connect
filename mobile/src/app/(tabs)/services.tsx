import React, { useState } from 'react';
import { View, Pressable, TextInput, ScrollView, Image } from 'react-native';
import { Text } from '@/components/ui/text';
import { useAuthContext } from '@/hooks/use-auth-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { HeaderAvatar } from '@/components/HeaderAvatar';
import { useOpportunitiesSearch, useFacilitiesSearch, useResourcesSearch } from '@/hooks/useSearch';
import { useDebounce } from '@/hooks/useDebounce';

export default function ServicesScreen() {
    const { isLoggedIn } = useAuthContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const debouncedSearch = useDebounce(searchQuery, 300);

    // Fetch data using hooks
    const { data: fundingOpportunitiesRaw, isLoading: loadingFunding } = useOpportunitiesSearch(debouncedSearch, 'Funding');
    const { data: facilitiesDataRaw, isLoading: loadingFacilities } = useFacilitiesSearch(debouncedSearch);
    const { data: resourcesRaw, isLoading: loadingResources } = useResourcesSearch(debouncedSearch);

    const fundingOpportunities = fundingOpportunitiesRaw || [];
    const facilitiesData = facilitiesDataRaw || [];
    const resources = resourcesRaw || [];

    const loading = loadingFunding || loadingFacilities || loadingResources;

    // Map facilities data to display format
    const productLines = facilitiesData.map((tenant: any) => ({
        id: tenant.id,
        name: tenant.name,
        type: 'Facility',
        sector: tenant.industry || 'Innovation',
        location: tenant.location || 'ELIDZ STP',
        description: tenant.description || 'Innovation center at ELIDZ STP.',
        image: require('../../../assets/images/connect-solve.png'), // Placeholder or mapped image
        icon: 'briefcase', // Default icon
        services: ['Innovation Services', 'Consulting', 'Support'], // Placeholder services
    }));

    const categories = ['All', 'Funding', 'Facilities', 'Resources'];

    const renderSectionHeader = (title: string, action?: () => void) => (
        <View className="flex-row justify-between items-center mb-4 mt-6 px-6">
            <Text className="text-xl font-bold text-[#002147] tracking-tight">{title}</Text>
            {action && (
                <Pressable onPress={action}>
                    <Text className="text-[#FF6600] text-sm font-semibold">View All</Text>
                </Pressable>
            )}
        </View>
    );

    const renderFundingCard = (item: any) => (
        <Pressable
            key={item.id}
            className="bg-white mx-6 mb-4 p-4 rounded-2xl border border-gray-100 shadow-sm active:opacity-95"
            onPress={() => router.push({ pathname: '/opportunity-detail', params: { id: item.id } })}
        >
            <View className="flex-row justify-between items-start mb-2">
                <View className="bg-green-50 px-3 py-1 rounded-full">
                    <Text className="text-green-700 text-xs font-bold uppercase">Funding</Text>
                </View>
                <Text className="text-gray-400 text-xs">{item.deadline ? new Date(item.deadline).toLocaleDateString() : 'No deadline'}</Text>
            </View>
            <Text className="text-[#002147] text-lg font-bold mb-1 leading-tight">{item.title}</Text>
            <Text className="text-gray-500 text-sm mb-4" numberOfLines={2}>{item.description}</Text>

            <View className="flex-row items-center justify-between border-t border-gray-50 pt-3">
                <Text className="text-gray-500 text-xs font-medium">{item.org}</Text>
                <View className="flex-row items-center">
                    <Text className="text-[#FF6600] text-sm font-bold mr-1">Apply Now</Text>
                    <Feather name="arrow-right" size={16} color="#FF6600" />
                </View>
            </View>
        </Pressable>
    );

    const renderFacilityCard = (item: any) => (
        <Pressable
            key={item.id}
            className="bg-white mx-6 mb-4 rounded-2xl border border-gray-100 shadow-sm overflow-hidden active:opacity-95"
            onPress={() => router.push({ pathname: '/center-detail', params: { name: item.name } })}
        >
            <View className="h-32 bg-gray-100 relative">
                <Image
                    source={item.image}
                    className="w-full h-full"
                    resizeMode="cover"
                />
                <View className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
                <View className="absolute bottom-3 left-3 flex-row items-center">
                    <View className="bg-white/20 p-1.5 rounded-lg backdrop-blur-md mr-2">
                        <Feather name={item.icon as any || 'briefcase'} size={14} color="white" />
                    </View>
                    <Text className="text-white font-bold shadow-sm">{item.sector}</Text>
                </View>
            </View>
            <View className="p-4">
                <Text className="text-[#002147] text-lg font-bold mb-1">{item.name}</Text>
                <Text className="text-gray-500 text-sm mb-3" numberOfLines={2}>{item.description}</Text>
                <View className="flex-row flex-wrap">
                    {item.services.slice(0, 2).map((s: string, i: number) => (
                        <View key={i} className="bg-blue-50 px-2 py-1 rounded-md mr-2 mb-1">
                            <Text className="text-[#002147] text-[10px] font-medium">{s}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </Pressable>
    );

    const renderResourceCard = (item: any) => (
        <Pressable
            key={item.id}
            className="bg-white mx-6 mb-3 p-4 rounded-xl border border-gray-100 shadow-sm flex-row items-center active:opacity-95"
            onPress={() => router.push({ pathname: '/resources', params: item.targetCategory ? { category: item.targetCategory } : undefined })}
        >
            <View className="w-12 h-12 rounded-full bg-[#002147]/5 justify-center items-center mr-4">
                <Feather name={item.icon as any || 'file'} size={20} color="#002147" />
            </View>
            <View className="flex-1">
                <Text className="text-[#002147] text-base font-bold mb-0.5">{item.name}</Text>
                <Text className="text-gray-500 text-xs">{item.description}</Text>
            </View>
            <View className="bg-[#FF6600]/10 px-2.5 py-1 rounded-lg">
                <Text className="text-[#FF6600] text-xs font-bold">{item.available || '0'} Left</Text>
            </View>
        </Pressable>
    );

    return (
        <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Header */}
            <LinearGradient
                colors={['#002147', '#003366']}
                className="pt-12 pb-6 px-6 rounded-b-[30px] shadow-lg"
            >
                <View className="flex-row justify-between items-center">
                    <Text className="text-white text-3xl font-bold mb-2">Services</Text>
                    <HeaderAvatar />
                </View>
                <Text className="text-white/80 text-base">
                    Access world-class facilities and funding opportunities.
                </Text>

                {/* Search Bar */}
                <View className="flex-row items-center bg-white/10 border border-white/20 h-12 rounded-xl px-4 mt-6 backdrop-blur-sm">
                    <Feather name="search" size={20} color="rgba(255,255,255,0.7)" />
                    <TextInput
                        className="flex-1 ml-3 text-base text-white"
                        placeholder="Search services..."
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </LinearGradient>

            {/* Categories */}
            <View className="mt-6 mb-2">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
                    {categories.map((category) => (
                        <Pressable
                            key={category}
                            className={`px-5 py-2.5 rounded-full border mr-3 shadow-sm ${selectedCategory === category
                                ? 'bg-[#002147] border-[#002147]'
                                : 'bg-white border-gray-200'
                                }`}
                            onPress={() => setSelectedCategory(category)}
                        >
                            <Text className={`text-sm font-semibold ${selectedCategory === category ? 'text-white' : 'text-gray-600'
                                }`}>
                                {category}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            {loading ? (
                <Text className="text-center text-gray-500 mt-10">Loading services...</Text>
            ) : (
                <View>
                    {/* Content - ALL */}
                    {selectedCategory === 'All' && !searchQuery && (
                        <>
                            {/* Funding Section */}
                            {fundingOpportunities && fundingOpportunities.length > 0 && (
                                <>
                                    {renderSectionHeader('Funding Opportunities', () => setSelectedCategory('Funding'))}
                                    {fundingOpportunities.slice(0, 2).map(renderFundingCard)}
                                </>
                            )}

                            {/* Facilities Section */}
                            {productLines && productLines.length > 0 && (
                                <>
                                    {renderSectionHeader('Centers of Excellence', () => setSelectedCategory('Facilities'))}
                                    {productLines.slice(0, 2).map(renderFacilityCard)}
                                </>
                            )}

                            {/* Resources Section */}
                            {resources && resources.length > 0 && (
                                <>
                                    {renderSectionHeader('Available Resources', () => setSelectedCategory('Resources'))}
                                    {resources.map(renderResourceCard)}
                                </>
                            )}
                        </>
                    )}

                    {/* Filtered Content */}
                    {(selectedCategory !== 'All' || searchQuery) && (
                        <View className="mt-4">
                            {(selectedCategory === 'All' || selectedCategory === 'Funding') && fundingOpportunities?.length > 0 && (
                                <>
                                    {searchQuery && <Text className="px-6 mb-2 text-gray-500 font-medium">Funding</Text>}
                                    {fundingOpportunities.map(renderFundingCard)}
                                </>
                            )}

                            {(selectedCategory === 'All' || selectedCategory === 'Facilities') && productLines?.length > 0 && (
                                <>
                                    {searchQuery && <Text className="px-6 mb-2 mt-4 text-gray-500 font-medium">Facilities</Text>}
                                    {productLines.map(renderFacilityCard)}
                                </>
                            )}

                            {(selectedCategory === 'All' || selectedCategory === 'Resources') && resources?.length > 0 && (
                                <>
                                    {searchQuery && <Text className="px-6 mb-2 mt-4 text-gray-500 font-medium">Resources</Text>}
                                    {resources.map(renderResourceCard)}
                                </>
                            )}

                            {/* Empty State */}
                            {((!fundingOpportunities?.length && !productLines?.length && !resources?.length)) && (
                                <View className="items-center py-12 px-6">
                                    <Feather name="search" size={48} color="#CBD5E0" />
                                    <Text className="text-gray-400 text-base mt-4 text-center font-medium">
                                        No results found for "{searchQuery}"
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            )}

            {/* CTA for Guests */}
            {!isLoggedIn && (
                <View className="mx-6 mt-6 mb-6 p-5 rounded-2xl bg-white border border-[#002147]/10 shadow-sm">
                    <View className="flex-row items-center mb-3">
                        <View className="bg-[#FF6600]/10 p-2 rounded-full mr-3">
                            <Feather name="lock" size={18} color="#FF6600" />
                        </View>
                        <Text className="text-[#002147] text-lg font-bold">
                            Unlock Full Access
                        </Text>
                    </View>
                    <Text className="text-gray-500 text-sm mb-5 leading-relaxed">
                        Create an account to apply for funding, book resources, and connect with partners.
                    </Text>
                    <Pressable
                        className="bg-[#002147] py-3 px-6 rounded-xl items-center active:opacity-90"
                        onPress={() => router.push('/(auth)/auth-choice')}
                    >
                        <Text className="text-white font-bold">
                            Sign Up Now
                        </Text>
                    </Pressable>
                </View>
            )}
        </ScrollView>
    );
}
