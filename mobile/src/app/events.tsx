import React from 'react';
import { View, Pressable, ScrollView, TextInput } from 'react-native';
import { Text } from '@/components/ui/text';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { HeaderAvatar } from '@/components/HeaderAvatar';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  rsvp?: string | null;
  attendees?: number | null;
  endDate?: string;
  theme?: string;
}

export default function EventsScreen() {
  // Verified events from ELIDZ website
  const events: Event[] = [
    {
      id: '1',
      title: 'Eastern Cape Innovation & Entrepreneurship Week (IEW) 2025',
      date: 'Nov 24, 2025',
      time: 'Full Day',
      location: 'East London IDZ Science & Technology Park (Hybrid)',
      rsvp: null,
      attendees: null,
      endDate: 'Nov 28, 2025',
      theme: 'Innovate. Commercialise. Thrive.'
    },
  ];

  const parseDate = (dateStr: string): { month: string; day: string } => {
    // Format: "Nov 24, 2025"
    const parts = dateStr.split(' ');
    return {
      month: parts[0], // "Nov"
      day: parts[1]?.replace(',', '') || '', // "24"
    };
  };

  function getMonthEvents(monthName: string, monthEvents: Event[]) {
    return (
      <View className="mb-6">
        <Text className="text-xl font-semibold mb-4 text-foreground">{monthName}</Text>
        {monthEvents.map((event) => {
          const dateInfo = parseDate(event.date);
          return (
            <Pressable
              key={event.id}
              className="bg-card rounded-2xl p-4 mb-4 border border-border shadow-sm active:opacity-95"
              onPress={() => router.push(`/event-detail?id=${event.id}`)}
            >
              <View className="flex-row items-start">
                <View className="w-16 h-20 rounded-xl bg-[#002147] justify-center items-center mr-4">
                  <Text className="text-white text-xs font-semibold uppercase">
                    {dateInfo.month}
                  </Text>
                  <Text className="text-white text-2xl font-bold">
                    {dateInfo.day}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-foreground text-base font-bold mb-2" numberOfLines={2}>
                    {event.title}
                  </Text>
                  {event.endDate ? (
                    <Text className="text-accent font-semibold text-sm mb-2">
                      {event.date} - {event.endDate}
                    </Text>
                  ) : (
                    <Text className="text-accent font-semibold text-sm mb-2">
                      {event.date}
                    </Text>
                  )}
                  <View className="flex-row items-center mt-2">
                    <Feather name="clock" size={14} color="#6C757D" />
                    <Text className="text-muted-foreground text-sm ml-2">
                      {event.time}
                    </Text>
                  </View>
                  <View className="flex-row items-center mt-2">
                    <Feather name="map-pin" size={14} color="#6C757D" />
                    <Text className="text-muted-foreground text-sm ml-2 flex-1" numberOfLines={1}>
                      {event.location}
                    </Text>
                  </View>
                  {event.theme && (
                    <View className="flex-row items-center mt-2">
                      <Feather name="tag" size={14} color="#FF6600" />
                      <Text className="text-accent text-sm ml-2 italic">
                        {event.theme}
                      </Text>
                    </View>
                  )}
                  {event.attendees && (
                    <View className="flex-row items-center mt-2">
                      <Feather name="users" size={14} color="#002147" />
                      <Text className="text-muted-foreground text-xs ml-2">
                        {event.attendees} attending
                      </Text>
                      {event.rsvp && (
                        <View className="px-3 py-1 rounded-lg bg-green-500 ml-3">
                          <Text className="text-white text-xs">{event.rsvp}</Text>
                        </View>
                      )}
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

  const novemberEvents = events.filter(e => e.date.includes('Nov'));

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <LinearGradient
          colors={['#002147', '#003366']}
          className="pt-12 pb-6 px-6 rounded-b-[30px] shadow-lg"
        >
          <View className="flex-row justify-between items-center mb-2">
            <View className="flex-1">
              <Text className="text-white text-3xl font-bold mb-2">Events</Text>
              <Text className="text-white/80 text-base">
                Discover upcoming events, workshops, and networking opportunities
              </Text>
            </View>
            <HeaderAvatar />
          </View>

          {/* Search Bar */}
          <View className="flex-row items-center bg-white/10 border border-white/20 h-12 rounded-xl px-4 mt-6 backdrop-blur-sm">
            <Feather name="search" size={20} color="rgba(255,255,255,0.7)" />
            <TextInput
              className="flex-1 ml-3 text-base text-white"
              placeholder="Search events..."
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          </View>
        </LinearGradient>

        {/* Events List */}
        <View className="px-6 mt-6">
          {novemberEvents.length > 0 ? (
            getMonthEvents('November 2025', novemberEvents)
          ) : (
            <View className="items-center py-12 bg-card rounded-2xl border border-border border-dashed">
              <Feather name="calendar" size={48} color="#CBD5E0" />
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

