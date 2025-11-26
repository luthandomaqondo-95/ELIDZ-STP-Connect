import React from 'react';
import { View, Pressable, Linking } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenScrollView } from '@/components/ScreenScrollView';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, Typography, Shadow } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import { withAuthGuard } from '@/components/withAuthGuard';

function EventDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Event data based on the events from events.tsx
  const eventData: Record<string, any> = {
    '1': {
      id: '1',
      title: 'Eastern Cape Innovation & Entrepreneurship Week (IEW) 2025',
      date: 'Nov 24, 2025',
      time: 'Full Day',
      location: 'East London IDZ Science & Technology Park (Hybrid)',
      rsvp: null,
      attendees: null,
      endDate: 'Nov 28, 2025',
      theme: 'Innovate. Commercialise. Thrive.',
      description: `The Eastern Cape Innovation & Entrepreneurship Week (IEW) 2025 is a flagship event organized by the East London Industrial Development Zone (ELIDZ) in partnership with key stakeholders across the Eastern Cape. This five-day event brings together innovators, entrepreneurs, investors, policymakers, and industry leaders to explore the latest trends in innovation, technology transfer, and entrepreneurship.

The IEW 2025 will feature:

• Innovation Showcase & Exhibition
• Entrepreneurship Development Workshops
• Investor-Entrepreneur Matching Sessions
• Technology Transfer Seminars
• Networking Opportunities
• Startup Pitch Competitions
• Policy Dialogue Sessions

The event aligns with ELIDZ's Vision 2030 strategy and aims to position the Eastern Cape as a leading hub for innovation and industrial growth in South Africa.`,
      agenda: [
        {
          day: 'Day 1 - Monday, November 24',
          title: 'Opening Ceremony & Innovation Showcase',
          time: '09:00 - 17:00',
          description: 'Welcome addresses, innovation exhibition opening, and keynote presentations.'
        },
        {
          day: 'Day 2 - Tuesday, November 25',
          title: 'Technology Transfer & Commercialization',
          time: '09:00 - 17:00',
          description: 'Workshops on technology transfer, IP management, and commercialization strategies.'
        },
        {
          day: 'Day 3 - Wednesday, November 26',
          title: 'Entrepreneurship Development',
          time: '09:00 - 17:00',
          description: 'Startup incubation programs, mentorship sessions, and business development workshops.'
        },
        {
          day: 'Day 4 - Thursday, November 27',
          title: 'Investment & Funding',
          time: '09:00 - 17:00',
          description: 'Investor presentations, pitch competitions, and funding opportunity discussions.'
        },
        {
          day: 'Day 5 - Friday, November 28',
          title: 'Closing Ceremony & Awards',
          time: '09:00 - 15:00',
          description: 'Event wrap-up, award presentations, and future collaboration announcements.'
        }
      ],
      speakers: [
        'ELIDZ CEO and Senior Management',
        'Eastern Cape Premier and Government Officials',
        'Industry Leaders and Investors',
        'Academic and Research Experts',
        'Successful Entrepreneurs and Innovators'
      ],
      contact: {
        email: 'iew2025@elidz.co.za',
        phone: '+27 (0)43 711 9000',
        website: 'https://www.elidz.co.za'
      }
    }
  };

  const event = eventData[id] || eventData['1'];

  return (
    <ScreenScrollView>
      {/* Header Section */}
      <View style={{
        padding: Spacing.xl,
        borderRadius: BorderRadius.card,
        marginBottom: Spacing.lg,
        backgroundColor: colors.primary,
      }}>
        <View style={{
          alignSelf: 'flex-start',
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.xs,
          borderRadius: BorderRadius.button,
          backgroundColor: colors.buttonText,
          marginBottom: Spacing.md,
        }}>
          <Text style={[Typography.small, { color: colors.primary }]}>
            Event
          </Text>
        </View>

        <View style={{
          marginTop: Spacing.lg,
          alignItems: 'center',
        }}>
          <Feather name="calendar" size={48} color={colors.buttonText} />
        </View>

        <Text style={[Typography.h2, { color: colors.buttonText, marginTop: Spacing.lg, textAlign: 'center' }]}>
          {event.title}
        </Text>

        {event.theme && (
          <View style={{
            marginTop: Spacing.md,
            alignItems: 'center',
          }}>
            <Text style={[Typography.body, { color: colors.buttonText, fontStyle: 'italic', textAlign: 'center' }]}>
              &ldquo;{event.theme}&rdquo;
            </Text>
          </View>
        )}
      </View>

      {/* Event Details Card */}
      <View style={{
        padding: Spacing.lg,
        borderRadius: BorderRadius.card,
        marginBottom: Spacing.lg,
        backgroundColor: colors.backgroundDefault,
        ...Shadow.card,
      }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: Spacing.sm,
          }}>
            <Feather name="calendar" size={16} color={colors.textSecondary} />
            <Text style={[Typography.caption, { color: colors.textSecondary, marginLeft: Spacing.xs }]}>
              {event.date}
            </Text>
          </View>

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: Spacing.sm,
          }}>
            <Feather name="clock" size={16} color={colors.textSecondary} />
            <Text style={[Typography.caption, { color: colors.textSecondary, marginLeft: Spacing.xs }]}>
              {event.time}
            </Text>
          </View>
        </View>

        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: Spacing.sm,
        }}>
          <Feather name="map-pin" size={16} color={colors.textSecondary} />
          <Text style={[Typography.caption, { color: colors.textSecondary, marginLeft: Spacing.xs, flex: 1 }]}>
            {event.location}
          </Text>
        </View>

        {event.endDate && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <Feather name="calendar" size={16} color={colors.accent} />
            <Text style={[Typography.caption, { color: colors.accent, marginLeft: Spacing.xs }]}>
              Ends: {event.endDate}
            </Text>
          </View>
        )}
      </View>

      {/* Description */}
      <View style={{
        padding: Spacing.lg,
        borderRadius: BorderRadius.card,
        marginBottom: Spacing.lg,
        backgroundColor: colors.backgroundDefault,
        ...Shadow.card,
      }}>
        <Text style={[Typography.h3, { color: colors.text, marginBottom: Spacing.md }]}>
          About This Event
        </Text>
        <Text style={[Typography.body, { color: colors.text, lineHeight: 24 }]}>
          {event.description}
        </Text>
      </View>

      {/* Agenda */}
      {event.agenda && (
        <View style={{
          padding: Spacing.lg,
          borderRadius: BorderRadius.card,
          marginBottom: Spacing.lg,
          backgroundColor: colors.backgroundDefault,
          ...Shadow.card,
        }}>
          <Text style={[Typography.h3, { color: colors.text, marginBottom: Spacing.md }]}>
            Event Agenda
          </Text>
          {event.agenda.map((item: any, index: number) => (
            <View
              key={index}
              style={{
                marginBottom: index < event.agenda.length - 1 ? Spacing.md : 0,
                paddingBottom: Spacing.md,
                borderBottomWidth: index < event.agenda.length - 1 ? 1 : 0,
                borderBottomColor: colors.border,
              }}
            >
              <Text style={[Typography.body, { color: colors.text, fontWeight: '600', marginBottom: Spacing.xs }]}>
                {item.day}
              </Text>
              <Text style={[Typography.body, { color: colors.primary, fontWeight: '500', marginBottom: Spacing.xs }]}>
                {item.title}
              </Text>
              <Text style={[Typography.caption, { color: colors.textSecondary, marginBottom: Spacing.xs }]}>
                {item.time}
              </Text>
              <Text style={[Typography.body, { color: colors.text, lineHeight: 20 }]}>
                {item.description}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Speakers */}
      {event.speakers && (
        <View style={{
          padding: Spacing.lg,
          borderRadius: BorderRadius.card,
          marginBottom: Spacing.lg,
          backgroundColor: colors.backgroundDefault,
          ...Shadow.card,
        }}>
          <Text style={[Typography.h3, { color: colors.text, marginBottom: Spacing.md }]}>
            Featured Speakers & Presenters
          </Text>
          {event.speakers.map((speaker: string, index: number) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: index < event.speakers.length - 1 ? Spacing.sm : 0,
              }}
            >
              <Feather name="user" size={14} color={colors.primary} />
              <Text style={[Typography.body, { color: colors.text, marginLeft: Spacing.sm }]}>
                {speaker}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Contact Information */}
      {event.contact && (
        <View style={{
          padding: Spacing.lg,
          borderRadius: BorderRadius.card,
          marginBottom: Spacing.lg,
          backgroundColor: colors.backgroundDefault,
          ...Shadow.card,
        }}>
          <Text style={[Typography.h3, { color: colors.text, marginBottom: Spacing.md }]}>
            Contact Information
          </Text>

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: Spacing.sm,
          }}>
            <Feather name="mail" size={16} color={colors.primary} />
            <Pressable onPress={() => Linking.openURL(`mailto:${event.contact.email}`)}>
              <Text style={[Typography.body, { color: colors.primary, marginLeft: Spacing.sm, textDecorationLine: 'underline' }]}>
                {event.contact.email}
              </Text>
            </Pressable>
          </View>

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: Spacing.sm,
          }}>
            <Feather name="phone" size={16} color={colors.primary} />
            <Pressable onPress={() => Linking.openURL(`tel:${event.contact.phone}`)}>
              <Text style={[Typography.body, { color: colors.primary, marginLeft: Spacing.sm, textDecorationLine: 'underline' }]}>
                {event.contact.phone}
              </Text>
            </Pressable>
          </View>

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <Feather name="globe" size={16} color={colors.primary} />
            <Pressable onPress={() => Linking.openURL(event.contact.website)}>
              <Text style={[Typography.body, { color: colors.primary, marginLeft: Spacing.sm, textDecorationLine: 'underline' }]}>
                Visit Website
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* RSVP Section */}
      <View style={{
        padding: Spacing.lg,
        borderRadius: BorderRadius.card,
        marginBottom: Spacing.xl,
        backgroundColor: colors.secondary,
        ...Shadow.card,
      }}>
        <View style={{
          alignItems: 'center',
        }}>
          <Feather name="user-plus" size={32} color={colors.buttonText} />
          <Text style={[Typography.h3, { color: colors.buttonText, marginTop: Spacing.md, marginBottom: Spacing.sm }]}>
            Interested in Attending?
          </Text>
          <Text style={[Typography.body, { color: colors.buttonText, textAlign: 'center', marginBottom: Spacing.lg }]}>
            Register your interest or RSVP for this event to stay updated with the latest information.
          </Text>
          <Pressable
            style={{
              backgroundColor: colors.buttonText,
              paddingHorizontal: Spacing.xl,
              paddingVertical: Spacing.md,
              borderRadius: BorderRadius.button,
              alignItems: 'center',
            }}
            onPress={() => Linking.openURL(`mailto:${event.contact.email}?subject=RSVP for ${event.title}`)}
          >
            <Text style={[Typography.body, { color: colors.secondary, fontWeight: '600' }]}>
              RSVP Now
            </Text>
          </Pressable>
        </View>
      </View>
    </ScreenScrollView>
  );
}

export default withAuthGuard(EventDetailScreen);