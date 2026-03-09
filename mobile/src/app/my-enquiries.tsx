import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Pressable, RefreshControl, Alert, Dimensions, TextInput, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthContext } from '@/hooks/use-auth-context';
import { TabsLayoutHeader } from '@/components/Header';
import { ScreenScrollView } from '@/components/ScreenScrollView';
import { useColorScheme } from '@/hooks/use-theme-color';
import { COLORS } from '@/theme/colors';
import { enquiryService, Enquiry } from '@/services/enquiry.service';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getStatusConfig(status: Enquiry['status']) {
  switch (status) {
    case 'new':
      return { label: 'New', color: '#F38C1E' };
    case 'in_progress':
      return { label: 'In Progress', color: '#2563EB' };
    case 'resolved':
      return { label: 'Resolved', color: '#16A34A' };
    case 'closed':
    default:
      return { label: 'Closed', color: '#6B7280' };
  }
}

export default function MyEnquiriesScreen() {
  const { profile, isLoggedIn } = useAuthContext();
  const { colorScheme } = useColorScheme();
  const colors = COLORS[colorScheme];

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | Enquiry['status']>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadEnquiries = useCallback(async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      const data = await enquiryService.getUserEnquiries(profile.id);
      setEnquiries(data);
    } catch (error) {
      console.error('Error loading enquiries:', error);
      Alert.alert('Error', 'Failed to load your enquiries. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    if (profile?.id) {
      loadEnquiries();
    }
  }, [profile?.id, loadEnquiries]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEnquiries();
  };

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((enquiry) => {
      const matchesStatus =
        statusFilter === 'all' ? true : enquiry.status === statusFilter;

      const matchesSearch = searchQuery.trim().length === 0
        ? true
        : enquiry.subject.toLowerCase().includes(searchQuery.trim().toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [enquiries, statusFilter, searchQuery]);

  const renderEnquiry = (enquiry: Enquiry) => {
    const statusConfig = getStatusConfig(enquiry.status);

    return (
      <View
        key={enquiry.id}
        className="bg-card mb-3 rounded-2xl border border-border shadow-sm overflow-hidden"
      >
        <Pressable
          className="p-4 active:opacity-95"
          onPress={() => router.push({ pathname: '/enquiry-detail', params: { id: enquiry.id } })}
        >
          <View className="flex-row items-start justify-between mb-2">
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text className="text-base font-bold text-foreground mb-1" numberOfLines={2}>
                {enquiry.subject}
              </Text>
              <Text className="text-xs text-muted-foreground">
                {enquiry.enquiry_type} • {formatDate(enquiry.created_at)}
              </Text>
            </View>
            <View
              className="px-2 py-1 rounded-full"
              style={{ backgroundColor: `${statusConfig.color}20` }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: statusConfig.color }}
              >
                {statusConfig.label}
              </Text>
            </View>
          </View>

          {enquiry.response ? (
            <View className="mt-3">
              <Text className="text-xs font-semibold text-foreground mb-1">
                Latest response
              </Text>
              <Text
                className="text-sm text-muted-foreground"
                numberOfLines={3}
              >
                {enquiry.response}
              </Text>
            </View>
          ) : (
            <View className="mt-3 flex-row items-center">
              <Feather name="mail" size={14} color={colors.iconGray} />
              <Text className="text-xs text-muted-foreground ml-2">
                Awaiting a response from the ELIDZ-STP team
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    );
  };

  if (!isLoggedIn || !profile) {
    return (
      <View className="flex-1 bg-background">
        <View className="bg-background">
          <TabsLayoutHeader title="My Enquiries" variant="navy">
            <View
              style={{ maxWidth: isTablet ? 1200 : '100%', alignSelf: 'center', width: '100%' }}
            >
              <Text className="text-white/80 text-base">
                Sign in to view and track your enquiries.
              </Text>
            </View>
          </TabsLayoutHeader>
        </View>
        <View className="mx-5 p-5 rounded-2xl bg-card border border-border shadow-sm">
          <View className="flex-row items-center mb-2">
            <View className="bg-[#F38C1E]/10 p-2 rounded-full mr-3">
              <Feather name="lock" size={18} color={colors.accent} />
            </View>
            <Text className="text-foreground text-lg font-bold">
              Sign In Required
            </Text>
          </View>
          <Text className="text-muted-foreground text-sm mb-4 ml-1">
            Please sign in to access your enquiry history.
          </Text>
          <Pressable
            className="bg-[#002147] py-3 px-4 rounded-xl items-center active:opacity-90"
            onPress={() => router.push('/(auth)')}
          >
            <Text className="text-white font-bold text-sm">
              Sign In
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScreenScrollView
        insetTop={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View className="bg-background">
          <TabsLayoutHeader title="My Enquiries" variant="navy">
            <View
              style={{ maxWidth: isTablet ? 1200 : '100%', alignSelf: 'center', width: '100%' }}
            >
              <Text className="text-white/80 text-base">
                Track all the enquiries you&apos;ve submitted to ELIDZ-STP.
              </Text>
            </View>
          </TabsLayoutHeader>
        </View>

        <View
          className="mt-6"
          style={{
            paddingHorizontal: isTablet ? 24 : 20,
            maxWidth: isTablet ? 1200 : '100%',
            alignSelf: 'center',
            width: '100%',
          }}
        >
          {/* Filters + Search */}
          <View className="mb-4">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-3"
            >
              {['all', 'new', 'in_progress', 'resolved', 'closed'].map((status) => {
                const label =
                  status === 'all'
                    ? 'All'
                    : status === 'in_progress'
                      ? 'In progress'
                      : status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');

                const isActive = statusFilter === status;

                return (
                  <Pressable
                    key={status}
                    onPress={() => setStatusFilter(status as any)}
                    className={`px-3 py-1.5 rounded-full border mr-2 ${
                      isActive ? 'bg-accent border-accent' : 'bg-card border-border'
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        isActive ? 'text-white' : 'text-foreground'
                      }`}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View className="flex-row items-center bg-input rounded-xl px-3 h-11 border border-border">
              <Feather name="search" size={16} color={colors.iconGray} style={{ marginRight: 8 }} />
              <TextInput
                className="flex-1 text-sm text-foreground"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search by subject"
                placeholderTextColor={colors.placeholder}
              />
            </View>
          </View>

          {loading ? (
            <View className="items-center py-12">
              <Text className="text-muted-foreground">Loading your enquiries...</Text>
            </View>
          ) : filteredEnquiries.length === 0 ? (
            <View className="items-center py-12 bg-card rounded-2xl border border-border border-dashed">
              <Feather name="mail" size={48} color={colors.iconGray} />
              <Text className="text-muted-foreground text-base mt-4 text-center font-medium">
                No enquiries yet
              </Text>
              <Text className="text-muted-foreground text-sm mt-2 text-center">
                Submit an enquiry from centres, opportunities, or the contact sections and you&apos;ll see them here.
              </Text>
            </View>
          ) : (
            filteredEnquiries.map(renderEnquiry)
          )}
        </View>
      </ScreenScrollView>
    </View>
  );
}

