import React, { useState } from 'react';
import { View, ScrollView, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthContext } from '@/hooks/use-auth-context';
import { smmmeService } from '@/services/smme.service';
import { useQueryClient } from '@tanstack/react-query';
import { Picker } from '@react-native-picker/picker';

export default function AddProductServiceScreen() {
    const { profile } = useAuthContext();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState<'Service' | 'Product'>('Service');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');

    const categories = [
        'Technology',
        'Manufacturing',
        'Agriculture',
        'Food & Beverage',
        'Retail',
        'Healthcare',
        'Education',
        'Construction',
        'Transportation',
        'Energy',
        'Other',
    ];

    const handleSubmit = async () => {
        if (!name.trim() || !description.trim() || !category.trim()) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        if (!profile?.id) {
            Alert.alert('Error', 'User not authenticated');
            return;
        }

        setLoading(true);
        try {
            await smmmeService.createServiceProduct(profile.id, {
                type,
                name: name.trim(),
                description: description.trim(),
                category: category.trim(),
                price: price.trim() || undefined,
                contact_email: contactEmail.trim() || undefined,
                contact_phone: contactPhone.trim() || undefined,
                website_url: websiteUrl.trim() || undefined,
            });

            Alert.alert('Success', `${type} added successfully!`, [
                {
                    text: 'OK',
                    onPress: () => {
                        queryClient.invalidateQueries({ queryKey: ['businesses'] });
                        router.back();
                    },
                },
            ]);
        } catch (error: any) {
            console.error('Error creating service/product:', error);
            Alert.alert('Error', error.message || 'Failed to add item');
        } finally {
            setLoading(false);
        }
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
                        <Text className="text-white text-2xl font-bold">Add {type}</Text>
                        <Text className="text-white/80 text-sm mt-1">List your business offering</Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
                <View className="px-6 mt-6">
                    {/* Type Selector */}
                    <View className="bg-card rounded-xl p-4 mb-4 border border-border shadow-sm">
                        <Text className="text-foreground font-semibold mb-2">Type *</Text>
                        <View className="flex-row gap-3">
                            <Pressable
                                className={`flex-1 py-3 rounded-lg border-2 ${type === 'Service' ? 'border-primary bg-primary/10' : 'border-border'}`}
                                onPress={() => setType('Service')}
                            >
                                <Text className={`text-center font-semibold ${type === 'Service' ? 'text-primary' : 'text-muted-foreground'}`}>
                                    Service
                                </Text>
                            </Pressable>
                            <Pressable
                                className={`flex-1 py-3 rounded-lg border-2 ${type === 'Product' ? 'border-primary bg-primary/10' : 'border-border'}`}
                                onPress={() => setType('Product')}
                            >
                                <Text className={`text-center font-semibold ${type === 'Product' ? 'text-primary' : 'text-muted-foreground'}`}>
                                    Product
                                </Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* Name */}
                    <View className="bg-card rounded-xl p-4 mb-4 border border-border shadow-sm">
                        <Text className="text-foreground font-semibold mb-2">Name *</Text>
                        <TextInput
                            className="bg-input border border-border rounded-lg px-4 py-3 text-base text-foreground"
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter name"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    {/* Description */}
                    <View className="bg-card rounded-xl p-4 mb-4 border border-border shadow-sm">
                        <Text className="text-foreground font-semibold mb-2">Description *</Text>
                        <TextInput
                            className="bg-input border border-border rounded-lg px-4 py-3 text-base min-h-[100px] text-foreground"
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Describe your offering"
                            placeholderTextColor="#9CA3AF"
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    {/* Category */}
                    <View className="bg-card rounded-xl p-4 mb-4 border border-border shadow-sm">
                        <Text className="text-foreground font-semibold mb-2">Category *</Text>
                        <View className="bg-input border border-border rounded-lg">
                            <Picker
                                selectedValue={category}
                                onValueChange={setCategory}
                                style={{ color: '#002147' }}
                            >
                                <Picker.Item label="Select Category" value="" color="#9CA3AF" />
                                {categories.map((cat) => (
                                    <Picker.Item key={cat} label={cat} value={cat} color="#002147" />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    {/* Price (only for products) */}
                    {type === 'Product' && (
                        <View className="bg-card rounded-xl p-4 mb-4 border border-border shadow-sm">
                            <Text className="text-foreground font-semibold mb-2">Price (Optional)</Text>
                            <TextInput
                                className="bg-input border border-border rounded-lg px-4 py-3 text-base text-foreground"
                                value={price}
                                onChangeText={setPrice}
                                placeholder="e.g., R500 or Contact for quote"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="default"
                            />
                        </View>
                    )}

                    {/* Contact Information (Optional) */}
                    <View className="bg-card rounded-xl p-4 mb-4 border border-border shadow-sm">
                        <Text className="text-foreground font-semibold mb-3">Contact Information (Optional)</Text>
                        
                        <View className="mb-3">
                            <Text className="text-muted-foreground text-sm mb-1">Email</Text>
                            <TextInput
                                className="bg-input border border-border rounded-lg px-4 py-3 text-base text-foreground"
                                value={contactEmail}
                                onChangeText={setContactEmail}
                                placeholder="contact@example.com"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View className="mb-3">
                            <Text className="text-muted-foreground text-sm mb-1">Phone</Text>
                            <TextInput
                                className="bg-input border border-border rounded-lg px-4 py-3 text-base text-foreground"
                                value={contactPhone}
                                onChangeText={setContactPhone}
                                placeholder="+27 12 345 6789"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View>
                            <Text className="text-muted-foreground text-sm mb-1">Website</Text>
                            <TextInput
                                className="bg-input border border-border rounded-lg px-4 py-3 text-base text-foreground"
                                value={websiteUrl}
                                onChangeText={setWebsiteUrl}
                                placeholder="https://example.com"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="url"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    {/* Submit Button */}
                    <Pressable
                        className="bg-[#002147] py-4 rounded-xl flex-row items-center justify-center active:opacity-90 mb-6"
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Feather name="check" size={20} color="white" />
                                <Text className="text-white font-bold text-base ml-2">Add {type}</Text>
                            </>
                        )}
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
}

