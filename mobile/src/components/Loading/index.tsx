import React from 'react';
import { View, Animated } from 'react-native';
import { useColorScheme } from '@/hooks/use-theme-color';
import { COLORS } from '@/theme/colors';

export interface ListSkeletonProps {
  count?: number;
}

export function ListSkeleton({ count = 5 }: ListSkeletonProps) {
  const { colorScheme } = useColorScheme();
  const colors = COLORS[colorScheme];
  const shimmerAnim = new Animated.Value(0);

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View className="gap-3 px-4">
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} className="mb-4">
          {/* Header skeleton */}
          <View className="flex-row items-center gap-3 mb-3">
            <Animated.View
              style={[
                {
                  opacity: shimmerOpacity,
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: colors.grayMuted,
                },
              ]}
            />
            <View className="flex-1">
              <Animated.View
                style={[
                  {
                    opacity: shimmerOpacity,
                    height: 14,
                    borderRadius: 4,
                    backgroundColor: colors.grayMuted,
                    marginBottom: 8,
                  },
                ]}
              />
              <Animated.View
                style={[
                  {
                    opacity: shimmerOpacity,
                    height: 12,
                    width: '70%',
                    borderRadius: 4,
                    backgroundColor: colors.grayMuted,
                  },
                ]}
              />
            </View>
          </View>

          {/* Body skeleton lines */}
          <View className="gap-2">
            <Animated.View
              style={[
                {
                  opacity: shimmerOpacity,
                  height: 10,
                  borderRadius: 4,
                  backgroundColor: colors.grayMuted,
                },
              ]}
            />
            <Animated.View
              style={[
                {
                  opacity: shimmerOpacity,
                  height: 10,
                  width: '85%',
                  borderRadius: 4,
                  backgroundColor: colors.grayMuted,
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}
