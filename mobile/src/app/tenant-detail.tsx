import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Linking, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { useTheme } from '../hooks/useTheme';
import { Spacing, BorderRadius, Typography, Shadow } from '../constants/theme';
import { Feather } from '@expo/vector-icons';
import { withAuthGuard } from '@/components/withAuthGuard';
import { LinearGradient } from 'expo-linear-gradient';
import { TenantLogo } from '@/components/TenantLogo';
import { tenantService } from '@/services/tenant.service';
import { Tenant } from '@/types';

function TenantDetailScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ tenant?: string, name?: string, id?: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTenant() {
      if (params.id) {
        try {
          setLoading(true);
          const tenantData = await tenantService.getTenantById(params.id);
          if (tenantData) {
            setTenant(tenantData);
          }
        } catch (error) {
          console.error('Error loading tenant:', error);
        } finally {
          setLoading(false);
        }
      } else if (params.tenant) {
        try {
          const parsedTenant = JSON.parse(params.tenant as string);
          setTenant(parsedTenant as Tenant);
        } catch (e) {
          console.error('Error parsing tenant params:', e);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }

    loadTenant();
  }, [params.id, params.tenant]);

  const name = tenant?.name || params.name || 'Tenant';
  const industry = tenant?.industry || 'Technology';
  const location = tenant?.location || 'Digital Hub';
  const description = tenant?.description || `${name} is a leading organization in the ${industry} sector, dedicated to innovation and excellence.`;
  const logoUrl = tenant?.logo_url;

  const handleOpenLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', `Cannot open URL: ${url}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open link');
    }
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handlePhone = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const parseSocialLinks = (links: string | undefined) => {
    if (!links) return [];
    return links.split('|').map(link => {
      const parts = link.trim().split(':');
      if (parts.length === 2) {
        return { platform: parts[0].trim(), url: parts[1].trim() };
      }
      return null;
    }).filter(Boolean) as Array<{ platform: string; url: string }>;
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient
        colors={['#002147', '#003366']}
        className="pt-12 pb-6 px-4 rounded-b-[30px] shadow-lg z-10"
      >
        <View className="flex-row items-center">
          <Pressable 
            onPress={() => router.back()}
            className="p-2 bg-white/10 rounded-full mr-4"
          >
            <Feather name="arrow-left" size={24} color="white" />
          </Pressable>
          <Text className="text-white text-xl font-bold flex-1" numberOfLines={1}>
            {name}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.logoContainer, { backgroundColor: 'transparent' }]}>
          <TenantLogo name={name} logoUrl={logoUrl} size={40} className="w-full h-full" />
        </View>

        <View style={styles.tagsContainer}>
          <View style={[styles.tag, { backgroundColor: colors.primary }]}>
            <Text style={[Typography.small, { color: '#FFFFFF' }]}>{industry}</Text>
          </View>
          <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
            <Text style={[Typography.small, { color: '#FFFFFF' }]}>{location}</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.backgroundDefault, ...Shadow.card }]}>
          <Text style={[Typography.h3, { marginBottom: Spacing.md }]}>About</Text>
          <Text style={[Typography.body, { color: colors.text }]}>
            {description}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.backgroundDefault, ...Shadow.card }]}>
          <Text style={[Typography.h3, { marginBottom: Spacing.md }]}>Industry</Text>
          <View style={styles.infoRow}>
            <Feather name="briefcase" size={18} color={colors.primary} />
            <Text style={[Typography.body, { marginLeft: Spacing.md }]}>
              {industry}
            </Text>
          </View>
        </View>

        {/* Address */}
        {tenant?.address && (
          <View style={[styles.card, { backgroundColor: colors.backgroundDefault, ...Shadow.card }]}>
            <Text style={[Typography.h3, { marginBottom: Spacing.md }]}>Address</Text>
            <View style={styles.infoRow}>
              <Feather name="map-pin" size={18} color={colors.primary} />
              <Text style={[Typography.body, { marginLeft: Spacing.md, flex: 1 }]}>
                {tenant.address}
              </Text>
            </View>
          </View>
        )}

        {/* Location */}
        <View style={[styles.card, { backgroundColor: colors.backgroundDefault, ...Shadow.card }]}>
          <Text style={[Typography.h3, { marginBottom: Spacing.md }]}>Location</Text>
          <View style={styles.infoRow}>
            <Feather name="map-pin" size={18} color={colors.primary} />
            <Text style={[Typography.body, { marginLeft: Spacing.md }]}>
              {location}, ELIDZ-STP
            </Text>
          </View>
        </View>

        {/* Services */}
        {tenant?.services && (
          <View style={[styles.card, { backgroundColor: colors.backgroundDefault, ...Shadow.card }]}>
            <View style={styles.sectionHeader}>
              <Feather name="briefcase" size={20} color={colors.primary} />
              <Text style={[Typography.h3, { marginLeft: Spacing.sm }]}>Services</Text>
            </View>
            <Text style={[Typography.body, { color: colors.text, marginTop: Spacing.md, lineHeight: 22 }]}>
              {tenant.services}
            </Text>
          </View>
        )}

        {/* Capabilities */}
        {tenant?.capabilities && (
          <View style={[styles.card, { backgroundColor: colors.backgroundDefault, ...Shadow.card }]}>
            <View style={styles.sectionHeader}>
              <Feather name="zap" size={20} color={colors.primary} />
              <Text style={[Typography.h3, { marginLeft: Spacing.sm }]}>Capabilities</Text>
            </View>
            <Text style={[Typography.body, { color: colors.text, marginTop: Spacing.md, lineHeight: 22 }]}>
              {tenant.capabilities}
            </Text>
          </View>
        )}

        {/* Key Personnel */}
        {tenant?.key_personnel && (
          <View style={[styles.card, { backgroundColor: colors.backgroundDefault, ...Shadow.card }]}>
            <View style={styles.sectionHeader}>
              <Feather name="users" size={20} color={colors.primary} />
              <Text style={[Typography.h3, { marginLeft: Spacing.sm }]}>Key Personnel</Text>
            </View>
            <Text style={[Typography.body, { color: colors.text, marginTop: Spacing.md, lineHeight: 22 }]}>
              {tenant.key_personnel}
            </Text>
          </View>
        )}

        {/* Partners */}
        {tenant?.partners && (
          <View style={[styles.card, { backgroundColor: colors.backgroundDefault, ...Shadow.card }]}>
            <View style={styles.sectionHeader}>
              <Feather name="handshake" size={20} color={colors.primary} />
              <Text style={[Typography.h3, { marginLeft: Spacing.sm }]}>Partners</Text>
            </View>
            <Text style={[Typography.body, { color: colors.text, marginTop: Spacing.md, lineHeight: 22 }]}>
              {tenant.partners}
            </Text>
          </View>
        )}

        {/* Opening Hours */}
        {tenant?.opening_hours && (
          <View style={[styles.card, { backgroundColor: colors.backgroundDefault, ...Shadow.card }]}>
            <View style={styles.infoRow}>
              <Feather name="clock" size={18} color={colors.primary} />
              <View style={{ marginLeft: Spacing.md, flex: 1 }}>
                <Text style={[Typography.small, { color: colors.textSecondary, marginBottom: 4 }]}>Opening Hours</Text>
                <Text style={[Typography.body, { color: colors.text }]}>
                  {tenant.opening_hours}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Contact Information */}
        <View style={[styles.card, { backgroundColor: colors.backgroundDefault, ...Shadow.card }]}>
          <Text style={[Typography.h3, { marginBottom: Spacing.md }]}>Contact Information</Text>
          
          {tenant?.contact_email && (
            <Pressable
              style={({ pressed }) => [styles.contactItem, { opacity: pressed ? 0.7 : 1 }]}
              onPress={() => handleEmail(tenant.contact_email!)}
            >
              <Feather name="mail" size={18} color={colors.primary} />
              <Text style={[Typography.body, { marginLeft: Spacing.md, flex: 1, color: colors.primary }]}>
                {tenant.contact_email}
              </Text>
              <Feather name="external-link" size={16} color={colors.primary} />
            </Pressable>
          )}

          {tenant?.additional_contact_email && (
            <Pressable
              style={({ pressed }) => [styles.contactItem, { opacity: pressed ? 0.7 : 1, marginTop: Spacing.sm }]}
              onPress={() => handleEmail(tenant.additional_contact_email!)}
            >
              <Feather name="mail" size={18} color={colors.primary} />
              <Text style={[Typography.body, { marginLeft: Spacing.md, flex: 1, color: colors.primary }]}>
                {tenant.additional_contact_email}
              </Text>
              <Feather name="external-link" size={16} color={colors.primary} />
            </Pressable>
          )}

          {tenant?.contact_phone && (
            <Pressable
              style={({ pressed }) => [styles.contactItem, { opacity: pressed ? 0.7 : 1, marginTop: Spacing.sm }]}
              onPress={() => handlePhone(tenant.contact_phone!)}
            >
              <Feather name="phone" size={18} color={colors.primary} />
              <Text style={[Typography.body, { marginLeft: Spacing.md, flex: 1, color: colors.primary }]}>
                {tenant.contact_phone}
              </Text>
              <Feather name="phone-call" size={16} color={colors.primary} />
            </Pressable>
          )}
        </View>

        {/* Website */}
        {tenant?.website && (
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => handleOpenLink(tenant.website!)}
          >
            <Feather name="globe" size={20} color="#FFFFFF" />
            <Text style={[Typography.body, { color: '#FFFFFF', marginLeft: Spacing.md, fontWeight: '600' }]}>
              Visit Website
            </Text>
          </Pressable>
        )}

        {/* Application URL */}
        {tenant?.application_url && (
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: '#FF6600', opacity: pressed ? 0.7 : 1, marginTop: Spacing.md },
            ]}
            onPress={() => handleOpenLink(tenant.application_url!)}
          >
            <Feather name="file-text" size={20} color="#FFFFFF" />
            <Text style={[Typography.body, { color: '#FFFFFF', marginLeft: Spacing.md, fontWeight: '600' }]}>
              Apply Now
            </Text>
          </Pressable>
        )}

        {/* Social Media Links */}
        {tenant?.social_media_links && parseSocialLinks(tenant.social_media_links).length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.backgroundDefault, ...Shadow.card }]}>
            <Text style={[Typography.h3, { marginBottom: Spacing.md }]}>Social Media</Text>
            {parseSocialLinks(tenant.social_media_links).map((link, index) => (
              <Pressable
                key={index}
                style={({ pressed }) => [styles.contactItem, { opacity: pressed ? 0.7 : 1, marginBottom: index < parseSocialLinks(tenant.social_media_links!).length - 1 ? Spacing.sm : 0 }]}
                onPress={() => handleOpenLink(link.url)}
              >
                <Feather name="share-2" size={18} color={colors.primary} />
                <Text style={[Typography.body, { marginLeft: Spacing.md, flex: 1, color: colors.primary }]}>
                  {link.platform}
                </Text>
                <Feather name="external-link" size={16} color={colors.primary} />
              </Pressable>
            ))}
          </View>
        )}

        {/* Contact Button (if no email/phone) */}
        {!tenant?.contact_email && !tenant?.contact_phone && (
          <Pressable
            style={({ pressed }) => [
              styles.contactButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name="mail" size={20} color="#FFFFFF" />
            <Text style={[Typography.body, { color: '#FFFFFF', marginLeft: Spacing.md, fontWeight: '600' }]}>
              Contact {name}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

export default withAuthGuard(TenantDetailScreen);

const styles = StyleSheet.create({
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.card,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.xl,
    overflow: 'hidden',
  },
  tagsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  tag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.button,
    marginHorizontal: Spacing.xs,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.card,
    marginBottom: Spacing.lg,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.button,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.button,
    marginBottom: Spacing.md,
  },
});
