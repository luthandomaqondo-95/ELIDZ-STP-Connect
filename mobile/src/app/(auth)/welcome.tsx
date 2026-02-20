import React, { useRef, useState } from 'react';
import { View, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useColorScheme } from '@/hooks/use-theme-color';
import { COLORS } from '@/theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stars } from '@/components/Stars';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    key: '1',
    title: 'Welcome to ELIDZ-STP',
    subtitle: 'Science & Technology Park',
    description: 'Your gateway to innovation, funding, and growth in the Eastern Cape.',
    icon: 'zap' as const,
  },
  {
    key: '2',
    title: 'Connect & Grow',
    subtitle: 'Opportunities for everyone',
    description: 'Discover funding, incubation, events, and connect with tenants and partners.',
    icon: 'users' as const,
  },
  {
    key: '3',
    title: 'Get Started',
    subtitle: 'Join the community',
    description: 'Continue as a guest, sign up, or log in to unlock the full experience.',
    icon: 'star' as const,
  },
];

export default function WelcomeScreen() {
  const { colorScheme } = useColorScheme();
  const colors = COLORS[colorScheme ?? 'light'];
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.x;
    const index = Math.round(offset / width);
    setCurrentIndex(index);
  };

  const goToAuthChoice = () => router.replace('/(auth)/auth-choice');

  return (
    <View className="flex-1 bg-background">
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
        className="absolute inset-0"
        style={{ height }}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <Stars />
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 pt-4">
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            onMomentumScrollEnd={onScroll}
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
          >
            {SLIDES.map((slide) => (
              <View key={slide.key} style={{ width }} className="flex-1 px-8 justify-center items-center">
                <View className="w-20 h-20 rounded-full bg-white/10 justify-center items-center mb-6">
                  <Feather name={slide.icon} size={36} color="#FFFFFF" />
                </View>
                <Text className="text-white text-2xl font-bold text-center mb-2">{slide.title}</Text>
                <Text className="text-white/80 text-base text-center mb-2">{slide.subtitle}</Text>
                <Text className="text-white/70 text-sm text-center max-w-[280px]">{slide.description}</Text>
              </View>
            ))}
          </ScrollView>

          <View className="flex-row justify-center gap-2 mb-8">
            {SLIDES.map((_, i) => (
              <View
                key={i}
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: i === currentIndex ? '#FFFFFF' : 'rgba(255,255,255,0.4)' }}
              />
            ))}
          </View>

          <View className="px-8 pb-8">
            <Button
              className="rounded-xl bg-white py-3.5 px-6"
              style={{ minHeight: 48 }}
              onPress={goToAuthChoice}
            >
              <Text className="text-[#002147] font-bold text-base">Get Started</Text>
            </Button>
            <View className="flex-row justify-center mt-4 items-center">
              <Text className="text-white/70 text-sm">Already have an account? </Text>
              <Pressable onPress={() => router.replace('/(auth)/login')} hitSlop={8}>
                <Text className="text-white font-semibold text-sm underline">Log In</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
