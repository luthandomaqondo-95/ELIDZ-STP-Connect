import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Feather } from '@expo/vector-icons';
import { TabsLayoutHeader } from '@/components/Header';
import { useColorScheme } from '@/hooks/use-theme-color';
import { COLORS } from '@/theme/colors';
import { enquiryService, Enquiry } from '@/services/enquiry.service';

function formatDateTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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

export default function EnquiryDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { colorScheme } = useColorScheme();
  const colors = COLORS[colorScheme];

  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [loading, setLoading] = useState(true);

  const loadEnquiry = useCallback(async () => {
    if (!id) {
      Alert.alert('Error', 'No enquiry ID provided.');
      router.back();
      return;
    }

    try {
      setLoading(true);
      const data = await enquiryService.getEnquiryById(id);
      if (!data) {
        Alert.alert('Not found', 'We could not find this enquiry.');
        router.back();
        return;
      }
      setEnquiry(data);
    } catch (error) {
      console.error('Error loading enquiry:', error);
      Alert.alert('Error', 'Failed to load this enquiry. Please try again.');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadEnquiry();
  }, [loadEnquiry]);

  if (loading) {
    return (
      <View className="flex-1 bg-background">
        <View className="bg-background">
          <TabsLayoutHeader title="Enquiry Detail" variant="navy" showBackButton />
        </View>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={colors.accent} />
          <Text className="text-muted-foreground mt-3">Loading enquiry...</Text>
        </View>
      </View>
    );
  }

  if (!enquiry) {
    return null;
  }

  const statusConfig = getStatusConfig(enquiry.status);

  return (
    <View className="flex-1 bg-background">
      <View className="bg-background">
        <TabsLayoutHeader title="Enquiry Detail" variant="navy" showBackButton>
          <Text className="text-white/80 text-base" numberOfLines={2}>
            Full conversation and status for this enquiry.
          </Text>
        </TabsLayoutHeader>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header card */}
        <View className="bg-card rounded-2xl p-5 border border-border shadow-sm mb-4">
          <View className="flex-row items-start justify-between mb-3">
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text className="text-lg font-bold text-foreground mb-1">
                {enquiry.subject}
              </Text>
              <Text className="text-xs text-muted-foreground">
                {enquiry.enquiry_type} • {formatDateTime(enquiry.created_at)}
              </Text>
            </View>
            <View
              className="px-3 py-1 rounded-full"
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

          {(enquiry.related_facility_id ||
            enquiry.related_tenant_id ||
            enquiry.related_opportunity_id) && (
            <View className="mt-2">
              <Text className="text-xs font-semibold text-foreground mb-1">
                Linked to
              </Text>
              <View className="flex-row flex-wrap">
                {enquiry.related_facility_id && (
                  <View className="px-2 py-1 mr-2 mb-2 rounded-full bg-primary/10">
                    <Text className="text-[11px] text-primary font-semibold">
                      Facility
                    </Text>
                  </View>
                )}
                {enquiry.related_tenant_id && (
                  <View className="px-2 py-1 mr-2 mb-2 rounded-full bg-primary/10">
                    <Text className="text-[11px] text-primary font-semibold">
                      Tenant
                    </Text>
                  </View>
                )}
                {enquiry.related_opportunity_id && (
                  <View className="px-2 py-1 mr-2 mb-2 rounded-full bg-primary/10">
                    <Text className="text-[11px] text-primary font-semibold">
                      Opportunity
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Message / conversation */}
        <View className="bg-card rounded-2xl p-5 border border-border shadow-sm">
          <Text className="text-xs font-semibold text-foreground mb-2">
            Your message
          </Text>
          <View className="bg-background rounded-xl px-3 py-3 border border-border mb-4">
            <Text className="text-sm text-foreground leading-relaxed">
              {enquiry.message}
            </Text>
          </View>

          <View className="border-t border-border pt-4 mt-1">
            <View className="flex-row items-center mb-2">
              <Feather name="mail" size={16} color={colors.accent} />
              <Text className="text-xs font-semibold text-foreground ml-2">
                Response from ELIDZ-STP
              </Text>
            </View>

            {enquiry.response ? (
              <>
                <View className="bg-accent/5 rounded-xl px-3 py-3 border border-accent/20">
                  <Text className="text-sm text-foreground leading-relaxed">
                    {enquiry.response}
                  </Text>
                </View>
                {enquiry.responded_at && (
                  <Text className="text-[11px] text-muted-foreground mt-2">
                    Responded {formatDateTime(enquiry.responded_at)}
                  </Text>
                )}
              </>
            ) : (
              <Text className="text-sm text-muted-foreground leading-relaxed">
                Our team is reviewing your enquiry. You&apos;ll receive a notification as soon as we respond or update the status.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

