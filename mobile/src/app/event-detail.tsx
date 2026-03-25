import React, { useEffect, useState } from 'react';
import { View, Pressable, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenScrollView } from '@/components/ScreenScrollView';
import { useTheme } from '@/hooks/useTheme';
import { Feather } from '@expo/vector-icons';
import { withAuthGuard } from '@/components/withAuthGuard';
import { EventService, Event } from '@/services/event.service';
import { TabsLayoutHeader } from '@/components/Header';

function EventDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRsvped, setIsRsvped] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpError, setRsvpError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEvent() {
      if (!id) {
        setError('Event ID is required');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await EventService.getEventById(id);
        setEvent(data ?? null);
        if (!data) setError('Event not found');
        if (data) {
          const hasRsvp = await EventService.hasUserRsvped(data.id);
          setIsRsvped(hasRsvp);
        }
      } catch (err: any) {
        console.error('Error loading event:', err);
        setError(err.message || 'Failed to load event');
        setEvent(null);
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [id]);

  if (loading) {
    return (
      <ScreenScrollView insetTop={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="bg-background">
          <TabsLayoutHeader title="Events" variant="navy" showBackButton>
            <Text className="text-white/80 text-base">
              Event details.
            </Text>
          </TabsLayoutHeader>
        </View>
        <View className="p-5 items-center justify-center min-h-[300px]">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-base text-muted-foreground mt-3">Loading event...</Text>
        </View>
      </ScreenScrollView>
    );
  }

  if (error || !event) {
    return (
      <ScreenScrollView insetTop={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="bg-background">
          <TabsLayoutHeader title="Events" variant="navy" showBackButton>
            <Text className="text-white/80 text-base">
              Event details.
            </Text>
          </TabsLayoutHeader>
        </View>
        <View className="p-5 items-center justify-center min-h-[300px]">
          <Feather name="calendar" size={48} color={colors.textSecondary} />
          <Text className="text-lg font-bold mt-3 text-center text-foreground">
            {error || 'Event not found'}
          </Text>
          <Text className="text-base text-muted-foreground mt-2 text-center">
            Please try again later
          </Text>
        </View>
      </ScreenScrollView>
    );
  }

  const formattedDate = event.date
    ? new Date(event.date).toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  async function handleRsvpPress() {
    if (!event) return;

    try {
      setRsvpLoading(true);
      setRsvpError(null);
      if (isRsvped) {
        await EventService.cancelRsvp(event.id);
        setIsRsvped(false);
      } else {
        await EventService.rsvpToEvent(event.id);
        setIsRsvped(true);
      }
    } catch (err: any) {
      console.error('RSVP update error:', err);
      setRsvpError(err?.message || 'Failed to update RSVP.');
    } finally {
      setRsvpLoading(false);
    }
  }

  return (
    <ScreenScrollView insetTop={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="bg-background">
        <TabsLayoutHeader title="Events" variant="navy" showBackButton>
          <Text className="text-white/80 text-base">
            Event details.
          </Text>
        </TabsLayoutHeader>
      </View>

      <View className="mt-6 px-5">
        <View className="p-5 rounded-xl mb-3 bg-primary">
          <View className="self-start px-2.5 py-1 rounded-lg bg-primary-foreground mb-2.5">
            <Text className="text-xs text-primary">Event</Text>
          </View>
          <View className="mt-3 items-center">
            {event.image_url ? (
              <Image
                source={{ uri: event.image_url }}
                className="w-full aspect-video rounded-lg bg-white/10"
                resizeMode="cover"
              />
            ) : (
              <Feather name="calendar" size={48} color={colors.buttonText} />
            )}
          </View>
          <Text className="text-xl font-bold text-primary-foreground mt-3 text-center">
            {event.title}
          </Text>
        </View>

        <View className="p-3 rounded-xl mb-3 bg-card shadow-sm">
          <View className="flex-row justify-between flex-wrap gap-2">
            <View className="flex-row items-center">
              <Feather name="calendar" size={16} color={colors.textSecondary} />
              <Text className="text-sm text-muted-foreground ml-1">{formattedDate}</Text>
            </View>
          </View>
          {event.location && (
            <View className="flex-row items-center mt-2">
              <Feather name="map-pin" size={16} color={colors.textSecondary} />
              <Text className="text-sm text-muted-foreground ml-1 flex-1">{event.location}</Text>
            </View>
          )}
        </View>

        {event.description && (
          <View className="p-3 rounded-xl mb-3 bg-card shadow-sm">
            <Text className="text-lg font-bold text-foreground mb-2.5">About This Event</Text>
            <Text className="text-base text-foreground leading-6">{event.description}</Text>
          </View>
        )}

        <View className="p-3 rounded-xl mb-5 bg-secondary shadow-sm">
          <View className="items-center">
            <Feather name="user-plus" size={32} color={colors.buttonText} />
            <Text className="text-lg font-bold text-secondary-foreground mt-2.5 mb-2">
              {isRsvped ? 'You are attending this event' : 'RSVP for this event'}
            </Text>
            <Pressable
              className="bg-primary-foreground px-5 py-2.5 rounded-lg items-center active:opacity-80 min-w-[170px]"
              onPress={handleRsvpPress}
              disabled={rsvpLoading}
            >
              {rsvpLoading ? (
                <ActivityIndicator color={colors.secondary} />
              ) : (
                <Text className="text-base font-semibold text-secondary">
                  {isRsvped ? 'Cancel RSVP' : 'RSVP Now'}
                </Text>
              )}
            </Pressable>
            {rsvpError ? (
              <Text className="mt-2 text-center text-sm text-red-200">{rsvpError}</Text>
            ) : null}
          </View>
        </View>
      </View>
    </ScreenScrollView>
  );
}

export default withAuthGuard(EventDetailScreen);
