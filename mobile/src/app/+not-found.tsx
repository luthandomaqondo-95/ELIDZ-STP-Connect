import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { Ionicons } from "@expo/vector-icons";
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useColorScheme } from '@/hooks/use-theme-color';


export default function NotFoundScreen() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    
    // Animation values
    const iconScale = useSharedValue(0);
    const iconRotate = useSharedValue(0);
    const contentOpacity = useSharedValue(0);
    const contentTranslateY = useSharedValue(30);

    useEffect(() => {
        // Icon bounce animation
        iconScale.value = withSpring(1, {
            damping: 8,
            stiffness: 100,
        });
        
        // Icon subtle rotation
        iconRotate.value = withSequence(
            withTiming(-10, { duration: 300 }),
            withTiming(10, { duration: 300 }),
            withTiming(0, { duration: 300 })
        );

        // Content fade in
        contentOpacity.value = withTiming(1, {
            duration: 600,
            easing: Easing.out(Easing.cubic),
        });
        
        contentTranslateY.value = withSpring(0, {
            damping: 12,
            stiffness: 90,
        });
    }, []);

    const iconAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: iconScale.value },
            { rotate: `${iconRotate.value}deg` }
        ],
    }));

    const contentAnimatedStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.value,
        transform: [{ translateY: contentTranslateY.value }],
    }));

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View className='flex-1 bg-background items-center justify-center px-6'>
                <Animated.View style={iconAnimatedStyle} className="mb-8">
                    <View className="bg-destructive/10 dark:bg-destructive/20 rounded-full p-6">
                        <Ionicons 
                            name="alert-circle" 
                            size={80} 
                            color={colorScheme === 'dark' ? '#FE4336' : '#FF382B'}
                        />
                    </View>
                </Animated.View>

                <Animated.View style={contentAnimatedStyle} className="w-full max-w-md">
                    <Card className="border-border/50 rounded-3xl">
                        <CardContent className="items-center gap-6 pt-6">
                            <View className="items-center gap-2">
                                {/* <Text className="text-4xl font-bold text-foreground">404</Text> */}
                                <Text className="text-2xl font-semibold text-foreground">Page Not Found</Text>
                                <Text className="text-base text-muted-foreground text-center mt-2">
                                    Oops! The page you're looking for doesn't exist or has been moved.
                                </Text>
                            </View>

                            <View className="w-full gap-3">
                                <Button 
                                    onPress={() => router.back()}
                                    variant="default"
                                    className="w-full rounded-full"
                                >
                                    <Ionicons name="arrow-back" size={20} />
                                    <Text className="font-semibold">Go Back</Text>
                                </Button>
                            </View>
                        </CardContent>
                    </Card>
                </Animated.View>
            </View>
        </>
    );
}