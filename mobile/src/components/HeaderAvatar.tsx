import React from 'react';
import { Pressable, View, Image } from 'react-native';
import { router } from 'expo-router';
import { useAuthContext } from '@/hooks/use-auth-context';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

export const HeaderAvatar = ({
    className = ""
}: {
    className?: string;
}) => {
    const { profile } = useAuthContext();

    const getAvatarSource = (avatar?: string) => {
        // If avatar is a URL (starts with http), return it as a URI source
        if (avatar && (avatar.startsWith('http://') || avatar.startsWith('https://'))) {
            return { uri: avatar };
        }
        
        // Otherwise, use default color avatars
        switch (avatar) {
            case 'blue': return require('../../assets/avatars/avatar-blue.png');
            case 'green': return require('../../assets/avatars/avatar-green.png');
            case 'orange': return require('../../assets/avatars/avatar-orange.png');
            default: return require('../../assets/avatars/avatar-blue.png');
        }
    };

    const avatarSource = getAvatarSource(profile?.avatar || 'blue');
    const isUri = typeof avatarSource === 'object' && 'uri' in avatarSource;

    return (
        <Pressable 
            onPress={() => router.push('/(tabs)/profile')}
            className={cn(" active:opacity-70 w-9 h-9 rounded-full bg-gray-200 overflow-hidden border border-gray-100 shadow-sm", className)}
        >
            {isUri ? (
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

