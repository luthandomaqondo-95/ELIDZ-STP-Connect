import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenScrollView } from '@/components/ScreenScrollView';
import { useTheme } from '@/hooks/useTheme';
import { Feather } from '@expo/vector-icons';
import { withAuthGuard } from '@/components/withAuthGuard';
import { NewsService, News } from '@/services/news.service';
import { TabsLayoutHeader } from '@/components/Header';

function NewsDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNews() {
      if (!id) {
        setError('News ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const newsItem = await NewsService.getNewsById(id);
        if (newsItem) {
          setNews(newsItem);
        } else {
          setError('News article not found');
        }
      } catch (err: any) {
        console.error('Error loading news:', err);
        setError(err.message || 'Failed to load news article');
      } finally {
        setLoading(false);
      }
    }

    loadNews();
  }, [id]);

  if (loading) {
    return (
      <ScreenScrollView insetTop={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="bg-background">
          <TabsLayoutHeader title="News" variant="navy">
            <Text className="text-white/80 text-base">
              Article details.
            </Text>
          </TabsLayoutHeader>
        </View>
        <View className="p-5 items-center justify-center min-h-[400px]">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-base text-muted-foreground mt-3">
            Loading news article...
          </Text>
        </View>
      </ScreenScrollView>
    );
  }

  if (error || !news) {
    return (
      <ScreenScrollView insetTop={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="bg-background">
          <TabsLayoutHeader title="News" variant="navy">
            <Text className="text-white/80 text-base">
              Article details.
            </Text>
          </TabsLayoutHeader>
        </View>
        <View className="p-5 items-center justify-center min-h-[400px]">
          <Feather name="alert-circle" size={48} color={colors.error || '#EF4444'} />
          <Text className="text-lg font-bold mt-3 text-center text-destructive">
            {error || 'News article not found'}
          </Text>
          <Text className="text-base text-muted-foreground mt-2.5 text-center">
            Please try again later
          </Text>
        </View>
      </ScreenScrollView>
    );
  }

  // Fallback category mapping (can be removed when category is added to DB)
  const getCategoryFromTitle = (title: string): string => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('agm') || titleLower.includes('performance') || titleLower.includes('financial')) {
      return 'Corporate';
    }
    if (titleLower.includes('audit') || titleLower.includes('achievement') || titleLower.includes('elected') || titleLower.includes('president')) {
      return 'Achievements';
    }
    if (titleLower.includes('training') || titleLower.includes('workshop') || titleLower.includes('certificate')) {
      return 'Training';
    }
    if (titleLower.includes('community') || titleLower.includes('school') || titleLower.includes('laboratory')) {
      return 'Community';
    }
    if (titleLower.includes('partnership') || titleLower.includes('unisa') || titleLower.includes('challenge')) {
      return 'Partnership';
    }
    return 'News';
  };

  const category = news.category || getCategoryFromTitle(news.title);

  const categoryColors: Record<string, string> = {
    Corporate: colors.primary,
    Achievements: colors.accent,
    Training: colors.secondary,
    Community: colors.primary,
    Partnership: colors.secondary,
    Events: colors.accent,
    News: colors.primary,
  };

  const getCategoryIcon = (cat?: string): keyof typeof Feather.glyphMap => {
    switch (cat) {
      case 'Corporate':
        return 'trending-up';
      case 'Achievements':
        return 'award';
      case 'Training':
        return 'zap';
      case 'Community':
        return 'monitor';
      case 'Partnership':
        return 'users';
      case 'Events':
        return 'calendar';
      default:
        return 'file-text';
    }
  };

  const { width } = Dimensions.get('window');
  const imageHeight = Math.min(240, width * 0.55);

  return (
    <ScreenScrollView insetTop={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="bg-background">
        <TabsLayoutHeader title="News" variant="navy">
          <Text className="text-white/80 text-base">
            Article details.
          </Text>
        </TabsLayoutHeader>
      </View>

      <View className="mt-6 px-5">
        {/* Hero image - full picture visible */}
        {news.image_url ? (
          <View className="rounded-2xl overflow-hidden mb-4 border border-border bg-muted/20">
            <Image
              source={{ uri: news.image_url }}
              style={{ width: width - 40, height: imageHeight }}
              contentFit="contain"
            />
          </View>
        ) : (
          <View
            className="rounded-2xl mb-4 p-6 justify-center items-center"
            style={{ backgroundColor: categoryColors[category] || colors.primary, minHeight: imageHeight }}
          >
            <Feather name={getCategoryIcon(category)} size={64} color={colors.buttonText} />
          </View>
        )}

        {category && (
          <View
            className="self-start px-3 py-1.5 rounded-lg mb-3"
            style={{ backgroundColor: `${categoryColors[category] || colors.primary}20` }}
          >
            <Text className="text-xs font-semibold" style={{ color: categoryColors[category] || colors.primary }}>
              {category}
            </Text>
          </View>
        )}
        <Text className="text-xl font-bold text-foreground mb-4">
          {news.title}
        </Text>

        <View className="p-4 rounded-xl mb-4 bg-card shadow-sm border border-border">
          <View className="flex-row justify-between flex-wrap">
            <View className="flex-row items-center mb-2">
              <Feather name="calendar" size={16} color={colors.textSecondary} />
              <Text className="text-sm text-muted-foreground ml-1">
                {news.formattedDate || new Date(news.published_at).toLocaleDateString()}
              </Text>
            </View>
            {news.author && (
              <View className="flex-row items-center mb-2">
                <Feather name="user" size={16} color={colors.textSecondary} />
                <Text className="text-sm text-muted-foreground ml-1">
                  {news.author.name || 'ELIDZ Communications'}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="p-3 rounded-xl mb-3 bg-card shadow-sm">
          <Text className="text-base text-foreground leading-6">
            {news.content}
          </Text>
        </View>
      </View>
    </ScreenScrollView>
  );
}

export default withAuthGuard(NewsDetailScreen);

