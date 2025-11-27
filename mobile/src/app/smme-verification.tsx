import React, { useState, useEffect } from 'react';
import { View, Alert, Pressable, ScrollView, Image, TextInput, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '@/hooks/use-auth-context';
import * as ImagePicker from 'expo-image-picker';
import { verificationService } from '@/services/verification.service';
import { ScreenScrollView } from '@/components/ScreenScrollView';
import { smmmeService, SMMEServiceProduct } from '@/services/smme.service';
import { useQueryClient } from '@tanstack/react-query';
import { Picker } from '@react-native-picker/picker';

interface DocumentSlot {
    type: 'Business Registration' | 'ID Document' | 'Business Profile';
    label: string;
    description: string;
    icon: string;
    uri: string | null;
}

export default function SMMEVerificationScreen() {
    const { profile } = useAuthContext();
    const queryClient = useQueryClient();
    const [documents, setDocuments] = useState<DocumentSlot[]>([
        {
            type: 'Business Registration',
            label: 'Business Registration (CIPC)',
            description: 'Your official company registration certificate',
            icon: 'file-text',
            uri: null
        },
        {
            type: 'ID Document',
            label: 'ID Document',
            description: 'Clear photo of your South African ID',
            icon: 'credit-card',
            uri: null
        },
        {
            type: 'Business Profile',
            label: 'Business Profile',
            description: 'Company profile or business plan document',
            icon: 'briefcase',
            uri: null
        }
    ]);
    const [isUploading, setIsUploading] = useState(false);
    
    // Products/Services state
    const [servicesProducts, setServicesProducts] = useState<{ services: SMMEServiceProduct[]; products: SMMEServiceProduct[] }>({ services: [], products: [] });
    const [loadingServicesProducts, setLoadingServicesProducts] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingItem, setEditingItem] = useState<SMMEServiceProduct | null>(null);
    
    // Form state
    const [formType, setFormType] = useState<'Service' | 'Product'>('Service');
    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formCategory, setFormCategory] = useState('');
    const [formPrice, setFormPrice] = useState('');
    const [formContactEmail, setFormContactEmail] = useState('');
    const [formContactPhone, setFormContactPhone] = useState('');
    const [formWebsiteUrl, setFormWebsiteUrl] = useState('');
    const [submittingForm, setSubmittingForm] = useState(false);

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

    useEffect(() => {
        if (profile?.id) {
            loadServicesProducts();
        }
    }, [profile?.id]);

    const loadServicesProducts = async () => {
        if (!profile?.id) return;
        setLoadingServicesProducts(true);
        try {
            const data = await smmmeService.getServicesProductsBySMME(profile.id);
            setServicesProducts(data);
        } catch (error) {
            console.error('Error loading services/products:', error);
        } finally {
            setLoadingServicesProducts(false);
        }
    };

    const resetForm = () => {
        setFormType('Service');
        setFormName('');
        setFormDescription('');
        setFormCategory('');
        setFormPrice('');
        setFormContactEmail('');
        setFormContactPhone('');
        setFormWebsiteUrl('');
        setEditingItem(null);
        setShowAddForm(false);
    };

    const handleEdit = (item: SMMEServiceProduct) => {
        setEditingItem(item);
        setFormType(item.type);
        setFormName(item.name);
        setFormDescription(item.description || '');
        setFormCategory(item.category || '');
        setFormPrice(item.price || '');
        setFormContactEmail(item.contact_email || '');
        setFormContactPhone(item.contact_phone || '');
        setFormWebsiteUrl(item.website_url || '');
        setShowAddForm(true);
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

    const handleSubmitForm = async () => {
        if (!formName.trim() || !formDescription.trim() || !formCategory.trim()) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        if (!profile?.id) {
            Alert.alert('Error', 'User not authenticated');
            return;
        }

        setSubmittingForm(true);
        try {
            if (editingItem) {
                // Update existing item
                const { supabase } = await import('@/lib/supabase');
                const { error } = await supabase
                    .from('sme_services_products')
                    .update({
                        type: formType,
                        name: formName.trim(),
                        description: formDescription.trim(),
                        category: formCategory.trim(),
                        price: formPrice.trim() || null,
                        contact_email: formContactEmail.trim() || null,
                        contact_phone: formContactPhone.trim() || null,
                        website_url: formWebsiteUrl.trim() || null,
                    })
                    .eq('id', editingItem.id);

                if (error) throw error;
                Alert.alert('Success', `${formType} updated successfully!`);
            } else {
                // Create new item
                await smmmeService.createServiceProduct(profile.id, {
                    type: formType,
                    name: formName.trim(),
                    description: formDescription.trim(),
                    category: formCategory.trim(),
                    price: formPrice.trim() || undefined,
                    contact_email: formContactEmail.trim() || undefined,
                    contact_phone: formContactPhone.trim() || undefined,
                    website_url: formWebsiteUrl.trim() || undefined,
                });
                Alert.alert('Success', `${formType} added successfully!`);
            }

            queryClient.invalidateQueries({ queryKey: ['businesses'] });
            loadServicesProducts();
            resetForm();
        } catch (error: any) {
            console.error('Error saving service/product:', error);
            Alert.alert('Error', error.message || 'Failed to save item');
        } finally {
            setSubmittingForm(false);
        }
    };

    const pickDocument = async (index: number) => {
        // We are using ImagePicker as a proxy for document picking since expo-document-picker is not installed
        // In a real app, we should add expo-document-picker for PDFs
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.8,
        });

        if (!result.canceled) {
            const updatedDocuments = [...documents];
            updatedDocuments[index].uri = result.assets[0].uri;
            setDocuments(updatedDocuments);
        }
    };

    const handleUpload = async () => {
        // Check if all 3 required documents are uploaded
        const missingDocs = documents.filter(doc => !doc.uri);
        if (missingDocs.length > 0) {
            Alert.alert(
                'Missing Documents', 
                `Please upload all 3 required documents:\n${missingDocs.map(d => `• ${d.label}`).join('\n')}`
            );
            return;
        }

        if (!profile?.id) return;

        setIsUploading(true);
        try {
            // Upload all documents
            const uploadPromises = documents.map(async (doc) => {
                if (!doc.uri) return null;
                
                // 1. Upload file to Supabase Storage
                const publicUrl = await verificationService.uploadDocument(doc.uri, profile.id, doc.type);
                
                return {
                    url: publicUrl,
                    type: doc.type
                };
            });

            const uploadedDocs = await Promise.all(uploadPromises);
            const validDocs = uploadedDocs.filter(d => d !== null) as { url: string; type: any }[];
            
            // 2. Submit all verification records
            await verificationService.submitMultipleDocuments(profile.id, validDocs);
            
            Alert.alert(
                'Success', 
                'All documents have been submitted for verification. We will review them within 24-48 hours and notify you once approved.',
                [{ text: 'OK', onPress: () => router.replace('/(tabs)/profile') }]
            );
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to submit verification.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <ScreenScrollView>
            <View className="p-6">
                <Pressable onPress={() => router.back()} className="mb-6">
                    <Feather name="arrow-left" size={24} color="#002147" />
                </Pressable>

                <View className="items-center mb-8">
                    <View className="w-20 h-20 bg-blue-50 rounded-full items-center justify-center mb-4">
                        <Feather name="shield" size={40} color="#002147" />
                    </View>
                    <Text className="text-2xl font-bold text-foreground text-center">
                        Verify Your Business
                    </Text>
                    <Text className="text-muted-foreground text-center mt-2">
                        Upload the 3 required documents to prove your business legitimacy and gain access to exclusive SMME benefits.
                    </Text>
                </View>

                {/* Required Documents Section */}
                <View className="mb-6">
                    <Text className="text-sm font-bold text-foreground mb-4 uppercase tracking-wide">
                        Required Documents (3)
                    </Text>
                    
                    {documents.map((doc, index) => (
                        <View key={doc.type} className="bg-card p-5 rounded-2xl shadow-sm border border-border mb-4">
                            <View className="flex-row items-center mb-3">
                                <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3">
                                    <Feather name={doc.icon as any} size={20} color="#002147" />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-bold text-foreground text-base">{doc.label}</Text>
                                    <Text className="text-xs text-muted-foreground mt-0.5">{doc.description}</Text>
                                </View>
                                {doc.uri && (
                                    <View className="w-6 h-6 bg-[#28A745] rounded-full items-center justify-center">
                                        <Feather name="check" size={14} color="white" />
                                    </View>
                                )}
                            </View>
                            
                            <Pressable 
                                onPress={() => pickDocument(index)}
                                className={`border-2 border-dashed rounded-xl h-32 items-center justify-center ${doc.uri ? 'border-constructive bg-constructive/10' : 'border-border bg-muted'}`}
                            >
                                {doc.uri ? (
                                    <View className="items-center">
                                        <Image source={{ uri: doc.uri }} className="w-16 h-16 rounded-lg mb-2" resizeMode="cover" />
                                        <Text className="text-constructive font-semibold text-sm">Document Uploaded</Text>
                                        <Text className="text-xs text-muted-foreground mt-1">Tap to change</Text>
                                    </View>
                                ) : (
                                    <View className="items-center">
                                        <Feather name="upload-cloud" size={32} color="#9CA3AF" />
                                        <Text className="text-muted-foreground font-medium text-sm mt-2">Tap to upload</Text>
                                        <Text className="text-xs text-muted-foreground mt-1">JPG, PNG supported</Text>
                                    </View>
                                )}
                            </Pressable>
                        </View>
                    ))}
                </View>

                {/* Progress Indicator */}
                <View className="bg-card p-4 rounded-xl mb-6 border border-border">
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-sm font-semibold text-foreground">Upload Progress</Text>
                        <Text className="text-sm font-bold text-foreground">
                            {documents.filter(d => d.uri).length}/3
                        </Text>
                    </View>
                    <View className="h-2 bg-muted rounded-full overflow-hidden">
                        <View 
                            className="h-full bg-constructive rounded-full"
                            style={{ width: `${(documents.filter(d => d.uri).length / 3) * 100}%` }}
                        />
                    </View>
                </View>

                {/* Submit Button */}
                <Button
                    className="bg-[#002147] h-14 rounded-full mb-6"
                    onPress={handleUpload}
                    disabled={isUploading || documents.some(d => !d.uri)}
                >
                    <Text className="text-white font-bold text-lg">
                        {isUploading ? 'Submitting Documents...' : `Submit All Documents (${documents.filter(d => d.uri).length}/3)`}
                    </Text>
                </Button>

                {/* Info Box */}
                <View className="bg-primary/10 p-5 rounded-xl border border-primary/20 mb-6">
                    <View className="flex-row items-start">
                        <Feather name="info" size={20} color="#002147" style={{ marginTop: 2, marginRight: 12 }} />
                        <View className="flex-1">
                            <Text className="text-foreground font-semibold mb-2">Verification Process</Text>
                            <Text className="text-foreground text-sm leading-5">
                                • All 3 documents are required for verification{'\n'}
                                • Admin review typically takes 24-48 hours{'\n'}
                                • You'll be notified via email once approved{'\n'}
                                • Ensure documents are clear and legible
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Products & Services Section */}
                <View className="mb-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 bg-[#002147]/5 rounded-full items-center justify-center mr-3">
                                <Feather name="package" size={20} color="#002147" />
                            </View>
                            <View>
                                <Text className="text-lg font-bold text-foreground">Products & Services</Text>
                                <Text className="text-muted-foreground text-xs mt-0.5">
                                    List your business offerings ({servicesProducts.products.length + servicesProducts.services.length} items)
                                </Text>
                            </View>
                        </View>
                        {!showAddForm && (
                            <Pressable
                                onPress={() => setShowAddForm(true)}
                                className="px-4 py-2 bg-[#002147] rounded-lg active:opacity-90"
                            >
                                <View className="flex-row items-center">
                                    <Feather name="plus" size={16} color="white" />
                                    <Text className="text-white font-semibold text-sm ml-1">Add</Text>
                                </View>
                            </Pressable>
                        )}
                    </View>

                    {/* Add/Edit Form */}
                    {showAddForm && (
                        <View className="bg-card p-5 rounded-2xl shadow-sm border border-border mb-4">
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-lg font-bold text-foreground">
                                    {editingItem ? 'Edit' : 'Add'} {formType}
                                </Text>
                                <Pressable onPress={resetForm}>
                                    <Feather name="x" size={20} color="#6C757D" />
                                </Pressable>
                            </View>

                            {/* Type Selector */}
                            <View className="mb-4">
                                <Text className="text-foreground font-semibold mb-2">Type *</Text>
                                <View className="flex-row gap-3">
                                    <Pressable
                                        className={`flex-1 py-3 rounded-lg border-2 ${formType === 'Service' ? 'border-primary bg-primary/10' : 'border-border'}`}
                                        onPress={() => setFormType('Service')}
                                    >
                                        <Text className={`text-center font-semibold ${formType === 'Service' ? 'text-primary' : 'text-muted-foreground'}`}>
                                            Service
                                        </Text>
                                    </Pressable>
                                    <Pressable
                                        className={`flex-1 py-3 rounded-lg border-2 ${formType === 'Product' ? 'border-primary bg-primary/10' : 'border-border'}`}
                                        onPress={() => setFormType('Product')}
                                    >
                                        <Text className={`text-center font-semibold ${formType === 'Product' ? 'text-primary' : 'text-muted-foreground'}`}>
                                            Product
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>

                            {/* Name */}
                            <View className="mb-4">
                                <Text className="text-foreground font-semibold mb-2">Name *</Text>
                                <TextInput
                                    className="bg-input border border-border rounded-lg px-4 py-3 text-base text-foreground"
                                    value={formName}
                                    onChangeText={setFormName}
                                    placeholder="Enter name"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>

                            {/* Description */}
                            <View className="mb-4">
                                <Text className="text-foreground font-semibold mb-2">Description *</Text>
                                <TextInput
                                    className="bg-input border border-border rounded-lg px-4 py-3 text-base min-h-[100px] text-foreground"
                                    value={formDescription}
                                    onChangeText={setFormDescription}
                                    placeholder="Describe your offering"
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    numberOfLines={4}
                                />
                            </View>

                            {/* Category */}
                            <View className="mb-4">
                                <Text className="text-foreground font-semibold mb-2">Category *</Text>
                                <View className="bg-input border border-border rounded-lg">
                                    <Picker
                                        selectedValue={formCategory}
                                        onValueChange={setFormCategory}
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
                            {formType === 'Product' && (
                                <View className="mb-4">
                                    <Text className="text-foreground font-semibold mb-2">Price (Optional)</Text>
                                    <TextInput
                                        className="bg-input border border-border rounded-lg px-4 py-3 text-base text-foreground"
                                        value={formPrice}
                                        onChangeText={setFormPrice}
                                        placeholder="e.g., R500 or Contact for quote"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </View>
                            )}

                            {/* Contact Information (Optional) */}
                            <View className="mb-4">
                                <Text className="text-foreground font-semibold mb-3">Contact Information (Optional)</Text>
                                
                                <View className="mb-3">
                                    <Text className="text-muted-foreground text-sm mb-1">Email</Text>
                                    <TextInput
                                        className="bg-input border border-border rounded-lg px-4 py-3 text-base text-foreground"
                                        value={formContactEmail}
                                        onChangeText={setFormContactEmail}
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
                                        value={formContactPhone}
                                        onChangeText={setFormContactPhone}
                                        placeholder="+27 12 345 6789"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="phone-pad"
                                    />
                                </View>

                                <View>
                                    <Text className="text-muted-foreground text-sm mb-1">Website</Text>
                                    <TextInput
                                        className="bg-input border border-border rounded-lg px-4 py-3 text-base text-foreground"
                                        value={formWebsiteUrl}
                                        onChangeText={setFormWebsiteUrl}
                                        placeholder="https://example.com"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="url"
                                        autoCapitalize="none"
                                    />
                                </View>
                            </View>

                            {/* Form Actions */}
                            <View className="flex-row gap-3">
                                <Pressable
                                    className="flex-1 py-3 bg-muted rounded-lg items-center active:opacity-90"
                                    onPress={resetForm}
                                >
                                    <Text className="text-foreground font-semibold">Cancel</Text>
                                </Pressable>
                                <Pressable
                                    className="flex-1 py-3 bg-[#002147] rounded-lg items-center active:opacity-90"
                                    onPress={handleSubmitForm}
                                    disabled={submittingForm}
                                >
                                    {submittingForm ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text className="text-white font-semibold">
                                            {editingItem ? 'Update' : 'Add'} {formType}
                                        </Text>
                                    )}
                                </Pressable>
                            </View>
                        </View>
                    )}

                    {/* Products List */}
                    {loadingServicesProducts ? (
                        <View className="items-center py-8">
                            <ActivityIndicator size="large" color="#002147" />
                        </View>
                    ) : (
                        <>
                            {servicesProducts.products.length > 0 && (
                                <View className="mb-4">
                                    <Text className="text-foreground font-semibold mb-3">Products ({servicesProducts.products.length})</Text>
                                    {servicesProducts.products.map((product) => (
                                        <View key={product.id} className="bg-card rounded-xl p-4 mb-3 border border-border shadow-sm">
                                            <View className="flex-row items-start justify-between">
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
                                                <View className="flex-row gap-2">
                                                    <Pressable
                                                        onPress={() => handleEdit(product)}
                                                        className="p-2 bg-primary/10 rounded-lg"
                                                    >
                                                        <Feather name="edit" size={16} color="#002147" />
                                                    </Pressable>
                                                    <Pressable
                                                        onPress={() => handleDelete(product)}
                                                        className="p-2 bg-destructive/10 rounded-lg"
                                                    >
                                                        <Feather name="trash-2" size={16} color="#EF4444" />
                                                    </Pressable>
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Services List */}
                            {servicesProducts.services.length > 0 && (
                                <View className="mb-4">
                                    <Text className="text-foreground font-semibold mb-3">Services ({servicesProducts.services.length})</Text>
                                    {servicesProducts.services.map((service) => (
                                        <View key={service.id} className="bg-card rounded-xl p-4 mb-3 border border-border shadow-sm">
                                            <View className="flex-row items-start justify-between">
                                                <View className="flex-1">
                                                    <Text className="text-foreground font-bold text-base">{service.name}</Text>
                                                    <Text className="text-muted-foreground text-sm mt-1">{service.description}</Text>
                                                    <View className="bg-muted self-start px-2 py-1 rounded-md mt-2">
                                                        <Text className="text-foreground text-xs">{service.category}</Text>
                                                    </View>
                                                </View>
                                                <View className="flex-row gap-2">
                                                    <Pressable
                                                        onPress={() => handleEdit(service)}
                                                        className="p-2 bg-primary/10 rounded-lg"
                                                    >
                                                        <Feather name="edit" size={16} color="#002147" />
                                                    </Pressable>
                                                    <Pressable
                                                        onPress={() => handleDelete(service)}
                                                        className="p-2 bg-destructive/10 rounded-lg"
                                                    >
                                                        <Feather name="trash-2" size={16} color="#EF4444" />
                                                    </Pressable>
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Empty State */}
                            {servicesProducts.products.length === 0 && servicesProducts.services.length === 0 && !showAddForm && (
                                <View className="items-center py-8 bg-card rounded-2xl border border-border border-dashed">
                                    <Feather name="package" size={48} color="#CBD5E0" />
                                    <Text className="text-muted-foreground text-base mt-4 text-center font-medium">
                                        No products or services listed yet
                                    </Text>
                                    <Text className="text-muted-foreground text-sm mt-2 text-center">
                                        Add your offerings to appear in the verified SMMEs directory
                                    </Text>
                                </View>
                            )}
                        </>
                    )}
                </View>
            </View>
        </ScreenScrollView>
    );
}

