import React, { useState, useCallback, useMemo } from 'react';
import { View, Pressable, TextInput, Dimensions, FlatList } from 'react-native';
import { Text } from '@/components/ui/text';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SMMEWithServicesProducts, SMMEServiceProduct } from '@/services/smme.service';
import { TenantLogo } from '@/components/TenantLogo';
import { TabsLayoutHeader } from '@/components/Header';
import { useBusinessSearch } from '@/hooks/useSearch';
import { useDebounce } from '@/hooks/useDebounce';
import { useColorScheme } from '@/hooks/use-theme-color';
import { COLORS } from '@/theme/colors';
import { ListSkeleton } from '@/components/Loading';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

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

interface SMMECardProps {
    smme: SMME;
    colors: any;
    onPress: () => void;
}

const SMMECard = React.memo(({ smme, colors, onPress }: SMMECardProps) => (
    <Pressable
        className="bg-card mb-2 rounded-xl border border-border shadow-sm overflow-hidden active:opacity-95"
        onPress={onPress}
    >
        <View className="flex-row items-center px-3 py-2.5">
            {/* Logo */}
            <View className="w-10 h-10 rounded-xl justify-center items-center overflow-hidden bg-primary/5 border border-primary/10">
                <TenantLogo name={smme.name} logoUrl={smme.logo_url} />
            </View>

            {/* Info */}
            <View className="flex-1 ml-2.5">
                <View className="flex-row items-center justify-between mb-0.5">
                    <Text className="text-sm font-bold text-foreground flex-1 mr-2" numberOfLines={1}>
                        {smme.name}
                    </Text>
                </View>

                {smme.bbbee ? (
                    <View className="flex-row items-center mb-0.5">
                        <View className="bg-accent/10 px-1.5 py-0.5 rounded-md border border-accent/20">
                            <Text className="text-accent text-[10px] font-bold">B-BBEE {smme.bbbee}</Text>
                        </View>
                    </View>
                ) : null}

                <Text className="text-muted-foreground text-[11px]" numberOfLines={1}>
                    {smme.description}
                </Text>
            </View>

            <Feather name="chevron-right" size={16} color={colors.iconGrayDark || colors.grayMuted} />
        </View>
    </Pressable>
));

SMMECard.displayName = 'SMMECard';

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
    const { colorScheme } = useColorScheme();
    const colors = COLORS[colorScheme];
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const debouncedSearch = useDebounce(searchQuery, 300);

    // Use the search hook
    const { data: smmmes, isLoading: loading } = useBusinessSearch(debouncedSearch);

    const verifiedSMMEs = useMemo(() => {
        return (smmmes || []).map(mapSMMEToSMME);
    }, [smmmes]);

    // Categories for filtering - extract unique industries from loaded SMMEs
    const categories = useMemo(() => {
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
    const filteredSMMEs = useMemo(() => {
        return verifiedSMMEs.filter((smme) => {
            const matchesCategory =
                selectedCategory === 'All' || smme.industry === selectedCategory;
            return matchesCategory;
        });
    }, [verifiedSMMEs, selectedCategory]);

    const handlePressSMME = useCallback((id: string) => {
        router.push(`/user-profile?id=${id}`);
    }, []);

    const renderSMMEItem = useCallback(
        ({ item }: { item: SMME }) => (
            <SMMECard smme={item} colors={colors} onPress={() => handlePressSMME(item.id)} />
        ),
        [colors, handlePressSMME]
    );

    const renderCategoryItem = useCallback(
        ({ item }: { item: string }) => (
            <Pressable
                className={`px-5 py-2.5 rounded-full border mr-3 shadow-sm ${
                    selectedCategory === item ? 'bg-primary border-primary' : 'bg-card border-border'
                }`}
                onPress={() => setSelectedCategory(item)}
            >
                <Text
                    className={`text-sm font-semibold ${
                        selectedCategory === item ? 'text-white' : 'text-foreground'
                    }`}
                >
                    {item}
                </Text>
            </Pressable>
        ),
        [selectedCategory]
    );

    const keyExtractor = useCallback((item: SMME) => item.id, []);
    const categoryKeyExtractor = useCallback((item: string) => item, []);

    return (
        <View className="flex-1 bg-background">
            <FlatList
                data={filteredSMMEs}
                keyExtractor={keyExtractor}
                renderItem={renderSMMEItem}
                contentContainerStyle={{ paddingBottom: 40 }}
                ListHeaderComponent={
                    <>
                        {/* Header */}
                        <View className="bg-background">
                            <TabsLayoutHeader title="Verified SMMEs" variant="navy">
                                <View
                                    style={{
                                        maxWidth: isTablet ? 1200 : '100%',
                                        alignSelf: 'center',
                                        width: '100%',
                                    }}
                                >
                                    <Text className="text-white/80 text-base mb-6">
                                        Discover verified partners and their services.
                                    </Text>

                                    {/* Search Bar */}
                                    <View className="flex-row items-center bg-white/10 border border-white/20 h-12 rounded-full px-4">
                                        <Feather name="search" size={20} color={colors.whiteOpacity70} />
                                        <TextInput
                                            className="flex-1 ml-3 text-base text-white"
                                            placeholder="Search SMMEs, products..."
                                            placeholderTextColor={colors.whiteOpacity50}
                                            value={searchQuery}
                                            onChangeText={setSearchQuery}
                                        />
                                    </View>
                                </View>
                            </TabsLayoutHeader>
                        </View>

                        {/* Category Filters */}
                        <View
                            className="mt-6 mb-2"
                            style={{
                                paddingHorizontal: isTablet ? 24 : 20,
                                maxWidth: isTablet ? 1200 : '100%',
                                alignSelf: 'center',
                                width: '100%',
                            }}
                        >
                            <FlatList
                                horizontal
                                data={categories}
                                keyExtractor={categoryKeyExtractor}
                                renderItem={renderCategoryItem}
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingHorizontal: isTablet ? 0 : 0 }}
                            />
                        </View>

                        {/* Results Count */}
                        <View
                            className="mb-4 mt-2"
                            style={{
                                paddingHorizontal: isTablet ? 24 : 20,
                                maxWidth: isTablet ? 1200 : '100%',
                                alignSelf: 'center',
                                width: '100%',
                            }}
                        >
                            {loading ? (
                                <Text className="text-base font-semibold text-foreground">Loading...</Text>
                            ) : (
                                <Text className="text-base font-semibold text-foreground">
                                    {filteredSMMEs.length} Verified Partner
                                    {filteredSMMEs.length !== 1 ? 's' : ''}
                                </Text>
                            )}
                        </View>

                        {/* Loading State */}
                        {loading && (
                            <View
                                style={{
                                    paddingHorizontal: isTablet ? 24 : 20,
                                    maxWidth: isTablet ? 1200 : '100%',
                                    alignSelf: 'center',
                                    width: '100%',
                                }}
                            >
                                <ListSkeleton count={3} />
                            </View>
                        )}
                    </>
                }
                ListEmptyComponent={
                    !loading ? (
                        <View
                            style={{
                                paddingHorizontal: isTablet ? 24 : 20,
                                maxWidth: isTablet ? 1200 : '100%',
                                alignSelf: 'center',
                                width: '100%',
                            }}
                        >
                            <View className="items-center py-12 mx-6 bg-card rounded-2xl border border-border border-dashed">
                                <Feather name="search" size={48} color={colors.iconGray} />
                                <Text className="text-muted-foreground text-base mt-4 text-center font-medium">
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
                                        <Text className="text-accent text-sm font-bold">Clear filters</Text>
                                    </Pressable>
                                )}
                            </View>
                        </View>
                    ) : null
                }
            />
        </View>
    );
}
