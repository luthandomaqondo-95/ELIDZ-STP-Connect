import React from 'react';
import { Pressable, View, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuthContext } from '@/hooks/use-auth-context';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useAvatarUri } from '@/hooks/use-avatar-uri';

export const HeaderAvatar = ({
    className = ""
}: {
    className?: string;
}) => {
    const { profile } = useAuthContext();
    const { uri: avatarUri, isLoading } = useAvatarUri(profile?.avatar);
    const hasUploadedAvatar =
        Boolean(profile?.avatar) &&
        (profile!.avatar!.startsWith('http://') ||
            profile!.avatar!.startsWith('https://') ||
            profile!.avatar!.startsWith('storage:'));

    const getAvatarSource = (avatar?: string) => {
        // Otherwise, use default color avatars
        switch (avatar) {
            case 'blue': return require('../../assets/avatars/avatar-blue.png');
            case 'green': return require('../../assets/avatars/avatar-green.png');
            case 'orange': return require('../../assets/avatars/avatar-orange.png');
            default: return require('../../assets/avatars/avatar-blue.png');
        }
    };

    const avatarSource = avatarUri ? { uri: avatarUri } : getAvatarSource(profile?.avatar || 'blue');
    const isUri = typeof avatarSource === 'object' && avatarSource !== null && 'uri' in avatarSource;

    return (
        <Pressable 
            onPress={() => router.push('/(tabs)/profile')}
            className={cn(" active:opacity-70 w-9 h-9 rounded-full bg-gray-200 overflow-hidden border border-gray-100 shadow-sm", className)}
        >
            {isLoading && hasUploadedAvatar && !avatarUri ? (
                <View className="w-full h-full items-center justify-center bg-gray-200">
                    <ActivityIndicator size="small" />
                </View>
            ) : isUri ? (
                <Image 
                    source={avatarSource as { uri: string }} 
                    style={{ width: '100%', height: '100%' }} 
                    resizeMode="cover"
                />
            ) : hasUploadedAvatar ? (
                <View className="w-full h-full items-center justify-center bg-[#002147]/10">
                    <Text className="text-[#002147] text-sm font-bold">
                        {(profile?.name?.charAt(0) || 'U').toUpperCase()}
                    </Text>
                </View>
            ) : (
                <Image 
                    source={avatarSource as any} 
                    style={{ width: '100%', height: '100%' }} 
                    resizeMode="cover"
                />
            )}
        </Pressable>
    );
};

