import React from 'react';
import { View, ScrollView, Pressable, Linking } from 'react-native';
import { Text } from '@/components/ui/text';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { TabsLayoutHeader } from '@/components/Header';
import { useColorScheme } from '@/hooks/use-theme-color';
import { COLORS } from '@/theme/colors';

export default function AboutScreen() {
  const { colorScheme } = useColorScheme();
  const colors = COLORS[colorScheme];
  const isDark = colorScheme === 'dark';
  const cardBackground = isDark ? colors.backgroundDefault : colors.card;
  const pillBackground = isDark ? colors.backgroundSecondary : `${colors.primary}15`;
  const subtleRowBackground = isDark ? colors.backgroundSecondary : colors.backgroundSecondary;

  const handleContact = () => {
    Linking.openURL('mailto:info@elidz.co.za');
  };

  const handleWebsite = () => {
    Linking.openURL('https://www.elidz.co.za');
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="bg-background">
          <TabsLayoutHeader
            title="About"
            variant="navy"
            showActions={false}
            left={
              <Pressable
                onPress={() => router.back()}
                className="p-2 bg-white/10 rounded-full"
              >
                <Feather name="arrow-left" size={20} color="white" />
              </Pressable>
            }
          >
            <View className="items-center mt-4">
              <View className="w-24 h-24 rounded-3xl justify-center items-center shadow-lg mb-4" style={{ backgroundColor: cardBackground }}>
                <Text className="font-bold text-center text-xs px-2" style={{ color: colors.primary }}>
                  ELIDZ
                  Science &
                  Tech Park
                </Text>
              </View>
              <Text className="text-white text-2xl font-bold text-center">ELIDZ-STP Connect</Text>
              <Text className="text-white/70 text-sm font-medium mt-1">Version 1.0.0</Text>
            </View>
          </TabsLayoutHeader>
        </View>

        <View className="px-6 mt-6">
            {/* Mission Card */}
            <View className="p-6 rounded-2xl shadow-sm mb-6 border border-border" style={{ backgroundColor: cardBackground }}>
                <View className="flex-row items-center mb-3">
                    <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: pillBackground }}>
                        <Feather name="target" size={20} color={colors.primary} />
                    </View>
                    <Text className="text-lg font-bold" style={{ color: colors.text }}>Our Mission</Text>
                </View>
                <Text className="leading-relaxed text-sm text-muted-foreground">
                    To be a world-class Science and Technology Park that fosters innovation, entrepreneurship, and economic growth in the Eastern Cape region. We connect innovators, researchers, and businesses to create sustainable solutions for the future.
                </Text>
            </View>

            {/* Features Grid */}
            <Text className="font-bold text-lg mb-4 ml-1 text-foreground">Key Features</Text>
            <View className="flex-row flex-wrap justify-between mb-6">
                {[
                    { icon: 'users', title: 'Networking', desc: 'Connect with industry leaders' },
                    { icon: 'zap', title: 'Innovation', desc: 'Access labs & facilities' },
                    { icon: 'briefcase', title: 'Support', desc: 'Business incubation' },
                    { icon: 'globe', title: 'Growth', desc: 'Global market access' },
                ].map((item, index) => (
                    <View key={index} className="w-[48%] p-4 rounded-2xl shadow-sm mb-4 border border-border" style={{ backgroundColor: cardBackground }}>
                        <Feather name={item.icon as any} size={24} color={colors.accent} className="mb-2" />
                        <Text className="font-bold mb-1 text-foreground">{item.title}</Text>
                        <Text className="text-xs text-muted-foreground">{item.desc}</Text>
                    </View>
                ))}
            </View>

            {/* Contact & Info */}
            <View className="rounded-2xl overflow-hidden shadow-sm border border-border" style={{ backgroundColor: cardBackground }}>
                <Pressable
                    onPress={handleWebsite}
                    className="flex-row items-center p-4 border-b border-border active:opacity-80"
                    style={({ pressed }) => ({ backgroundColor: pressed ? subtleRowBackground : undefined })}
                >
                    <Feather name="globe" size={20} color={colors.primary} />
                    <Text className="flex-1 ml-3 font-medium text-foreground">Visit Website</Text>
                    <Feather name="external-link" size={16} color={colors.textSecondary} />
                </Pressable>
                <Pressable
                    onPress={handleContact}
                    className="flex-row items-center p-4 border-b border-border active:opacity-80"
                    style={({ pressed }) => ({ backgroundColor: pressed ? subtleRowBackground : undefined })}
                >
                    <Feather name="mail" size={20} color={colors.primary} />
                    <Text className="flex-1 ml-3 font-medium text-foreground">Contact Us</Text>
                    <Feather name="chevron-right" size={16} color={colors.textSecondary} />
                </Pressable>
                <View className="flex-row items-center p-4" style={{ backgroundColor: subtleRowBackground }}>
                    <Feather name="shield" size={20} color={colors.primary} />
                    <Text className="flex-1 ml-3 font-medium text-foreground">Privacy Policy</Text>
                </View>
            </View>

            <Text className="text-center text-xs mt-8 text-muted-foreground">
                © 2025 East London Industrial Development Zone SOC Ltd. All rights reserved.
            </Text>
        </View>
      </ScrollView>
    </View>
  );
}
