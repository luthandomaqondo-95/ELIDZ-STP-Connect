import React, { useState, useEffect } from 'react';
import { View, Pressable, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/useTheme';
import { useAuthContext } from '@/hooks/use-auth-context';
import { Feather } from '@expo/vector-icons';
import { withAuthGuard } from '@/components/withAuthGuard';
import { LinearGradient } from 'expo-linear-gradient';
import { ResourceService } from '@/services/resource.service';
import { Resource } from '@/types';

function ResourcesScreen() {
  const { colors } = useTheme();
  const { profile: user } = useAuthContext();
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
      
      // Filter by category if selected
      let filteredData = data;
      if (selectedCategory) {
        filteredData = data.filter(r => r.category === selectedCategory);
      }

      const mappedData = filteredData.map(item => ({
        ...item,
        name: item.title, // UI expects name
        status: 'Available', // Default status
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
    { id: '1', name: 'Testing Labs', icon: 'activity' as const, count: 5, description: 'Access to specialized testing facilities' },
    { id: '2', name: 'Equipment', icon: 'tool' as const, count: 5, description: 'Manufacturing and prototyping equipment' },
    { id: '3', name: 'Expertise', icon: 'award' as const, count: 4, description: 'Consultants and technical advisors' },
    { id: '4', name: 'Training', icon: 'book-open' as const, count: 5, description: 'Workshops and training programs' },
  ];

  // Filter resources based on search query (category is handled by DB fetch or client filter)
  // Since we fetch by category, we only filter by search here. 
  // But if selectedCategory is null, we fetched all, so we filter by search.
  // Actually, let's keep client side filtering for search to be snappy.
  const filteredResources = resources.filter(resource => {
    // If we changed category, we refetched, so resources should already be filtered by category (mostly)
    // But let's double check if we want to be safe or if we want to support client-side filtering of all data
    
    // For now, let's assume resources contains what we want to show based on category
    // and we only filter by search query
    
    const matchesSearch = searchQuery 
      ? resource.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        resource.description?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return matchesSearch;
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
                                {/* We don't have real counts yet, so maybe hide or static */}
                                <Text className={`text-xl font-bold mb-1 ${isSelected ? 'text-white' : 'text-[#002147]'}`}>
                                    {/* {category.count} */} -
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
                 <ActivityIndicator size="large" color="#002147" />
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
                                                <View className="bg-gray-100 px-2 py-0.5 rounded-md mr-2 mb-1">
                                                    <Text className="text-gray-600 text-[10px] font-medium uppercase">
                                                        {resource.category}
                                                    </Text>
                    </View>
                                                <View className="flex-row items-center mb-1">
                                                    <View className={`w-2 h-2 rounded-full mr-1`} style={{ backgroundColor: getStatusColor(resource.status) }} />
                                                    <Text className="text-[10px] font-medium" style={{ color: getStatusColor(resource.status) }}>
                        {resource.status}
                      </Text>
                    </View>
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
