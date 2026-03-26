import React, { useState } from 'react';
import { View, Pressable, TextInput, Alert, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenKeyboardAwareScrollView } from '@/components/ScreenKeyboardAwareScrollView';
import { useAuthContext } from '@/hooks/use-auth-context';
import { Feather } from '@expo/vector-icons';
import { withAuthGuard } from '@/components/withAuthGuard';
import * as ImagePicker from 'expo-image-picker';
import type { Profile } from '@/types';
import { profileService } from '@/services/profile.service';
import { useColorScheme } from '@/hooks/use-theme-color';
import { COLORS } from '@/theme/colors';
import { TabsLayoutHeader } from '@/components/Header';
import { useAvatarUri } from '@/hooks/use-avatar-uri';
import { DEFAULT_AVATAR } from '@/constants/avatars';
import { Picker } from '@react-native-picker/picker';

function EditProfileScreen() {
    const { profile: user, updateProfile } = useAuthContext();
    const { colorScheme } = useColorScheme();
    const colors = COLORS[colorScheme];
    const { uri: savedAvatarUri } = useAvatarUri(user?.avatar);
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [address, setAddress] = useState<string>('');
    const [role, setRole] = useState<Profile['role']>(user?.role || 'Entrepreneur');
    
    React.useEffect(() => {
        if (user) {
            const profile = user as Profile;
            // Type assertion needed due to TypeScript cache issue with optional properties
            setAddress((profile as Profile & { address?: string }).address ?? '');
            setRole(profile.role || 'Entrepreneur');
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
            const previousRole = (user as Profile | null)?.role;
            const nextRole = role;

            const updates: Record<string, any> = {
                name: name.trim(),
                email: email.trim(),
                role: nextRole,
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

            // If user switches into SMME, ensure they are not treated as verified until reviewed.
            if (nextRole === 'SMME' && previousRole !== 'SMME') {
                updates.verification_status = 'unverified';
            }
            
            await updateProfile(updates as Partial<Profile>);

            if (nextRole === 'SMME' && previousRole !== 'SMME') {
                Alert.alert(
                    'SMME Verification Required',
                    'To appear as a legitimate SMME, please upload your business documents for verification.',
                    [
                        { text: 'Later', onPress: () => router.back() },
                        { text: 'Upload Now', onPress: () => router.replace('/smme-verification') },
                    ]
                );
                return;
            }

            Alert.alert('Success', 'Profile updated successfully', [{ text: 'OK', onPress: () => router.back() }]);
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Failed to update profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <View className="flex-1 bg-background">
            <ScreenKeyboardAwareScrollView insetTop={false} contentContainerStyle={{ paddingBottom: 40 }}>
                <View className="bg-background">
                    <TabsLayoutHeader title="Edit Profile" variant="navy" showActions={false} showBackButton>
                        <Text className="text-white/80 text-base">
                            Update your personal information and profile picture.
                        </Text>
                    </TabsLayoutHeader>
                </View>

                <View className="mt-6 px-6 pb-10">
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
                                        <ActivityIndicator size="large" color={colors.primary} />
                                    ) : selectedImage ? (
                                        <Image 
                                            source={{ uri: selectedImage }} 
                                            className="w-full h-full"
                                            style={{ width: '100%', height: '100%' }}
                                            resizeMode="cover"
                                        />
                                    ) : savedAvatarUri ? (
                                        <Image 
                                            source={{ uri: savedAvatarUri }} 
                                            className="w-full h-full"
                                            style={{ width: '100%', height: '100%' }}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <Image 
                                            source={DEFAULT_AVATAR} 
                                            className="w-full h-full"
                                            style={{ width: '100%', height: '100%' }}
                                            resizeMode="cover"
                                        />
                                    )}
                                </View>
                            </View>
                            <View className={`absolute bottom-0 right-0 w-8 h-8 rounded-full items-center justify-center border-2 border-white shadow-sm ${isUploadingImage ? 'bg-gray-400' : 'bg-[#F38C1E]'}`}>
                                {isUploadingImage ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Feather name="camera" size={14} color="white" />
                                )}
                            </View>
                        </Pressable>
                        <Text className="text-foreground text-sm font-medium mt-3">
                            {isUploadingImage ? 'Uploading...' : 'Change Profile Picture'}
                        </Text>
                    </View>

                    {/* Form Fields */}
                    <View className="bg-card p-5 rounded-2xl border border-border shadow-sm mb-6">
                        {/* Name Input */}
                        <View className="mb-5">
                            <Text className="text-foreground text-xs font-bold uppercase mb-2 ml-1">Full Name</Text>
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter your full name"
                                className="bg-input border border-border rounded-xl px-4 py-3 text-base text-foreground"
                                placeholderTextColor={colors.placeholder}
                            />
                        </View>

                        {/* Email Input */}
                        <View className="mb-5">
                            <Text className="text-foreground text-xs font-bold uppercase mb-2 ml-1">Email Address</Text>
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Enter your email"
                                className="bg-input border border-border rounded-xl px-4 py-3 text-base text-foreground"
                                placeholderTextColor={colors.placeholder}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        {/* Address Input */}
                        <View className="mb-5">
                            <Text className="text-foreground text-xs font-bold uppercase mb-2 ml-1">Address</Text>
                            <TextInput
                                value={address}
                                onChangeText={setAddress}
                                placeholder="Enter your address"
                                className="bg-input border border-border rounded-xl px-4 py-3 text-base text-foreground"
                                placeholderTextColor={colors.placeholder}
                                autoCapitalize="words"
                            />
                        </View>

                        {/* Organization Input */}
                        <View className="mb-5">
                            <Text className="text-foreground text-xs font-bold uppercase mb-2 ml-1">Organization</Text>
                            <TextInput
                                value={organization}
                                onChangeText={setOrganization}
                                placeholder="Enter your organization"
                                className="bg-input border border-border rounded-xl px-4 py-3 text-base text-foreground"
                                placeholderTextColor={colors.placeholder}
                            />
                        </View>

                        {/* Bio Input */}
                        <View className="mb-2">
                            <Text className="text-foreground text-xs font-bold uppercase mb-2 ml-1">Bio</Text>
                            <TextInput
                                value={bio}
                                onChangeText={setBio}
                                placeholder="Tell us about yourself"
                                className="bg-input border border-border rounded-xl px-4 py-3 text-base text-foreground min-h-[100px]"
                                placeholderTextColor={colors.placeholder}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>

                    {/* Role Display (Read-only) */}
                    <View className="bg-card p-5 rounded-2xl border border-border shadow-sm mb-8">
                        <View className="flex-row items-center justify-between mb-3">
                            <View>
                                <Text className="text-foreground text-xs font-bold uppercase mb-1 ml-1">Account Type</Text>
                                <Text className="text-muted-foreground text-xs ml-1">
                                    Choose the role that best matches you.
                                </Text>
                            </View>
                            <Feather name="shield" size={20} color={colors.primary} />
                        </View>

                        <View className="border border-border rounded-xl overflow-hidden" style={{ backgroundColor: colors.input }}>
                            <Picker
                                selectedValue={role}
                                onValueChange={(value) => setRole(value as Profile['role'])}
                                style={{ color: colors.text }}
                            >
                                <Picker.Item label="Entrepreneur" value="Entrepreneur" color={colors.text} />
                                <Picker.Item label="SMME (Business)" value="SMME" color={colors.text} />
                                <Picker.Item label="Investor" value="Investor" color={colors.text} />
                                <Picker.Item label="Student" value="Student" color={colors.text} />
                                <Picker.Item label="Researcher" value="Researcher" color={colors.text} />
                                <Picker.Item label="Tenant" value="Tenant" color={colors.text} />
                            </Picker>
                        </View>

                        {role === 'SMME' && (
                            <View className="mt-3 p-3 rounded-xl border border-accent/30 bg-accent/10">
                                <Text className="text-xs text-foreground font-medium">
                                    SMME accounts require verification. You’ll be asked to upload 3 business documents after saving.
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Save Button */}
                    <Pressable
                        onPress={handleSave}
                        disabled={isSaving}
                        className={`py-4 rounded-xl items-center justify-center shadow-md active:opacity-90 ${isSaving ? 'bg-muted' : 'bg-primary'}`}
                    >
                        {isSaving ? (
                            <Text className="text-muted-foreground font-bold text-base">Saving...</Text>
                        ) : (
                            <Text className="text-primary-foreground font-bold text-base">Save Changes</Text>
                        )}
                    </Pressable>
                </View>
            </ScreenKeyboardAwareScrollView>
        </View>
    );
}

export default withAuthGuard(EditProfileScreen);