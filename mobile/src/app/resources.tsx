import React, { useMemo, useState, useEffect } from 'react';
import { View, Pressable, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/useTheme';
import { Feather } from '@expo/vector-icons';
import { withAuthGuard } from '@/components/withAuthGuard';
import { LinearGradient } from 'expo-linear-gradient';
import { ResourceService } from '@/services/resource.service';
import { Resource } from '@/types';

function ResourcesScreen() {
  const { colors } = useTheme();
  const { category } = useLocalSearchParams<{ category: string }>();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(category || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (category) {
      setSelectedCategory(category);
    }
  }, [category]);

  useEffect(() => {
    fetchResources();
  }, [selectedCategory]);

  async function fetchResources() {
    try {
      setLoading(true);
      const data = await ResourceService.getResources();

      const mappedData = data.map(item => ({
        ...item,
        name: item.title, // UI expects name
        status: item.status || undefined,
      }));
      setResources(mappedData);
    } catch (e) {
      console.error('Exception fetching resources:', e);
      setResources([]);
    } finally {
      setLoading(false);
    }
  }

  const categories = [
    { id: '1', name: 'Testing Labs', icon: 'activity' as const, description: 'Access to specialized testing facilities' },
    { id: '2', name: 'Equipment', icon: 'tool' as const, description: 'Manufacturing and prototyping equipment' },
    { id: '3', name: 'Expertise', icon: 'award' as const, description: 'Consultants and technical advisors' },
    { id: '4', name: 'Training', icon: 'book-open' as const, description: 'Workshops and training programs' },
  ];

  const categoryCounts = useMemo(() => {
    return resources.reduce<Record<string, number>>((acc, resource) => {
      const key = resource.category || 'Uncategorized';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [resources]);

  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory ? resource.category === selectedCategory : true;
    const matchesSearch = searchQuery
      ? resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return matchesCategory && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return '#28A745';
      case 'In Use': return '#FFC107';
      case 'Upcoming': return '#002147';
      default: return '#6C757D';
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
                <Text className="text-white text-3xl font-bold mb-2">Resources</Text>
                <Text className="text-white/80 text-base">
                    Book labs, equipment, and expertise for your projects.
                </Text>

                {/* Search Bar */}
                <View className="flex-row items-center bg-white/10 border border-white/20 h-12 rounded-xl px-4 mt-6 backdrop-blur-sm">
                    <Feather name="search" size={20} color="rgba(255,255,255,0.7)" />
                    <TextInput
                        className="flex-1 ml-3 text-base text-white"
                        placeholder="Search resources..."
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </LinearGradient>

            {/* Categories */}
            <View className="mt-6 px-6 mb-4">
                 <View className="flex-row flex-wrap justify-between">
        {categories.map((category) => {
          const isSelected = selectedCategory === category.name;
          return (
          <Pressable
            key={category.id}
                                className={`w-[48%] mb-4 p-4 rounded-2xl items-center border ${
                                    isSelected 
                                    ? 'bg-[#002147] border-[#002147] shadow-md' 
                                    : 'bg-white border-gray-100 shadow-sm'
                                }`}
              onPress={() => setSelectedCategory(isSelected ? null : category.name)}
          >
                                <View className={`w-12 h-12 rounded-full items-center justify-center mb-2 ${
                                    isSelected ? 'bg-white/20' : 'bg-[#002147]/5'
                                }`}>
                                     <Feather name={category.icon} size={24} color={isSelected ? '#FFFFFF' : '#002147'} />
                                </View>
                                <Text className={`text-xl font-bold mb-1 ${isSelected ? 'text-white' : 'text-[#002147]'}`}>
                                    {categoryCounts[category.name] || 0}
                                </Text>
                                <Text className={`text-xs font-medium text-center ${isSelected ? 'text-white/90' : 'text-gray-500'}`}>
              {category.name}
              </Text>
            </Pressable>
          );
        })}
                 </View>
      </View>

             {/* Resource List Header */}
             <View className="flex-row justify-between items-center px-6 mb-4">
                <Text className="text-xl font-bold text-[#002147]">
                    {selectedCategory ? `${selectedCategory}` : 'All Resources'}
        </Text>
                {(selectedCategory || searchQuery) && (
                     <Pressable onPress={() => {
                         setSelectedCategory(null);
                         setSearchQuery('');
                     }}>
                        <Text className="text-[#FF6600] text-sm font-semibold">Clear Filters</Text>
          </Pressable>
        )}
      </View>

             {/* Resource List */}
             <View className="px-6">
               {loading ? (
                 <ActivityIndicator size="large" color={colors.primary} />
               ) : (
                 <>
                    {filteredResources.length === 0 ? (
                            <View className="items-center py-12 bg-white rounded-2xl border border-gray-100">
                                <View className="bg-gray-50 p-4 rounded-full mb-4">
                                    <Feather name="inbox" size={32} color="#CBD5E0" />
                                </View>
                                <Text className="text-gray-400 text-base text-center font-medium">
                                    No resources found matching your criteria
              </Text>
                </View>
              ) : (
                filteredResources.map((resource) => (
                <Pressable
                  key={resource.id}
                                    className="bg-white mb-3 p-4 rounded-xl border border-gray-100 shadow-sm active:opacity-95"
                  onPress={() => router.push({ pathname: '/resource-detail', params: { id: resource.id, name: resource.name } })}
                >
                                    <View className="flex-row items-start">
                                        <View className="flex-1">
                                            <Text className="text-[#002147] text-base font-bold mb-1" numberOfLines={1}>
                        {resource.name}
                      </Text>
                                            <View className="flex-row items-center flex-wrap mb-2">
                                                {resource.category && (
                                                  <View className="bg-gray-100 px-2 py-0.5 rounded-md mr-2 mb-1">
                                                      <Text className="text-gray-600 text-[10px] font-medium uppercase">
                                                          {resource.category}
                                                      </Text>
                                                  </View>
                                                )}
                                                {resource.status && (
                                                  <View className="flex-row items-center mb-1">
                                                      <View className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: getStatusColor(resource.status) }} />
                                                      <Text className="text-[10px] font-medium" style={{ color: getStatusColor(resource.status) }}>
                                                          {resource.status}
                                                      </Text>
                                                  </View>
                                                )}
                                            </View>
                                            <Text className="text-gray-500 text-xs leading-relaxed" numberOfLines={2}>
                      {resource.description}
                    </Text>
                                        </View>
                                        <View className="ml-3 justify-center h-full">
                                            <Feather name="chevron-right" size={20} color="#CBD5E0" />
                                        </View>
                  </View>
                </Pressable>
                ))
              )}
                 </>
               )}
             </View>
        </ScrollView>
    </View>
  );
}

export default withAuthGuard(ResourcesScreen);
