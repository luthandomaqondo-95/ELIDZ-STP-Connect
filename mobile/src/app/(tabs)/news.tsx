import React, { useState } from 'react';
import { View, Pressable, ScrollView, TextInput, ActivityIndicator, Image } from 'react-native';
import { Text } from '@/components/ui/text';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { HeaderAvatar } from '@/components/HeaderAvatar';
import { useNewsSearch } from '@/hooks/useSearch';
import { useDebounce } from '@/hooks/useDebounce';

export default function NewsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data: news, isLoading, error } = useNewsSearch(debouncedSearch);

  const getCategoryColor = (category?: string): string => {
    switch (category) {
      case 'Corporate':
        return '#002147';
      case 'Achievements':
        return '#FF6600';
      case 'Training':
        return '#28A745';
      case 'Community':
        return '#17A2B8';
      case 'Partnership':
        return '#6F42C1';
      case 'Events':
        return '#E83E8C';
      default:
        return '#002147';
    }
  };

  const getCategoryIcon = (category?: string): keyof typeof Feather.glyphMap => {
    switch (category) {
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

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <LinearGradient
          colors={['#002147', '#003366']}
          className="pt-12 pb-6 px-6 rounded-b-[30px] shadow-lg"
        >
          <View className="flex-row justify-between items-center mb-2">
            <View className="flex-1">
              <Text className="text-white text-3xl font-bold mb-2">News</Text>
              <Text className="text-white/80 text-base">
                Stay updated with the latest from ELIDZ-STP
              </Text>
            </View>
            <HeaderAvatar />
          </View>

          {/* Search Bar */}
          <View className="flex-row items-center bg-white/10 border border-white/20 h-12 rounded-xl px-4 mt-6 backdrop-blur-sm">
            <Feather name="search" size={20} color="rgba(255,255,255,0.7)" />
            <TextInput
              className="flex-1 ml-3 text-base text-white"
              placeholder="Search news..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} className="ml-2">
                <Feather name="x" size={18} color="rgba(255,255,255,0.7)" />
              </Pressable>
            )}
          </View>
        </LinearGradient>

        {/* News List */}
        <View className="px-6 mt-6">
          {isLoading ? (
            <View className="items-center py-12">
              <ActivityIndicator size="large" color="#002147" />
              <Text className="text-gray-500 mt-4">Loading news...</Text>
            </View>
          ) : error ? (
            <View className="items-center py-12 bg-white rounded-2xl border border-red-100">
              <Feather name="alert-circle" size={48} color="#EF4444" />
              <Text className="text-red-600 text-base mt-4 text-center font-medium">
                Failed to load news
              </Text>
              <Text className="text-gray-500 text-sm mt-2 text-center">
                Please try again later
              </Text>
            </View>
          ) : !news || news.length === 0 ? (
            <View className="items-center py-12 bg-white rounded-2xl border border-gray-100 border-dashed">
              <Feather name="file-text" size={48} color="#CBD5E0" />
              <Text className="text-gray-400 text-base mt-4 text-center font-medium">
                {searchQuery ? 'No news found' : 'No news available'}
              </Text>
              <Text className="text-gray-400 text-sm mt-2 text-center">
                {searchQuery ? 'Try a different search term' : 'Check back soon for updates'}
              </Text>
            </View>
          ) : (
            news.map((item) => (
              <Pressable
                key={item.id}
                className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm active:opacity-95"
                onPress={() => router.push(`/news-detail?id=${item.id}`)}
              >
                <View className="flex-row items-start">
                  {item.image_url ? (
                    <Image
                      source={{ uri: item.image_url }}
                      className="w-14 h-14 rounded-xl"
                      resizeMode="cover"
                    />
                  ) : (
                    <View 
                      className="w-14 h-14 rounded-xl justify-center items-center"
                      style={{ backgroundColor: getCategoryColor(item.category) }}
                    >
                      <Feather name={getCategoryIcon(item.category)} size={24} color="#FFFFFF" />
                    </View>
                  )}
                  <View className="flex-1 ml-4">
                    {item.category && (
                      <View className="flex-row justify-between items-center mb-2">
                        <View 
                          className="px-3 py-1 rounded-lg"
                          style={{ backgroundColor: `${getCategoryColor(item.category)}20` }}
                        >
                          <Text 
                            className="text-xs font-semibold"
                            style={{ color: getCategoryColor(item.category) }}
                          >
                            {item.category}
                          </Text>
                        </View>
                        <Text className="text-gray-400 text-xs">
                          {item.formattedDate || new Date(item.published_at).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                    {!item.category && (
                      <View className="flex-row justify-end mb-2">
                        <Text className="text-gray-400 text-xs">
                          {item.formattedDate || new Date(item.published_at).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                    <Text className="text-[#002147] text-base font-bold mb-2" numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text className="text-gray-500 text-sm" numberOfLines={2}>
                      {item.excerpt || item.content?.substring(0, 150) + '...'}
                    </Text>
                    {item.author && (
                      <View className="flex-row items-center mt-2">
                        <Feather name="user" size={12} color="#6C757D" />
                        <Text className="text-gray-400 text-xs ml-1">
                          {item.author.name}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

