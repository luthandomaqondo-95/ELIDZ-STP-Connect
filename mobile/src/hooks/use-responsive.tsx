import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

export interface ResponsiveDimensions {
    width: number;
    height: number;
    isSmallDevice: boolean;
    isMediumDevice: boolean;
    isLargeDevice: boolean;
    scale: number;
}

// Breakpoints for different device sizes
const SMALL_DEVICE_WIDTH = 375;
const MEDIUM_DEVICE_WIDTH = 414;
const LARGE_DEVICE_WIDTH = 768;

export function useResponsive(): ResponsiveDimensions {
    const [dimensions, setDimensions] = useState(() => {
        const { width, height } = Dimensions.get('window');
        return {
            width,
            height,
            isSmallDevice: width < SMALL_DEVICE_WIDTH,
            isMediumDevice: width >= SMALL_DEVICE_WIDTH && width < MEDIUM_DEVICE_WIDTH,
            isLargeDevice: width >= MEDIUM_DEVICE_WIDTH,
            scale: width / 375, // Base scale on iPhone X/11/12 (375px width)
        };
    });

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
            setDimensions({
                width: window.width,
                height: window.height,
                isSmallDevice: window.width < SMALL_DEVICE_WIDTH,
                isMediumDevice: window.width >= SMALL_DEVICE_WIDTH && window.width < MEDIUM_DEVICE_WIDTH,
                isLargeDevice: window.width >= MEDIUM_DEVICE_WIDTH,
                scale: window.width / 375,
            });
        });

        return () => subscription?.remove();
    }, []);

    return dimensions;
}

// Helper function to get responsive font size
export function getResponsiveFontSize(baseSize: number, scale?: number): number {
    const { scale: deviceScale } = useResponsive();
    const finalScale = scale || deviceScale;
    return Math.max(baseSize * finalScale, baseSize * 0.9); // Minimum 90% of base size
}

// Helper function to get responsive spacing
export function getResponsiveSpacing(baseSpacing: number, scale?: number): number {
    const { scale: deviceScale } = useResponsive();
    const finalScale = scale || deviceScale;
    return Math.round(baseSpacing * finalScale);
}

