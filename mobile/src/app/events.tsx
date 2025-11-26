import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { ScreenScrollView } from '@/components/ScreenScrollView';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function EventsScreen() {
  // Verified events from ELIDZ website (searched using Playwright MCP)
  const events = [
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

  function getMonthEvents(monthName: string, monthEvents: typeof events) {
    return (
      <View className="mb-6">
        <Text className="text-xl font-semibold mb-4 text-foreground">{monthName}</Text>
        {monthEvents.map((event) => (
          <Pressable
            key={event.id}
            className="flex-row p-4 rounded-xl mb-3 bg-card active:opacity-90 shadow-sm"
            onPress={() => router.push(`/event-detail?id=${event.id}`)}
          >
            <View className="w-14 h-16 rounded-lg bg-primary justify-center items-center">
              <Text className="text-white text-xs">
                {event.date.split(',')[0].split(' ')[1]}
              </Text>
              <Text className="text-white text-xl font-bold">
                {event.date.split(' ')[1].replace(',', '')}
              </Text>
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-base font-semibold text-foreground">{event.title}</Text>
              {(event as any).endDate && (
                <Text className="text-primary mt-1 font-semibold text-sm">
                  {(event as any).endDate ? `${event.date.split(',')[0]} - ${(event as any).endDate.split(',')[0]}` : event.date}
                </Text>
              )}
              {!(event as any).endDate && (
                <Text className="text-primary mt-1 font-semibold text-sm">
                  {event.date}
                </Text>
              )}
              <View className="flex-row items-center mt-2">
                <Feather name="clock" size={14} color="rgb(var(--muted-foreground))" />
                <Text className="text-muted-foreground text-sm ml-1">
                  {event.time}
                </Text>
              </View>
              <View className="flex-row items-center mt-1">
                <Feather name="map-pin" size={14} color="rgb(var(--muted-foreground))" />
                <Text className="text-muted-foreground text-sm ml-1 flex-1">
                  {event.location}
                </Text>
              </View>
              {(event as any).theme && (
                <View className="flex-row items-center mt-1">
                  <Feather name="tag" size={14} color="rgb(var(--accent))" />
                  <Text className="text-accent text-sm ml-1 italic">
                    {(event as any).theme}
                  </Text>
                </View>
              )}
              {event.attendees && (
              <View className="flex-row items-center mt-2">
                <Feather name="users" size={14} color="rgb(var(--primary))" />
                <Text className="text-muted-foreground text-xs ml-1">
                  {event.attendees} attending
                </Text>
                {event.rsvp ? (
                  <View className="px-3 py-1 rounded-lg bg-green-500 ml-3">
                    <Text className="text-white text-xs">{event.rsvp}</Text>
                  </View>
                ) : null}
              </View>
              )}
            </View>
          </Pressable>
        ))}
      </View>
    );
  }

  const novemberEvents = events.filter(e => e.date.includes('Nov'));

  return (
    <ScreenScrollView>
      <Text className="text-muted-foreground text-base mb-6">
        Discover upcoming events, workshops, and networking opportunities at the East London IDZ
      </Text>

      {novemberEvents.length > 0 && getMonthEvents('November 2025', novemberEvents)}
    </ScreenScrollView>
  );
}

