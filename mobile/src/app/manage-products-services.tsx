import React, { useState, useEffect } from 'react';
import { View, ScrollView, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthContext } from '@/hooks/use-auth-context';
import { smmmeService, SMMEServiceProduct } from '@/services/smme.service';
import { useQueryClient } from '@tanstack/react-query';

export default function ManageProductsServicesScreen() {
    const { profile } = useAuthContext();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);
    const [servicesProducts, setServicesProducts] = useState<{ services: SMMEServiceProduct[]; products: SMMEServiceProduct[] }>({ services: [], products: [] });
    const [loadingList, setLoadingList] = useState(true);

    useEffect(() => {
        if (profile?.id) {
            loadServicesProducts();
        }
    }, [profile?.id]);

    const loadServicesProducts = async () => {
        if (!profile?.id) return;
        setLoadingList(true);
        try {
            const data = await smmmeService.getServicesProductsBySMME(profile.id);
            setServicesProducts(data);
        } catch (error) {
            console.error('Error loading services/products:', error);
            Alert.alert('Error', 'Failed to load products and services');
        } finally {
            setLoadingList(false);
        }
    };

    const handleDelete = async (item: SMMEServiceProduct) => {
        Alert.alert(
            'Delete Item',
            `Are you sure you want to delete "${item.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Update status to inactive instead of deleting
                            const { supabase } = await import('@/lib/supabase');
                            const { error } = await supabase
                                .from('sme_services_products')
                                .update({ status: 'inactive' })
                                .eq('id', item.id);

                            if (error) throw error;
                            
                            Alert.alert('Success', 'Item deleted successfully');
                            loadServicesProducts();
                            queryClient.invalidateQueries({ queryKey: ['businesses'] });
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to delete item');
                        }
                    },
                },
            ]
        );
    };

    return (
        <View className="flex-1 bg-background">
            <LinearGradient
                colors={['#002147', '#003366']}
                className="pt-12 pb-6 px-6 rounded-b-[30px] shadow-lg"
            >
                <View className="flex-row items-center mb-4">
                    <Pressable onPress={() => router.back()} className="p-2 bg-white/10 rounded-full mr-3">
                        <Feather name="arrow-left" size={20} color="white" />
                    </Pressable>
                    <View className="flex-1">
                        <Text className="text-white text-2xl font-bold">Products & Services</Text>
                        <Text className="text-white/80 text-sm mt-1">Manage your business offerings</Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Add New Button */}
                <View className="px-6 mt-6 mb-4">
                    <Pressable
                        className="bg-[#002147] py-4 rounded-xl flex-row items-center justify-center active:opacity-90"
                        onPress={() => router.push('/add-product-service')}
                    >
                        <Feather name="plus" size={20} color="white" />
                        <Text className="text-white font-bold text-base ml-2">Add Product or Service</Text>
                    </Pressable>
                </View>

                {loadingList ? (
                    <View className="items-center py-12">
                        <ActivityIndicator size="large" color="#002147" />
                        <Text className="text-muted-foreground mt-4">Loading...</Text>
                    </View>
                ) : (
                    <View className="px-6">
                        {/* Products Section */}
                        {servicesProducts.products.length > 0 && (
                            <View className="mb-6">
                                <Text className="text-foreground text-lg font-bold mb-3">Products ({servicesProducts.products.length})</Text>
                                {servicesProducts.products.map((product) => (
                                    <View key={product.id} className="bg-card rounded-xl p-4 mb-3 border border-border shadow-sm">
                                        <View className="flex-row items-start justify-between mb-2">
                                            <View className="flex-1">
                                                <Text className="text-foreground font-bold text-base">{product.name}</Text>
                                                <Text className="text-muted-foreground text-sm mt-1">{product.description}</Text>
                                                {product.price && (
                                                    <Text className="text-accent font-bold text-sm mt-1">{product.price}</Text>
                                                )}
                                                <View className="bg-muted self-start px-2 py-1 rounded-md mt-2">
                                                    <Text className="text-foreground text-xs">{product.category}</Text>
                                                </View>
                                            </View>
                                            <Pressable
                                                onPress={() => handleDelete(product)}
                                                className="p-2 bg-destructive/10 rounded-lg ml-2"
                                            >
                                                <Feather name="trash-2" size={18} color="#EF4444" />
                                            </Pressable>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Services Section */}
                        {servicesProducts.services.length > 0 && (
                            <View className="mb-6">
                                <Text className="text-foreground text-lg font-bold mb-3">Services ({servicesProducts.services.length})</Text>
                                {servicesProducts.services.map((service) => (
                                    <View key={service.id} className="bg-card rounded-xl p-4 mb-3 border border-border shadow-sm">
                                        <View className="flex-row items-start justify-between mb-2">
                                            <View className="flex-1">
                                                <Text className="text-foreground font-bold text-base">{service.name}</Text>
                                                <Text className="text-muted-foreground text-sm mt-1">{service.description}</Text>
                                                <View className="bg-muted self-start px-2 py-1 rounded-md mt-2">
                                                    <Text className="text-foreground text-xs">{service.category}</Text>
                                                </View>
                                            </View>
                                            <Pressable
                                                onPress={() => handleDelete(service)}
                                                className="p-2 bg-destructive/10 rounded-lg ml-2"
                                            >
                                                <Feather name="trash-2" size={18} color="#EF4444" />
                                            </Pressable>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Empty State */}
                        {servicesProducts.products.length === 0 && servicesProducts.services.length === 0 && (
                            <View className="items-center py-12 bg-card rounded-2xl border border-border border-dashed">
                                <Feather name="package" size={48} color="#CBD5E0" />
                                <Text className="text-muted-foreground text-base mt-4 text-center font-medium">
                                    No products or services listed yet
                                </Text>
                                <Text className="text-muted-foreground text-sm mt-2 text-center">
                                    Add your offerings to appear in the verified SMMEs directory
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

