import React from 'react';
import { Pressable, View, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuthContext } from '@/hooks/use-auth-context';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useAvatarUri } from '@/hooks/use-avatar-uri';
import { DEFAULT_AVATAR } from '@/constants/avatars';

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

    const avatarSource = avatarUri ? { uri: avatarUri } : DEFAULT_AVATAR;
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

