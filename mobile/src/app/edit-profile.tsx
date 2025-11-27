import React, { useState } from 'react';
import { View, Pressable, TextInput, Alert, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenKeyboardAwareScrollView } from '@/components/ScreenKeyboardAwareScrollView';
import { useAuthContext } from '@/hooks/use-auth-context';
import { Feather } from '@expo/vector-icons';
import { withAuthGuard } from '@/components/withAuthGuard';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { HeaderAvatar } from '@/components/HeaderAvatar';
import type { Profile } from '@/types';
import { profileService } from '@/services/profile.service';

function EditProfileScreen() {
    const { profile: user, updateProfile } = useAuthContext();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [address, setAddress] = useState<string>('');
    
    React.useEffect(() => {
        if (user) {
            const profile = user as Profile;
            // Type assertion needed due to TypeScript cache issue with optional properties
            setAddress((profile as Profile & { address?: string }).address ?? '');
        }
    }, [user]);
    const [organization, setOrganization] = useState(user?.organization || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const pickImage = async () => {
        // Request permissions first
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant camera roll permissions to upload a profile picture.');
            return;
        }

        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    async function handleSave() {
        if (!name.trim() || !email.trim()) {
            Alert.alert('Error', 'Name and email are required');
            return;
        }

        if (!user?.id) {
            Alert.alert('Error', 'User not authenticated');
            return;
        }

        setIsSaving(true);
        try {
            const updates: Record<string, any> = {
                name: name.trim(),
                email: email.trim(),
            };
            
            if (address.trim()) {
                updates.address = address.trim();
            }
            if (organization.trim()) {
                updates.organization = organization.trim();
            }
            if (bio.trim()) {
                updates.bio = bio.trim();
            }

            // Upload profile picture if a new one was selected
            if (selectedImage) {
                setIsUploadingImage(true);
                try {
                    const avatarUrl = await profileService.uploadProfilePicture(selectedImage, user.id);
                    updates.avatar = avatarUrl;
                } catch (error: any) {
                    console.error('Error uploading profile picture:', error);
                    Alert.alert('Upload Error', 'Failed to upload profile picture. Profile will be updated without the new picture.');
                    // Continue with other updates even if image upload fails
                } finally {
                    setIsUploadingImage(false);
                }
            } else if (user?.avatar && !selectedImage) {
                // Keep existing avatar if no new image selected
                updates.avatar = user.avatar;
            }
            
            await updateProfile(updates as Partial<Profile>);
            Alert.alert('Success', 'Profile updated successfully', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Failed to update profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <View className="flex-1 bg-gray-50">
            <ScreenKeyboardAwareScrollView>
                {/* Header */}
                <LinearGradient
                    colors={['#002147', '#003366']}
                    className="pt-12 pb-6 px-6 rounded-b-[30px] shadow-lg mb-6"
                >
                    <View className="flex-row items-center mb-4">
                        <Pressable
                            onPress={() => router.back()}
                            className="p-2 bg-white/10 rounded-full mr-4"
                        >
                            <Feather name="arrow-left" size={20} color="white" />
                        </Pressable>
                        <Text className="text-white text-2xl font-bold">Edit Profile</Text>
                    </View>
                    <Text className="text-white/80 text-sm">
                        Update your personal information and profile picture.
                    </Text>
                </LinearGradient>

                <View className="px-6 pb-10">
                    {/* Profile Picture Section */}
                    <View className="items-center mb-8">
                        <Pressable 
                            onPress={pickImage} 
                            className="relative"
                            disabled={isUploadingImage}
                        >
                            <View className="w-28 h-28 rounded-full bg-white p-1 border-2 border-[#002147]/10 shadow-sm">
                                <View className="w-full h-full rounded-full bg-[#002147]/5 justify-center items-center overflow-hidden">
                                    {isUploadingImage ? (
                                        <ActivityIndicator size="large" color="#002147" />
                                    ) : selectedImage ? (
                                        <Image 
                                            source={{ uri: selectedImage }} 
                                            className="w-full h-full"
                                            style={{ width: '100%', height: '100%' }}
                                            resizeMode="cover"
                                        />
                                    ) : user?.avatar && (user.avatar.startsWith('http://') || user.avatar.startsWith('https://')) ? (
                                        <Image 
                                            source={{ uri: user.avatar }} 
                                            className="w-full h-full"
                                            style={{ width: '100%', height: '100%' }}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <Text className="text-[#002147] text-4xl font-bold">
                                            {user?.name?.charAt(0).toUpperCase() || 'G'}
                                        </Text>
                                    )}
                                </View>
                            </View>
                            <View className={`absolute bottom-0 right-0 w-8 h-8 rounded-full items-center justify-center border-2 border-white shadow-sm ${isUploadingImage ? 'bg-gray-400' : 'bg-[#FF6600]'}`}>
                                {isUploadingImage ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Feather name="camera" size={14} color="white" />
                                )}
                            </View>
                        </Pressable>
                        <Text className="text-[#002147] text-sm font-medium mt-3">
                            {isUploadingImage ? 'Uploading...' : 'Change Profile Picture'}
                        </Text>
                    </View>

                    {/* Form Fields */}
                    <View className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-6">
                        {/* Name Input */}
                        <View className="mb-5">
                            <Text className="text-[#002147] text-xs font-bold uppercase mb-2 ml-1">Full Name</Text>
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter your full name"
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-[#002147]"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        {/* Email Input */}
                        <View className="mb-5">
                            <Text className="text-[#002147] text-xs font-bold uppercase mb-2 ml-1">Email Address</Text>
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Enter your email"
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-[#002147]"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        {/* Address Input */}
                        <View className="mb-5">
                            <Text className="text-[#002147] text-xs font-bold uppercase mb-2 ml-1">Address</Text>
                            <TextInput
                                value={address}
                                onChangeText={setAddress}
                                placeholder="Enter your address"
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-[#002147]"
                                placeholderTextColor="#9CA3AF"
                                autoCapitalize="words"
                            />
                        </View>

                        {/* Organization Input */}
                        <View className="mb-5">
                            <Text className="text-[#002147] text-xs font-bold uppercase mb-2 ml-1">Organization</Text>
                            <TextInput
                                value={organization}
                                onChangeText={setOrganization}
                                placeholder="Enter your organization"
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-[#002147]"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        {/* Bio Input */}
                        <View className="mb-2">
                            <Text className="text-[#002147] text-xs font-bold uppercase mb-2 ml-1">Bio</Text>
                            <TextInput
                                value={bio}
                                onChangeText={setBio}
                                placeholder="Tell us about yourself"
                                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-[#002147] min-h-[100px]"
                                placeholderTextColor="#9CA3AF"
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>

                    {/* Role Display (Read-only) */}
                    <View className="bg-[#002147]/5 p-4 rounded-xl mb-8 border border-[#002147]/10 flex-row items-center justify-between">
                        <View>
                            <Text className="text-[#002147] text-xs font-bold uppercase mb-1">Current Role</Text>
                            <Text className="text-[#002147] text-base font-medium">{user?.role}</Text>
                        </View>
                        <Feather name="shield" size={20} color="#002147" />
                    </View>

                    {/* Save Button */}
                    <Pressable
                        onPress={handleSave}
                        disabled={isSaving}
                        className={`py-4 rounded-xl items-center justify-center shadow-md active:opacity-90 ${isSaving ? 'bg-gray-300' : 'bg-[#002147]'
                            }`}
                    >
                        {isSaving ? (
                            <Text className="text-gray-500 font-bold text-base">Saving...</Text>
                        ) : (
                            <Text className="text-white font-bold text-base">Save Changes</Text>
                        )}
                    </Pressable>
                </View>
            </ScreenKeyboardAwareScrollView>
        </View>
    );
}

export default withAuthGuard(EditProfileScreen);