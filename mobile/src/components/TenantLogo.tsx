import React, { useState } from 'react';
import { Image, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';

// Map tenant names to local logo files
// Using exact name matching first, then fuzzy matching as fallback
function getTenantLogo(name: string): any {
    if (!name) return null;
    
    const nameLower = name.toLowerCase().trim();
    const nameNormalized = nameLower.replace(/[^a-z0-9]/g, ''); // Remove special chars for matching

    // Exact name matches (most specific first)
    const exactMatches: Record<string, any> = {
        'samrc': require('../../assets/images/tenants/samrc-logo.png'),
        'southafricanmedicalresearchcouncil': require('../../assets/images/tenants/samrc-logo.png'),
        'ecsa': require('../../assets/images/tenants/ecsa-logo.png'),
        'engineeringcouncilofsouthafrica': require('../../assets/images/tenants/ecsa-logo.png'),
        'ecngoc': require('../../assets/images/tenants/ecngoc-logo.png'),
        'ecngoc (eastern cape ngo coalition)': require('../../assets/images/tenants/ecngoc-logo.png'),
        'ecngoc eastern cape ngo coalition': require('../../assets/images/tenants/ecngoc-logo.png'),
        'ecngc': require('../../assets/images/tenants/ecngoc-logo.png'),
        'easterncapegovernmentchemist': require('../../assets/images/tenants/ecngoc-logo.png'),
        'easterncapengocoalition': require('../../assets/images/tenants/ecngoc-logo.png'),
        'eciti': require('../../assets/images/tenants/eciti-logo.png'),
        'eciti (eastern cape information technology institute)': require('../../assets/images/tenants/eciti-logo.png'),
        'eciti eastern cape information technology institute': require('../../assets/images/tenants/eciti-logo.png'),
        'easterncapeinformationtechnologyinstitute': require('../../assets/images/tenants/eciti-logo.png'),
        'kgi bpo': require('../../assets/images/tenants/kgi-bpo-logo.png'),
        'kgibpo': require('../../assets/images/tenants/kgi-bpo-logo.png'),
        'kgi holdings': require('../../assets/images/tenants/kgi-holdings-logo.png'),
        'kgiholdings': require('../../assets/images/tenants/kgi-holdings-logo.png'),
        'the cortex hub': require('../../assets/images/tenants/cortex-hub-logo.png'),
        'cortex hub': require('../../assets/images/tenants/cortex-hub-logo.png'),
        'cortexhub': require('../../assets/images/tenants/cortex-hub-logo.png'),
        'thecortexhub': require('../../assets/images/tenants/cortex-hub-logo.png'),
        'chemin': require('../../assets/images/tenants/chemin-logo.png'),
        'longlife': require('../../assets/images/tenants/longlife-logo.png'),
        'long life': require('../../assets/images/tenants/longlife-logo.png'),
        'longlifeabetconsulting': require('../../assets/images/tenants/longlife-logo.png'),
        'mfuraa': require('../../assets/images/tenants/mfuraa-logo.png'),
        'mfuraaprojects': require('../../assets/images/tenants/mfuraa-logo.png'),
        'phokophela': require('../../assets/images/tenants/phokophela-logo.png'),
        'phokophelainvestmentholdings': require('../../assets/images/tenants/phokophela-logo.png'),
        'zizi': require('../../assets/images/tenants/zizi-logo.png'),
        'msc artisan': require('../../assets/images/tenants/msc-artisan-logo.png'),
        'mscartisanacademy': require('../../assets/images/tenants/msc-artisan-logo.png'),
        'msc artisan academy': require('../../assets/images/tenants/msc-artisan-logo.png'),
        'buffalo city': require('../../assets/images/tenants/buffalo-city-logo.png'),
        'buffalocity': require('../../assets/images/tenants/buffalo-city-logo.png'),
        'amn environmental': require('../../assets/images/tenants/amn-environmental-logo.png'),
        'amnenvironmental': require('../../assets/images/tenants/amn-environmental-logo.png'),
    };

    // Check exact matches first
    if (exactMatches[nameLower]) {
        return exactMatches[nameLower];
    }
    if (exactMatches[nameNormalized]) {
        return exactMatches[nameNormalized];
    }

    // Fuzzy matching (more specific patterns first)
    // KGI BPO must come before KGI
    if ((nameLower.includes('kgi') && nameLower.includes('bpo')) || 
        (nameNormalized.includes('kgi') && nameNormalized.includes('bpo'))) {
        return require('../../assets/images/tenants/kgi-bpo-logo.png');
    }
    
    // Specific tenant name patterns
    if (nameLower === 'samrc' || nameLower.startsWith('samrc') || 
        (nameLower.includes('south african') && nameLower.includes('medical research'))) {
        return require('../../assets/images/tenants/samrc-logo.png');
    }
    
    if (nameLower === 'ecsa' || nameLower.startsWith('ecsa') || 
        (nameLower.includes('engineering') && nameLower.includes('council'))) {
        return require('../../assets/images/tenants/ecsa-logo.png');
    }
    
    if (nameLower === 'ecngoc' || nameLower === 'ecngc' || nameLower.startsWith('ecng') ||
        (nameLower.includes('eastern cape') && (nameLower.includes('ngo coalition') || nameLower.includes('ngoc') || nameLower.includes('government chemist')))) {
        return require('../../assets/images/tenants/ecngoc-logo.png');
    }
    
    if (nameLower === 'eciti' || nameLower.startsWith('eciti') ||
        (nameLower.includes('eastern cape') && nameLower.includes('information technology'))) {
        return require('../../assets/images/tenants/eciti-logo.png');
    }
    
    if ((nameLower.includes('cortex') && nameLower.includes('hub')) || 
        (nameLower.includes('the cortex') && nameLower.includes('hub')) ||
        (nameLower.includes('cortex') && !nameLower.includes('design') && !nameLower.includes('digital'))) {
        return require('../../assets/images/tenants/cortex-hub-logo.png');
    }
    
    if (nameLower.includes('chemin')) {
        return require('../../assets/images/tenants/chemin-logo.png');
    }
    
    if (nameLower.includes('kgi') && !nameLower.includes('bpo')) {
        return require('../../assets/images/tenants/kgi-holdings-logo.png');
    }
    
    if (nameLower.includes('longlife') || nameLower.includes('long life')) {
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
    
    if (nameLower.includes('msc') && (nameLower.includes('artisan') || nameLower.includes('automotive'))) {
        return require('../../assets/images/tenants/msc-artisan-logo.png');
    }
    
    if (nameLower.includes('buffalo') && nameLower.includes('city')) {
        return require('../../assets/images/tenants/buffalo-city-logo.png');
    }
    
    if (nameLower.includes('amn') && nameLower.includes('environmental')) {
        return require('../../assets/images/tenants/amn-environmental-logo.png');
    }
    
    // Facility/center logos (only if not matched above)
    if ((nameLower.includes('analytical') || nameLower.includes('food') || nameLower.includes('water') || 
         nameLower.includes('testing') || nameLower.includes('laboratory')) && 
        !nameLower.includes('design') && !nameLower.includes('digital')) {
        return require('../../assets/images/tenants/analytical-lab.png');
    }
    
    if (nameLower.includes('design') && nameLower.includes('centre') || 
        nameLower.includes('design') && nameLower.includes('center') ||
        (nameLower.includes('innovation') && nameLower.includes('hub') && !nameLower.includes('cortex'))) {
        return require('../../assets/images/tenants/cortex-hub-logo.png');
    }
    
    if (nameLower.includes('renewable') && nameLower.includes('energy') && !nameLower.includes('msc')) {
        return require('../../assets/images/tenants/amn-environmental-logo.png');
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
