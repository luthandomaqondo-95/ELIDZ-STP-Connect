import React, { useState } from 'react';
import { View, Pressable, TextInput, ScrollView, Image } from 'react-native';
import { Text } from '@/components/ui/text';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthContext } from '@/hooks/use-auth-context';
import { SMMEWithServicesProducts, SMMEServiceProduct } from '@/services/smme.service';
import { TenantLogo } from '@/components/TenantLogo';
import { useBusinessSearch } from '@/hooks/useSearch';
import { useDebounce } from '@/hooks/useDebounce';

interface Product {
    id: string;
    name: string;
    description: string;
    category: string;
    price?: string;
}

interface Service {
    id: string;
    name: string;
    description: string;
    category: string;
}

interface SMME {
    id: string;
    name: string;
    industry: string;
    sector: string;
    location: string;
    description: string;
    logo?: any;
    logo_url?: string;
    verified: boolean;
    bbbee?: string;
    contact?: {
        email?: string;
        phone?: string;
        website?: string;
    };
    products: Product[];
    services: Service[];
}

// Map database SMME to SMME interface
function mapSMMEToSMME(smmme: SMMEWithServicesProducts): SMME {
    // Get contact info from first service/product if available
    const firstItem = [...smmme.services, ...smmme.products][0];
    const contactEmail = firstItem?.contact_email || smmme.email;
    const contactPhone = firstItem?.contact_phone;
    const website = firstItem?.website_url;

    // Determine industry from organization or services/products
    let industry = smmme.organization || 'General';
    if (smmme.services.length > 0 || smmme.products.length > 0) {
        const categories = [...smmme.services.map(s => s.category), ...smmme.products.map(p => p.category)];
        if (categories.some(cat => cat?.toLowerCase().includes('software') || cat?.toLowerCase().includes('development'))) {
            industry = 'Technology';
        } else if (categories.some(cat => cat?.toLowerCase().includes('design'))) {
            industry = 'Design';
        } else if (categories.some(cat => cat?.toLowerCase().includes('manufacturing') || cat?.toLowerCase().includes('hardware'))) {
            industry = 'Manufacturing';
        } else if (categories.some(cat => cat?.toLowerCase().includes('agriculture') || cat?.toLowerCase().includes('food'))) {
            industry = 'Agriculture';
        } else if (categories.some(cat => cat?.toLowerCase().includes('education') || cat?.toLowerCase().includes('training'))) {
            industry = 'Education';
        }
    }

    return {
        id: smmme.id,
        name: smmme.name,
        industry: industry,
        sector: smmme.organization || industry,
        location: 'ELIDZ STP',
        description: smmme.bio || smmme.organization || 'Verified SMME partner',
        logo_url: smmme.avatar !== 'blue' ? smmme.avatar : undefined, // Assuming avatar might be a URL or 'blue'
        verified: true, // Only verified SMMEs are returned by the service
        bbbee: undefined, // Can be added to profiles table later
        contact: {
            email: contactEmail,
            phone: contactPhone,
            website: website,
        },
        products: smmme.products.map((p: SMMEServiceProduct) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            category: p.category,
            price: p.price,
        })),
        services: smmme.services.map((s: SMMEServiceProduct) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            category: s.category,
        })),
    };
}

export default function VerifiedSMMEsScreen() {
    const { profile: user } = useAuthContext();
    const isSMME = user?.role === 'SMME';
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [expandedSMME, setExpandedSMME] = useState<string | null>(null);

    const debouncedSearch = useDebounce(searchQuery, 300);

    // Use the search hook
    const { data: smmmes, isLoading: loading } = useBusinessSearch(debouncedSearch);

    const verifiedSMMEs = React.useMemo(() => {
        return (smmmes || []).map(mapSMMEToSMME);
    }, [smmmes]);

    // Categories for filtering - extract unique industries from loaded SMMEs
    const categories = React.useMemo(() => {
        const industries = new Set<string>();
        verifiedSMMEs.forEach(smme => {
            if (smme.industry) {
                industries.add(smme.industry);
            }
        });
        return ['All', ...Array.from(industries).sort()];
    }, [verifiedSMMEs]);

    // Filter SMMEs based on category (Search is handled by hook, but we might need to filter locally too if search didn't cover deep fields)
    // Since our hook only searches profile fields, we might miss product matches.
    // For now, let's assume the hook returns what we need, and we filter by category locally.
    const filteredSMMEs = React.useMemo(() => {
        return verifiedSMMEs.filter((smme) => {
            const matchesCategory =
                selectedCategory === 'All' || smme.industry === selectedCategory;
            return matchesCategory;
        });
    }, [verifiedSMMEs, selectedCategory]);

    const toggleExpand = (smmeId: string) => {
        setExpandedSMME(expandedSMME === smmeId ? null : smmeId);
    };

    return (
        <View className="flex-1 bg-background">
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Header */}
                <LinearGradient
                    colors={['#002147', '#003366']}
                    className="pt-12 pb-6 px-6 rounded-b-[30px] shadow-lg"
                >
                    <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-1">
                            <Text className="text-white text-3xl font-bold mb-2">Verified SMMEs</Text>
                            <Text className="text-white/80 text-base">
                                Discover verified partners and their services.
                            </Text>
                        </View>
                        {isSMME && (
                            <Pressable
                                className="bg-white/20 border border-white/30 px-4 py-2 rounded-xl active:opacity-80 ml-4"
                                onPress={() => router.push('/add-product-service')}
                            >
                                <View className="flex-row items-center">
                                    <Feather name="plus" size={16} color="white" />
                                    <Text className="text-white text-sm font-semibold ml-2">Post</Text>
                                </View>
                            </Pressable>
                        )}
                    </View>

                    {/* Search Bar */}
                    <View className="flex-row items-center bg-white/10 border border-white/20 h-12 rounded-xl px-4 mt-6 backdrop-blur-sm">
                        <Feather name="search" size={20} color="rgba(255,255,255,0.7)" />
                        <TextInput
                            className="flex-1 ml-3 text-base text-white"
                            placeholder="Search SMMEs, products..."
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </LinearGradient>

                {/* Category Filters */}
                <View className="mt-6 mb-2">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
                        {categories.map((category) => (
                            <Pressable
                                key={category}
                                className={`px-5 py-2.5 rounded-full border mr-3 shadow-sm ${selectedCategory === category
                                        ? 'bg-[#002147] border-[#002147]'
                                        : 'bg-card border-border'
                                    }`}
                                onPress={() => setSelectedCategory(category)}
                            >
                                <Text className={`text-sm font-semibold ${selectedCategory === category ? 'text-white' : 'text-foreground'
                                    }`}>
                                    {category}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>

                {/* Results Count */}
                <View className="mx-5 mb-4 mt-2">
                    {loading ? (
                        <Text className="text-base font-semibold text-foreground">Loading...</Text>
                    ) : (
                        <Text className="text-base font-semibold text-foreground">
                            {filteredSMMEs.length} Verified Partner{filteredSMMEs.length !== 1 ? 's' : ''}
                        </Text>
                    )}
                </View>

                {/* Loading State */}
                {loading && (
                    <View className="mx-5">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <View key={index} className="bg-card mb-4 rounded-2xl border border-border shadow-sm p-4">
                                <View className="flex-row items-start">
                                    <View className="w-14 h-14 rounded-xl bg-gray-200 animate-pulse" />
                                    <View className="flex-1 ml-4">
                                        <View className="h-5 bg-gray-200 rounded mb-2 w-3/4 animate-pulse" />
                                        <View className="h-4 bg-gray-200 rounded mb-2 w-1/2 animate-pulse" />
                                        <View className="h-3 bg-gray-200 rounded w-full animate-pulse" />
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* SMMEs List */}
                {!loading && (
                    <View className="mx-5">
                        {filteredSMMEs.map((smme) => {
                            const isExpanded = expandedSMME === smme.id;

                            return (
                                <View
                                    key={smme.id}
                                    className="bg-card mb-4 rounded-2xl border border-border shadow-sm overflow-hidden"
                                >
                                    {/* SMME Header */}
                                    <Pressable
                                        className="p-4 active:opacity-95"
                                        onPress={() => toggleExpand(smme.id)}
                                    >
                                        <View className="flex-row items-start">
                                            {/* Logo */}
                                            <View className="w-14 h-14 rounded-xl justify-center items-center overflow-hidden bg-[#002147]/5 border border-[#002147]/10">
                                                <TenantLogo name={smme.name} logoUrl={smme.logo_url} />
                                            </View>

                                            {/* Info */}
                                            <View className="flex-1 ml-4">
                                                <View className="flex-row items-center justify-between mb-1">
                                                    <Text className="text-base font-bold text-foreground flex-1 mr-2" numberOfLines={1}>
                                                        {smme.name}
                                                    </Text>
                                                    <Feather
                                                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                                        size={20}
                                                        color="#CBD5E0"
                                                    />
                                                </View>

                                                <View className="flex-row items-center mb-2 flex-wrap">
                                                    <View className="bg-green-50 px-2 py-0.5 rounded-md mr-2 mb-1 flex-row items-center border border-green-100">
                                                        <Feather name="shield" size={10} color="#28A745" className="mr-1" />
                                                        <Text className="text-green-700 text-[10px] font-bold uppercase">Verified</Text>
                                                    </View>
                                                    {smme.bbbee && (
                                                        <View className="bg-[#FF6600]/10 px-2 py-0.5 rounded-md mb-1 border border-[#FF6600]/20">
                                                            <Text className="text-[#FF6600] text-[10px] font-bold">B-BBEE {smme.bbbee}</Text>
                                                        </View>
                                                    )}
                                                </View>

                                                <Text className="text-muted-foreground text-xs" numberOfLines={2}>
                                                    {smme.description}
                                                </Text>
                                            </View>
                                        </View>
                                    </Pressable>

                                    {/* Expanded Content */}
                                    {isExpanded && (
                                        <View className="px-4 pb-5 border-t border-gray-100 bg-gray-50/50">
                                            {/* Contact Information */}
                                            {smme.contact && (
                                                <View className="mt-4 p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
                                                    <Text className="text-xs font-bold text-[#002147] mb-2 uppercase tracking-wide">
                                                        Contact Information
                                                    </Text>
                                                    {smme.contact.email && (
                                                        <View className="flex-row items-center mb-1.5">
                                                            <Feather name="mail" size={12} color="#6C757D" />
                                                            <Text className="text-gray-600 text-xs ml-2 font-medium">
                                                                {smme.contact.email}
                                                            </Text>
                                                        </View>
                                                    )}
                                                    {smme.contact.phone && (
                                                        <View className="flex-row items-center mb-1.5">
                                                            <Feather name="phone" size={12} color="#6C757D" />
                                                            <Text className="text-gray-600 text-xs ml-2 font-medium">
                                                                {smme.contact.phone}
                                                            </Text>
                                                        </View>
                                                    )}
                                                    {smme.contact.website && (
                                                        <View className="flex-row items-center">
                                                            <Feather name="globe" size={12} color="#6C757D" />
                                                            <Text className="text-gray-600 text-xs ml-2 font-medium">
                                                                {smme.contact.website}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                            )}

                                            {/* Products Section - Preview */}
                                            <View className="mt-5">
                                                <View className="flex-row items-center mb-3">
                                                    <Feather name="package" size={16} color="#002147" />
                                                    <Text className="text-sm font-bold ml-2 text-[#002147]">
                                                        Products
                                                    </Text>
                                                    <View className="bg-[#002147]/10 px-2 py-0.5 rounded-full ml-2">
                                                        <Text className="text-[#002147] text-[10px] font-bold">{smme.products.length}</Text>
                                                    </View>
                                                </View>
                                                {smme.products.slice(0, 2).map((product) => (
                                                    <View
                                                        key={product.id}
                                                        className="p-3 mb-2 rounded-xl bg-white border border-gray-100 shadow-sm"
                                                    >
                                                        <View className="flex-row items-start justify-between mb-1">
                                                            <Text className="text-sm font-bold flex-1 text-gray-800">
                                                                {product.name}
                                                            </Text>
                                                            {product.price && (
                                                                <Text className="text-[#FF6600] text-xs font-bold ml-2">
                                                                    {product.price}
                                                                </Text>
                                                            )}
                                                        </View>
                                                        <Text className="text-gray-500 text-xs mb-2 leading-relaxed" numberOfLines={2}>
                                                            {product.description}
                                                        </Text>
                                                        <View className="bg-gray-100 self-start px-2 py-0.5 rounded-md">
                                                            <Text className="text-gray-500 text-[10px] font-medium">{product.category}</Text>
                                                        </View>
                                                    </View>
                                                ))}
                                                {smme.products.length > 2 && (
                                                    <Text className="text-xs text-gray-400 text-center mt-1 italic">
                                                        +{smme.products.length - 2} more products available in full profile
                                                    </Text>
                                                )}
                                            </View>

                                            {/* Services Section - Preview */}
                                            <View className="mt-5">
                                                <View className="flex-row items-center mb-3">
                                                    <Feather name="briefcase" size={16} color="#002147" />
                                                    <Text className="text-sm font-bold ml-2 text-[#002147]">
                                                        Services
                                                    </Text>
                                                    <View className="bg-[#002147]/10 px-2 py-0.5 rounded-full ml-2">
                                                        <Text className="text-[#002147] text-[10px] font-bold">{smme.services.length}</Text>
                                                    </View>
                                                </View>
                                                {smme.services.slice(0, 2).map((service) => (
                                                    <View
                                                        key={service.id}
                                                        className="p-3 mb-2 rounded-xl bg-white border border-gray-100 shadow-sm"
                                                    >
                                                        <View className="flex-row items-center justify-between mb-1">
                                                            <Text className="text-sm font-bold flex-1 text-gray-800">
                                                                {service.name}
                                                            </Text>
                                                        </View>
                                                        <Text className="text-gray-500 text-xs mb-2 leading-relaxed" numberOfLines={2}>
                                                            {service.description}
                                                        </Text>
                                                        <View className="bg-gray-100 self-start px-2 py-0.5 rounded-md">
                                                            <Text className="text-gray-500 text-[10px] font-medium">{service.category}</Text>
                                                        </View>
                                                    </View>
                                                ))}
                                                {smme.services.length > 2 && (
                                                    <Text className="text-xs text-gray-400 text-center mt-1 italic">
                                                        +{smme.services.length - 2} more services available in full profile
                                                    </Text>
                                                )}
                                            </View>

                                            {/* Action Button */}
                                            <Pressable
                                                className="mt-6 py-3 rounded-xl bg-[#002147] active:opacity-90 shadow-md flex-row justify-center items-center"
                                                onPress={() => router.push(`/user-profile?id=${smme.id}`)}
                                            >
                                                <Text className="text-white font-bold text-sm mr-2">
                                                    View Profile & Connect
                                                </Text>
                                                <Feather name="arrow-right" size={16} color="white" />
                                            </Pressable>
                                        </View>
                                    )}
                                </View>
                            );
                        })}

                        {/* Empty State */}
                        {filteredSMMEs.length === 0 && (
                            <View className="items-center py-12 mx-6 bg-white rounded-2xl border border-gray-100 border-dashed">
                                <Feather name="search" size={48} color="#CBD5E0" />
                                <Text className="text-gray-400 text-base mt-4 text-center font-medium">
                                    {searchQuery || selectedCategory !== 'All'
                                        ? 'No verified SMMEs found matching your search'
                                        : 'No verified SMMEs found. Be the first to post!'}
                                </Text>
                                {(searchQuery || selectedCategory !== 'All') && (
                                    <Pressable
                                        className="mt-4 active:opacity-70"
                                        onPress={() => {
                                            setSearchQuery('');
                                            setSelectedCategory('All');
                                        }}
                                    >
                                        <Text className="text-[#FF6600] text-sm font-bold">
                                            Clear filters
                                        </Text>
                                    </Pressable>
                                )}
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
