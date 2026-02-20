import React, { useState, useEffect } from 'react';
import { View, Pressable, ActivityIndicator, ScrollView, TextInput , Dimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { useAuthContext } from '@/hooks/use-auth-context';
import { Feather } from '@expo/vector-icons';
import { withAuthGuard } from '@/components/withAuthGuard';
import { OpportunityService } from '@/services/opportunity.service';
import { Opportunity } from '@/types';
import { useColorScheme } from '@/hooks/use-theme-color';
import { COLORS } from '@/theme/colors';
import { useDebounce } from '@/hooks/useDebounce';
import { TabsLayoutHeader } from '@/components/Header';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

function OpportunitiesScreen() {
  const params = useLocalSearchParams<{ filter?: string }>();
  const { profile: user } = useAuthContext();
  const { colorScheme } = useColorScheme();
  const colors = COLORS[colorScheme];
  
  // Get initial filter from params or role-based default
  const getInitialFilter = () => {
    if (params?.filter) return params.filter;
    if (!user) return 'All';
    
    switch (user.role) {
      case 'Entrepreneur': return 'Funding';
      case 'Researcher': return 'Funding';
      case 'SMME': return 'Tenders';
      case 'Student': return 'Internships';
      case 'Investor': return 'Funding';
      case 'Tenant': return 'Tenders';
      default: return 'All';
    }
  };
  
  const [selectedFilter, setSelectedFilter] = useState(getInitialFilter());
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

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
      // Filter by search query if provided
      let filteredData = data;
      if (debouncedSearch.trim()) {
        filteredData = data.filter(opp => 
          opp.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          opp.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          (opp.org && opp.org.toLowerCase().includes(debouncedSearch.toLowerCase()))
        );
      }
      setOpportunities(filteredData);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  }

  // Refetch when search query or filter changes
  useEffect(() => {
    fetchOpportunities();
  }, [selectedFilter, debouncedSearch]);

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

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'Tenders': return colors.primary;
      case 'Employment': return colors.success;
      case 'Training': return colors.info;
      case 'Internships': return colors.purple;
      case 'Bursaries': return colors.pink;
      case 'Incubation': return colors.accent;
      case 'Funding': return colors.destructive;
      default: return colors.primary;
    }
  };

  function renderOpportunity(item: Opportunity) {
    const typeColor = getTypeColor(item.type);
    
    return (
      <Pressable
        key={item.id}
        className="bg-card rounded-2xl p-4 mb-4 border border-border shadow-sm active:opacity-95"
        onPress={() => router.push({ pathname: '/opportunity-detail', params: { id: item.id } })}
      >
        <View className="flex-row items-start justify-between mb-3">
          <View 
            className="flex-row items-center px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: `${typeColor}20` }}
          >
            <Feather
              name={getTypeIcon(item.type) as any}
              size={16}
              style={{ color: typeColor }}
            />
            <Text 
              className="text-xs font-semibold ml-1.5"
              style={{ color: typeColor }}
            >
              {item.type}
            </Text>
          </View>
          <Text className="text-muted-foreground text-xs">
            {item.deadline || 'Open'}
          </Text>
        </View>
        <Text className="text-foreground text-base font-bold mb-2" numberOfLines={2}>
          {item.title}
        </Text>
        {item.org && (
          <Text className="text-muted-foreground text-sm mb-2">
            {item.org}
          </Text>
        )}
        <Text className="text-foreground text-sm" numberOfLines={2}>
          {item.description}
        </Text>
        <View className="flex-row items-center mt-3 pt-3 border-t border-border">
          <Feather name="chevron-right" size={16} color={colors.accent} />
          <Text className="text-xs font-semibold ml-1" style={{ color: colors.accent }}>
            View Details
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="bg-background">
          <TabsLayoutHeader title="Opportunities" variant="navy">
            <View
              style={{ maxWidth: isTablet ? 1200 : '100%', alignSelf: 'center', width: '100%' }}
            >
              <Text className="text-white/80 text-base mb-6">
                Discover funding, jobs, and growth opportunities
              </Text>

              {/* Search Bar */}
              <View
                className="flex-row items-center bg-white/10 border border-white/20 h-12 rounded-xl px-4"
              >
                <Feather name="search" size={20} color={colors.whiteOpacity70} />
                <TextInput
                  className="flex-1 ml-3 text-base text-white"
                  placeholder="Search opportunities..."
                  placeholderTextColor={colors.whiteOpacity50}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <Pressable
                    onPress={() => setSearchQuery('')}
                    className="ml-2"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Feather name="x" size={18} color={colors.whiteOpacity70} />
                  </Pressable>
                )}
              </View>
            </View>
          </TabsLayoutHeader>
        </View>

        {/* Filter Chips */}
        <View className="mx-5 pt-6 pb-4">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {filters.map((filter) => (
              <Pressable
                key={filter}
                className={`px-4 py-2.5 rounded-lg mr-3 active:opacity-90 ${
                  selectedFilter === filter 
                    ? 'bg-primary' 
                    : 'bg-card border border-border'
                }`}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text
                  className={`text-sm font-semibold ${
                    selectedFilter === filter 
                      ? 'text-primary-foreground' 
                      : 'text-foreground'
                  }`}
                >
                  {filter}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Opportunities List */}
        <View className="mx-5">
          {loading ? (
            <View className="items-center py-12">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text className="text-muted-foreground mt-4">Loading opportunities...</Text>
            </View>
          ) : opportunities.length === 0 ? (
            <View className="items-center py-12 bg-card rounded-2xl border border-border border-dashed">
              <Feather name="briefcase" size={48} color={colors.iconGray} />
              <Text className="text-muted-foreground text-base mt-4 text-center font-medium">
                {searchQuery ? 'No opportunities found' : `No ${selectedFilter === 'All' ? '' : selectedFilter.toLowerCase()} opportunities available`}
              </Text>
              <Text className="text-muted-foreground text-sm mt-2 text-center">
                {searchQuery ? 'Try a different search term' : 'Check back soon for new opportunities'}
              </Text>
            </View>
          ) : (
            opportunities.map((item) => renderOpportunity(item))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

export default withAuthGuard(OpportunitiesScreen);
