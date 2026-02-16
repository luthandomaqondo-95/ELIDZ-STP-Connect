import React, { useEffect, useState } from 'react';
import { View, Pressable, ScrollView, TextInput, Dimensions, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { HeaderAvatar } from '@/components/HeaderAvatar';
import { HeaderNotificationIcon } from '@/components/HeaderNotificationIcon';
import { EventService, Event } from '@/services/event.service';
import { useTheme } from '@/hooks/useTheme';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

function formatEventDate(isoDate: string): { display: string; monthDay: string; month: string; day: string } {
  const d = new Date(isoDate);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const day = String(d.getDate());
  const year = d.getFullYear();
  const display = `${month} ${day}, ${year}`;
  return { display, monthDay: `${month} ${day}`, month, day };
}

function getMonthName(isoDate: string): string {
  const d = new Date(isoDate);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

function groupEventsByMonth(events: Event[]): { monthLabel: string; events: Event[] }[] {
  const byMonth = new Map<string, Event[]>();
  for (const e of events) {
    const label = getMonthName(e.date);
    if (!byMonth.has(label)) byMonth.set(label, []);
    byMonth.get(label)!.push(e);
  }
  const sorted = Array.from(byMonth.entries()).sort((a, b) => {
    const dA = new Date(a[1][0].date).getTime();
    const dB = new Date(b[1][0].date).getTime();
    return dA - dB;
  });
  return sorted.map(([monthLabel, events]) => ({ monthLabel, events }));
}

export default function EventsScreen() {
  const { colors } = useTheme();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const all = await EventService.getUpcomingEvents(100);
        if (!cancelled) setEvents(all);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load events');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = searchQuery.trim()
    ? events.filter(e => e.title?.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : events;
  const grouped = groupEventsByMonth(filtered);

  function renderMonthSection(monthLabel: string, monthEvents: Event[]) {
    return (
      <View key={monthLabel} className="mb-6">
        <Text className="text-xl font-semibold mb-4 text-foreground">{monthLabel}</Text>
        {monthEvents.map((event) => {
          const { month, day, display } = formatEventDate(event.date);
          return (
            <Pressable
              key={event.id}
              className="bg-card rounded-2xl p-4 mb-4 border border-border shadow-sm active:opacity-95"
              onPress={() => router.push(`/event-detail?id=${event.id}`)}
            >
              <View className="flex-row items-start">
                <View className="w-16 h-20 rounded-xl justify-center items-center mr-4 bg-primary">
                  <Text className="text-white text-xs font-semibold uppercase">{month}</Text>
                  <Text className="text-white text-2xl font-bold">{day}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-foreground text-base font-bold mb-2" numberOfLines={2}>
                    {event.title}
                  </Text>
                  <Text className="text-accent font-semibold text-sm mb-2">{display}</Text>
                  {event.location && (
                    <View className="flex-row items-center mt-2">
                      <Feather name="map-pin" size={14} color={colors.textSecondary ?? '#6B7280'} />
                      <Text className="text-muted-foreground text-sm ml-2 flex-1" numberOfLines={1}>
                        {event.location}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className={`pt-12 pb-6 px-6 ${isTablet ? 'max-w-[1200px] self-center w-full' : ''}`}>
          <View className="flex-row items-center justify-end mb-2">
            <HeaderNotificationIcon />
            <HeaderAvatar />
          </View>
          <View className="items-start mb-2">
            <Text className="text-foreground font-semibold text-xl">Events</Text>
            <Text className="text-muted-foreground text-sm">
              Discover upcoming events, workshops, and networking opportunities
            </Text>
          </View>

          <View className="flex-row items-center bg-muted/50 border border-border h-12 rounded-xl px-4 mt-6">
            <Feather name="search" size={20} color={colors.textSecondary ?? '#9CA3AF'} />
            <TextInput
              className="flex-1 ml-3 text-base text-foreground"
              placeholder="Search events..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View className="px-6 mt-6">
          {loading ? (
            <View className="py-12 items-center">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text className="text-muted-foreground mt-4">Loading events...</Text>
            </View>
          ) : error ? (
            <View className="items-center py-12 bg-card rounded-2xl border border-border border-dashed">
              <Feather name="alert-circle" size={48} color={colors.error ?? '#EF4444'} />
              <Text className="text-foreground text-base mt-4 text-center font-medium">{error}</Text>
            </View>
          ) : grouped.length > 0 ? (
            grouped.map(({ monthLabel, events: monthEvents }) => renderMonthSection(monthLabel, monthEvents))
          ) : (
            <View className="items-center py-12 bg-card rounded-2xl border border-border border-dashed">
              <Feather name="calendar" size={48} color={colors.textSecondary ?? '#9CA3AF'} />
              <Text className="text-muted-foreground text-base mt-4 text-center font-medium">
                No upcoming events scheduled
              </Text>
              <Text className="text-muted-foreground text-sm mt-2 text-center">
                Check back soon for new events and workshops
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
