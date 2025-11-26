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
        switch (avatar) {
            case 'blue': return require('../../assets/avatars/avatar-blue.png');
            case 'green': return require('../../assets/avatars/avatar-green.png');
            case 'orange': return require('../../assets/avatars/avatar-orange.png');
            default: return require('../../assets/avatars/avatar-blue.png');
        }
    };

    return (
        <Pressable 
            onPress={() => router.push('/(tabs)/profile')}
            className={cn(" active:opacity-70 w-9 h-9 rounded-full bg-gray-200 overflow-hidden border border-gray-100 shadow-sm", className)}
        >

                <Image 
                    source={getAvatarSource(profile?.avatar || 'blue')} 
                    style={{ width: '100%', height: '100%' }} 
                    resizeMode="cover"
                />
        </Pressable>
    );
};

