import React, { useState } from 'react';
import { Image, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';

// Map tenant names to local logo files
function getTenantLogo(name: string): any {
    const nameLower = name.toLowerCase();

    if (nameLower.includes('ecsa') || nameLower.includes('engineering council')) {
        return require('../../assets/images/tenants/ecsa-logo.png');
    }
    if (nameLower.includes('samrc') || nameLower.includes('medical research')) {
        return require('../../assets/images/tenants/samrc-logo.png');
    }
    if (nameLower.includes('ecngc') || nameLower.includes('government chemist')) {
        return require('../../assets/images/tenants/ecngoc-logo.png');
    }
    if (nameLower.includes('eciti')) {
        return require('../../assets/images/tenants/eciti-logo.png');
    }
    if (nameLower.includes('analytical') || nameLower.includes('food') || nameLower.includes('water') || nameLower.includes('testing') || nameLower.includes('laboratory')) {
        return require('../../assets/images/tenants/analytical-lab.png');
    }
    if (nameLower.includes('design') || nameLower.includes('innovation hub')) {
        return require('../../assets/images/tenants/cortex-hub-logo.png');
    }
    if (nameLower.includes('digital') || nameLower.includes('technology')) {
        return require('../../assets/images/tenants/cortex-hub-logo.png');
    }
    if (nameLower.includes('automotive')) {
        return require('../../assets/images/tenants/msc-artisan-logo.png');
    }
    if (nameLower.includes('renewable') || nameLower.includes('energy')) {
        return require('../../assets/images/tenants/amn-environmental-logo.png');
    }
    if (nameLower.includes('buffalo') || nameLower.includes('city')) {
        return require('../../assets/images/tenants/buffalo-city-logo.png');
    }
    if (nameLower.includes('chemin')) {
        return require('../../assets/images/tenants/chemin-logo.png');
    }
    if (nameLower.includes('cortex')) {
        return require('../../assets/images/tenants/cortex-hub-logo.png');
    }
    if (nameLower.includes('kgi') && nameLower.includes('bpo')) {
        return require('../../assets/images/tenants/kgi-bpo-logo.png');
    }
    if (nameLower.includes('kgi')) {
        return require('../../assets/images/tenants/kgi-holdings-logo.png');
    }
    if (nameLower.includes('longlife')) {
        return require('../../assets/images/tenants/longlife-logo.png');
    }
    if (nameLower.includes('mfuraa')) {
        return require('../../assets/images/tenants/mfuraa-logo.png');
    }
    if (nameLower.includes('phokophela')) {
        return require('../../assets/images/tenants/phokophela-logo.png');
    }
    if (nameLower.includes('zizi')) {
        return require('../../assets/images/tenants/zizi-logo.png');
    }
    return null;
}

interface TenantLogoProps {
    logoUrl?: string;
    name: string;
    size?: number;
    className?: string;
}

export function TenantLogo({ logoUrl, name, size = 20, className = "w-full h-full" }: TenantLogoProps) {
    const [imageError, setImageError] = useState(false);
    const localLogo = getTenantLogo(name);

    if (localLogo) {
        return (
            <Image
                source={localLogo}
                className={className}
                resizeMode="contain"
                onError={() => setImageError(true)}
            />
        );
    }

    const isValidUrl = logoUrl &&
                       logoUrl.trim() !== '' &&
                       !logoUrl.includes('example.com') &&
                       !imageError;

    if (isValidUrl) {
        return (
            <Image
                source={{ uri: logoUrl! }}
                className={className}
                resizeMode="contain"
                onError={() => setImageError(true)}
            />
        );
    }

    // Placeholder with initials
    const getInitials = (name: string): string => {
        const words = name.trim().split(/\s+/);
        if (words.length >= 2) {
            return (words[0][0] + words[words.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const initials = getInitials(name);
    const placeholderSize = size * 2.5; // Make placeholder larger than icon

    return (
        <View 
            className={`${className} bg-[#002147]/10 border border-[#002147]/20 rounded-full justify-center items-center`}
            style={{ minWidth: placeholderSize, minHeight: placeholderSize }}
        >
            <Text 
                className="text-[#002147] font-bold"
                style={{ fontSize: size * 0.6 }}
            >
                {initials}
            </Text>
        </View>
    );
}

// Export the helper function as well for cases where just the logo path is needed
export { getTenantLogo };
