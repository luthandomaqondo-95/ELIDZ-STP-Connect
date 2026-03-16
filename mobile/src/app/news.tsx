import React, { useEffect, useState } from 'react';
import { View, Pressable, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Text } from '@/components/ui/text';
import { ScreenScrollView } from '@/components/ScreenScrollView';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { NewsService, News } from '@/services/news.service';
import { useColorScheme } from '@/hooks/use-theme-color';
import { COLORS } from '@/theme/colors';

export default function NewsScreen() {
  const { colorScheme } = useColorScheme();
  const colors = COLORS[colorScheme];
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await NewsService.getAllNews();
        if (!cancelled) setNews(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load news');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const getCategoryColor = (category?: string): string => {
    switch (category) {
      case 'Corporate': return colors.primary;
      case 'Achievements': return colors.accent;
      case 'Training': return colors.success;
      case 'Community': return colors.info;
      case 'Partnership': return colors.purple;
      case 'Events': return '#E83E8C';
      default: return '#3B6E8F';
    }
  };

  const getCategoryIcon = (category?: string): keyof typeof Feather.glyphMap => {
    switch (category) {
      case 'Corporate': return 'trending-up';
      case 'Achievements': return 'award';
      case 'Training': return 'zap';
      case 'Community': return 'monitor';
      case 'Partnership': return 'users';
      case 'Events': return 'calendar';
      default: return 'file-text';
    }
  };

  if (loading) {
    return (
      <ScreenScrollView>
        <View className="items-center py-12">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-muted-foreground mt-4">Loading news...</Text>
        </View>
      </ScreenScrollView>
    );
  }

  if (error) {
    return (
      <ScreenScrollView>
        <View className="items-center py-12">
          <Feather name="alert-circle" size={48} color={colors.error ?? '#EF4444'} />
          <Text className="text-destructive text-base mt-4 text-center font-medium">{error}</Text>
        </View>
      </ScreenScrollView>
    );
  }

  return (
    <ScreenScrollView>
      <Text className="text-muted-foreground text-base mb-6">
        Stay updated with the latest news and announcements from ELIDZ-STP
      </Text>

      {!news || news.length === 0 ? (
        <View className="items-center py-12">
          <Feather name="file-text" size={48} color={colors.iconGray} />
          <Text className="text-muted-foreground text-base mt-4 text-center">No news available</Text>
        </View>
      ) : (
        news.map((item) => (
          <Pressable
            key={item.id}
            className="bg-card rounded-2xl mb-4 border border-border shadow-sm overflow-hidden active:opacity-95"
            onPress={() => router.push(`/news-detail?id=${item.id}`)}
          >
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} className="w-full h-40" resizeMode="cover" />
            ) : (
              <View
                className="w-full h-32 justify-center items-center"
                style={{ backgroundColor: getCategoryColor(item.category) }}
              >
                <Feather name={getCategoryIcon(item.category)} size={48} color="#FFFFFF" />
              </View>
            )}
            <View className="p-4">
              <View className="flex-row justify-between items-center mb-2">
                {item.category && (
                  <View
                    className="px-3 py-1 rounded-lg"
                    style={{ backgroundColor: `${getCategoryColor(item.category)}20` }}
                  >
                    <Text className="text-xs font-semibold" style={{ color: getCategoryColor(item.category) }}>
                      {item.category}
                    </Text>
                  </View>
                )}
                <Text className="text-muted-foreground text-xs">
                  {item.formattedDate || new Date(item.published_at).toLocaleDateString()}
                </Text>
              </View>
              <Text className="text-foreground text-base font-bold mb-2" numberOfLines={2}>
                {item.title}
              </Text>
              <Text className="text-muted-foreground text-sm" numberOfLines={2}>
                {item.excerpt || item.content?.substring(0, 150) + '...'}
              </Text>
            </View>
          </Pressable>
        ))
      )}
    </ScreenScrollView>
  );
}
