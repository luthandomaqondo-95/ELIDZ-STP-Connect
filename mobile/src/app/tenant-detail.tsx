import React, { useEffect, useState } from 'react';
import { View, Pressable, ScrollView, Linking, Alert, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { useTheme } from '../hooks/useTheme';
import { Feather } from '@expo/vector-icons';
import { withAuthGuard } from '@/components/withAuthGuard';
import { HeaderNotificationIcon } from '@/components/HeaderNotificationIcon';
import { HeaderAvatar } from '@/components/HeaderAvatar';

import { TenantLogo } from '@/components/TenantLogo';
import { tenantService } from '@/services/tenant.service';
import { Tenant } from '@/types';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

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
          const tenantId = String(params.id);
          const tenantData = await tenantService.getTenantById(tenantId);
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
    }).filter(Boolean) as { platform: string; url: string }[];
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className={`pt-12 pb-6 z-10 ${isTablet ? 'px-6' : 'px-4'}`}>
        <View className={`w-full self-center ${isTablet ? 'max-w-[1200px]' : 'max-w-full'}`}>
          <View className="flex-row items-center justify-between mb-2">
            <Pressable 
              onPress={() => router.back()}
              className="p-2 bg-muted rounded-full"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="arrow-left" size={20} color={colors.text} />
            </Pressable>
            <View className="flex-row items-center">
              <HeaderNotificationIcon />
              <HeaderAvatar />
            </View>
          </View>
          <View className="items-start">
            <Text className={`text-foreground font-semibold ${isTablet ? 'text-[22px]' : 'text-xl'}`} numberOfLines={1}>
              {name}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="p-3 pb-10">
        <View className="w-[100px] h-[100px] rounded-xl justify-center items-center self-center mb-5 overflow-hidden bg-transparent">
          <TenantLogo name={name} logoUrl={logoUrl} size={40} className="w-full h-full" />
        </View>

        <View className="flex-row justify-center mb-5">
          <View className="px-2.5 py-2 rounded-lg mx-1 bg-primary">
            <Text className="text-xs text-primary-foreground">{industry}</Text>
          </View>
          <View className="px-2.5 py-2 rounded-lg mx-1 bg-secondary">
            <Text className="text-xs text-secondary-foreground">{location}</Text>
          </View>
        </View>

        <View className="p-3 rounded-xl mb-3 bg-card shadow-sm">
          <Text className="text-lg font-bold text-foreground mb-2.5">About</Text>
          <Text className="text-base text-foreground">
            {description}
          </Text>
        </View>

        <View className="p-3 rounded-xl mb-3 bg-card shadow-sm">
          <Text className="text-lg font-bold text-foreground mb-2.5">Industry</Text>
          <View className="flex-row items-center">
            <Feather name="briefcase" size={18} color={colors.primary} />
            <Text className="text-base text-foreground ml-2.5">
              {industry}
            </Text>
          </View>
        </View>

        {/* Address */}
        {tenant?.address && (
          <View className="p-3 rounded-xl mb-3 bg-card shadow-sm">
            <Text className="text-lg font-bold text-foreground mb-2.5">Address</Text>
            <View className="flex-row items-center">
              <Feather name="map-pin" size={18} color={colors.primary} />
              <Text className="text-base ml-2.5 flex-1">
                {tenant.address}
              </Text>
            </View>
          </View>
        )}

        {/* Location */}
        <View className="p-3 rounded-xl mb-3 bg-card shadow-sm">
          <Text className="text-lg font-bold text-foreground mb-2.5">Location</Text>
          <View className="flex-row items-center">
            <Feather name="map-pin" size={18} color={colors.primary} />
            <Text className="text-base text-foreground ml-2.5">
              {location}, ELIDZ-STP
            </Text>
          </View>
        </View>

        {/* Services */}
        {tenant?.services && (
          <View className="p-3 rounded-xl mb-3 bg-card shadow-sm">
            <View className="flex-row items-center mb-2">
              <Feather name="briefcase" size={20} color={colors.primary} />
              <Text className="text-lg font-bold text-foreground ml-2">Services</Text>
            </View>
            <Text className="text-base text-foreground mt-2.5 leading-[22px]">
              {tenant.services}
            </Text>
          </View>
        )}

        {/* Capabilities */}
        {tenant?.capabilities && (
          <View className="p-3 rounded-xl mb-3 bg-card shadow-sm">
            <View className="flex-row items-center mb-2">
              <Feather name="zap" size={20} color={colors.primary} />
              <Text className="text-lg font-bold text-foreground ml-2">Capabilities</Text>
            </View>
            <Text className="text-base text-foreground mt-2.5 leading-[22px]">
              {tenant.capabilities}
            </Text>
          </View>
        )}

        {/* Key Personnel */}
        {tenant?.key_personnel && (
          <View className="p-3 rounded-xl mb-3 bg-card shadow-sm">
            <View className="flex-row items-center mb-2">
              <Feather name="users" size={20} color={colors.primary} />
              <Text className="text-lg font-bold text-foreground ml-2">Key Personnel</Text>
            </View>
            <Text className="text-base text-foreground mt-2.5 leading-[22px]">
              {tenant.key_personnel}
            </Text>
          </View>
        )}

        {/* Partners */}
        {tenant?.partners && (
          <View className="p-3 rounded-xl mb-3 bg-card shadow-sm">
            <View className="flex-row items-center mb-2">
              <Feather name="users" size={20} color={colors.primary} />
              <Text className="text-lg font-bold text-foreground ml-2">Partners</Text>
            </View>
            <Text className="text-base text-foreground mt-2.5 leading-[22px]">
              {tenant.partners}
            </Text>
          </View>
        )}

        {/* Opening Hours */}
        {tenant?.opening_hours && (
          <View className="p-3 rounded-xl mb-3 bg-card shadow-sm">
            <View className="flex-row items-center">
              <Feather name="clock" size={18} color={colors.primary} />
              <View className="ml-2.5 flex-1">
                <Text className="text-xs text-muted-foreground mb-1">Opening Hours</Text>
                <Text className="text-base text-foreground">
                  {tenant.opening_hours}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Contact Information */}
        <View className="p-3 rounded-xl mb-3 bg-card shadow-sm">
          <Text className="text-lg font-bold text-foreground mb-2.5">Contact Information</Text>

          {tenant?.contact_email && (
            <Pressable
              className="flex-row items-center py-1 active:opacity-70"
              onPress={() => handleEmail(tenant.contact_email!)}
            >
              <Feather name="mail" size={18} color={colors.primary} />
              <Text className="text-base ml-2.5 flex-1 text-primary">
                {tenant.contact_email}
              </Text>
              <Feather name="external-link" size={16} color={colors.primary} />
            </Pressable>
          )}

          {tenant?.additional_contact_email && (
            <Pressable
              className="flex-row items-center py-1 mt-2 active:opacity-70"
              onPress={() => handleEmail(tenant.additional_contact_email!)}
            >
              <Feather name="mail" size={18} color={colors.primary} />
              <Text className="text-base ml-2.5 flex-1 text-primary">
                {tenant.additional_contact_email}
              </Text>
              <Feather name="external-link" size={16} color={colors.primary} />
            </Pressable>
          )}

          {tenant?.contact_phone && (
            <Pressable
              className="flex-row items-center py-1 mt-2 active:opacity-70"
              onPress={() => handlePhone(tenant.contact_phone!)}
            >
              <Feather name="phone" size={18} color={colors.primary} />
              <Text className="text-base ml-2.5 flex-1 text-primary">
                {tenant.contact_phone}
              </Text>
              <Feather name="phone-call" size={16} color={colors.primary} />
            </Pressable>
          )}
        </View>

        {/* Website */}
        {tenant?.website && (
          <Pressable
            className="flex-row justify-center items-center h-[52px] rounded-lg mb-2.5 bg-primary active:opacity-70"
            onPress={() => handleOpenLink(tenant.website!)}
          >
            <Feather name="globe" size={20} color={colors.buttonText} />
            <Text className="text-base font-semibold text-primary-foreground ml-2.5">
              Visit Website
            </Text>
          </Pressable>
        )}

        {/* Application URL */}
        {tenant?.application_url && (
          <Pressable
            className="flex-row justify-center items-center h-[52px] rounded-lg mb-2.5 mt-2.5 bg-accent active:opacity-70"
            onPress={() => handleOpenLink(tenant.application_url!)}
          >
            <Feather name="file-text" size={20} color="#FFFFFF" />
            <Text className="text-base font-semibold text-white ml-2.5">
              Apply Now
            </Text>
          </Pressable>
        )}

        {/* Social Media Links */}
        {tenant?.social_media_links && parseSocialLinks(tenant.social_media_links).length > 0 && (
          <View className="p-3 rounded-xl mb-3 bg-card shadow-sm">
            <Text className="text-lg font-bold text-foreground mb-2.5">Social Media</Text>
            {parseSocialLinks(tenant.social_media_links).map((link, index) => (
              <Pressable
                key={index}
                className={`flex-row items-center py-1 active:opacity-70 ${index < parseSocialLinks(tenant.social_media_links!).length - 1 ? 'mb-2' : ''}`}
                onPress={() => handleOpenLink(link.url)}
              >
                <Feather name="share-2" size={18} color={colors.primary} />
                <Text className="text-base ml-2.5 flex-1 text-primary">
                  {link.platform}
                </Text>
                <Feather name="external-link" size={16} color={colors.primary} />
              </Pressable>
            ))}
          </View>
        )}

        {/* Contact Button (if no email/phone) */}
        {!tenant?.contact_email && !tenant?.contact_phone && (
          <Pressable className="flex-row justify-center items-center h-[52px] rounded-lg mb-5 bg-primary active:opacity-70">
            <Feather name="mail" size={20} color={colors.buttonText} />
            <Text className="text-base font-semibold text-primary-foreground ml-2.5">
              Contact {name}
            </Text>
          </Pressable>
        )}
        </View>
      </ScrollView>
    </View>
  );
}

export default withAuthGuard(TenantDetailScreen);
