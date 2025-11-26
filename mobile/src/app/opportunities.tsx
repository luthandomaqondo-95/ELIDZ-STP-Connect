import React, { useState, useEffect } from 'react';
import { View, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenFlatList } from '@/components/ScreenFlatList';
import { useAuthContext } from '@/hooks/use-auth-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { withAuthGuard } from '@/components/withAuthGuard';
import { OpportunityService } from '@/services/opportunity.service';
import { Opportunity } from '@/types';

function OpportunitiesScreen() {
  const params = useLocalSearchParams<{ filter?: string }>();
  const { profile: user } = useAuthContext();
  const insets = useSafeAreaInsets();
  
  // Get initial filter from params or role-based default
  const getInitialFilter = () => {
    if (params?.filter) return params.filter;
    if (!user) return 'All';
    
    switch (user.role) {
      case 'Entrepreneur': return 'Funding';
      case 'Researcher': return 'Funding';
      case 'SME': return 'Tenders';
      case 'Student': return 'Internships';
      case 'Investor': return 'Funding';
      case 'Tenant': return 'Tenders';
      default: return 'All';
    }
  };
  
  const [selectedFilter, setSelectedFilter] = useState(getInitialFilter());
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  // Update filter when params change
  useEffect(() => {
    if (params?.filter) {
      setSelectedFilter(params.filter);
    }
  }, [params?.filter]);

  // Fetch opportunities from Supabase
  useEffect(() => {
    fetchOpportunities();
  }, [selectedFilter]);

  async function fetchOpportunities() {
    try {
      setLoading(true);
      const data = await OpportunityService.getOpportunities(selectedFilter === 'All' ? undefined : selectedFilter);
      setOpportunities(data);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  }

  const filters = ['All', 'Tenders', 'Employment', 'Training', 'Internships', 'Bursaries', 'Incubation', 'Funding'];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Tenders': return 'file-text';
      case 'Employment': return 'briefcase';
      case 'Training': return 'book-open';
      case 'Internships': return 'user';
      case 'Bursaries': return 'graduation-cap';
      case 'Incubation': return 'trending-up';
      case 'Funding': return 'dollar-sign';
      default: return 'info';
    }
  };

  function renderOpportunity({ item }: { item: Opportunity }) {
    return (
      <Pressable
        className="p-4 mx-6 mb-3 rounded-xl bg-card active:opacity-90 shadow-sm"
        onPress={() => router.push({ pathname: '/opportunity-detail', params: { id: item.id } })}
      >
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row items-center px-3 py-1 rounded-lg bg-accent">
            <Feather
              name={getTypeIcon(item.type) as any}
              size={16}
              color="#FFFFFF"
            />
            <Text className="text-white text-xs ml-1">
              {item.type}
            </Text>
          </View>
          <Text className="text-muted-foreground text-xs">
            {item.deadline || 'Open'}
          </Text>
        </View>
        <Text className="text-base font-semibold text-foreground mb-1">
          {item.title}
        </Text>
        <Text className="text-muted-foreground text-sm mb-2">
          {item.org}
        </Text>
        <Text className="text-foreground text-sm" numberOfLines={2}>
          {item.description}
        </Text>
      </Pressable>
    );
  }

  return (
    <>
      <ScreenFlatList
        data={opportunities}
        renderItem={renderOpportunity}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={fetchOpportunities}
        ListHeaderComponent={
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={filters}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Pressable
                className={`px-4 py-2 rounded-lg mr-3 active:opacity-70 ${
                  selectedFilter === item ? 'bg-primary' : 'bg-card'
                }`}
                onPress={() => setSelectedFilter(item)}
              >
                <Text
                  className={`text-sm ${
                    selectedFilter === item ? 'text-primary-foreground' : 'text-foreground'
                  }`}
                >
                  {item}
                </Text>
              </Pressable>
            )}
            className="mb-5"
            contentContainerStyle={{ paddingHorizontal: 20 }}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View className="items-center justify-center py-10 px-6">
              <Text className="text-muted-foreground text-center">
                No opportunities found for {selectedFilter}.
              </Text>
            </View>
          ) : null
        }
      />
      <Pressable
        className="absolute right-5 w-14 h-14 rounded-full bg-accent justify-center items-center active:opacity-90 shadow-lg"
        style={{ bottom: insets.bottom + 20 }}
        onPress={() => router.push('/post-opportunity')}
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
      </Pressable>
    </>
  );
}

export default withAuthGuard(OpportunitiesScreen);
