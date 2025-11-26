import React from 'react';
import { View, StyleSheet, Pressable, Image, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { useTheme } from '../hooks/useTheme';
import { Spacing, BorderRadius, Typography, Shadow } from '../constants/theme';
import { Feather } from '@expo/vector-icons';
import { withAuthGuard } from '@/components/withAuthGuard';
import { LinearGradient } from 'expo-linear-gradient';

function TenantDetailScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ tenant?: string, name?: string, id?: string }>();
  
  // Handle both passed object string or direct params
  let tenant = null;
  if (params.tenant) {
    try {
      tenant = JSON.parse(params.tenant as string);
    } catch (e) {
      console.error('Error parsing tenant params:', e);
    }
  }

  const name = params.name || tenant?.name || 'Tenant';
  // Mock data if not provided (should ideally fetch from ID)
  const industry = tenant?.industry || 'Technology';
  const center = tenant?.center || 'Digital Hub';
  const description = tenant?.description || `${name} is a leading organization in the ${industry} sector, dedicated to innovation and excellence.`;
  const logo = tenant?.logo;

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
        <View style={[styles.logoContainer, { backgroundColor: logo ? 'transparent' : colors.primary }]}>
          {logo ? (
            <Image source={logo} style={styles.logoImage} resizeMode="contain" />
          ) : (
            <Text style={[Typography.h1, { color: '#FFFFFF' }]}>
              {name.charAt(0)}
            </Text>
          )}
        </View>

        <View style={styles.tagsContainer}>
          <View style={[styles.tag, { backgroundColor: colors.primary }]}>
            <Text style={[Typography.small, { color: '#FFFFFF' }]}>{industry}</Text>
          </View>
          <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
            <Text style={[Typography.small, { color: '#FFFFFF' }]}>{center}</Text>
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

        <View style={[styles.card, { backgroundColor: colors.backgroundDefault, ...Shadow.card }]}>
          <Text style={[Typography.h3, { marginBottom: Spacing.md }]}>Location</Text>
          <View style={styles.infoRow}>
            <Feather name="map-pin" size={18} color={colors.primary} />
            <Text style={[Typography.body, { marginLeft: Spacing.md }]}>
              {center}, ELIDZ-STP
            </Text>
          </View>
        </View>

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
  logoImage: {
    width: '100%',
    height: '100%',
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
});
