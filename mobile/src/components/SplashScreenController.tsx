import { useEffect, useRef } from "react";
import { Animated, Image, View } from "react-native";
import { Text } from "@/components/ui/text";
import * as ExpoSplashScreen from 'expo-splash-screen';
import { useAuthContext } from '@/hooks/use-auth-context'
// import { SplashScreen } from 'expo-router'

// SplashScreen.preventAutoHideAsync()


export function SplashScreen({ onComplete }: { onComplete: () => void }) {
    const { isLoading } = useAuthContext()

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        // Hide the native splash screen immediately when this component mounts
        ExpoSplashScreen.hideAsync();

        // Start animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(logoScale, {
                toValue: 1,
                tension: 10,
                friction: 3,
                useNativeDriver: true,
            }),
        ]).start();

        // Hide splash screen after timer - ProtectedAppRoutes will handle navigation
        const timer = setTimeout(() => {
            onComplete();
        }, 2000);

        return () => clearTimeout(timer);
    }, [fadeAnim, logoScale, onComplete]);

    return (
        <View className="flex-1 justify-center items-center bg-background">
            <Animated.View
                style={{
                    opacity: fadeAnim,
                    transform: [{ scale: logoScale }],
                    alignItems: 'center',
                }}
            >
                {/* ELIDZ Logo */}
                <Image
                    source={require('../../assets/logos/blue text-idz logo.png')}
                    style={{
                        width: 280,
                        height: 120,
                        marginBottom: 40,
                    }}
                    resizeMode="contain"
                />

                {/* Subtitle */}
                <Text className="text-primary text-center mb-5 text-xl font-semibold">
                    Science & Technology Park
                </Text>

                {/* Loading indicator */}
                <View className="flex-row mt-10">
                    {[0, 1, 2].map((index) => (
                        <Animated.View
                            key={index}
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: 'rgb(var(--primary))',
                                marginHorizontal: 4,
                                opacity: fadeAnim.interpolate({
                                    inputRange: [0, 0.3, 0.6, 1],
                                    outputRange: [0.3, 1, 0.3, 0.3],
                                }),
                                transform: [{
                                    scale: fadeAnim.interpolate({
                                        inputRange: [0, 0.3, 0.6, 1],
                                        outputRange: [0.8, 1.2, 0.8, 0.8],
                                    }),
                                }],
                            }}
                        />
                    ))}
                </View>
            </Animated.View>
        </View>
    );
}