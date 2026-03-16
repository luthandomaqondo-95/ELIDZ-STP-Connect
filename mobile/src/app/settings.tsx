import React, { useState } from 'react';
import { View, Pressable, Alert, Switch, Linking } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenScrollView } from '../components/ScreenScrollView';
import { useAuthContext } from '../hooks/use-auth-context';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { withAuthGuard } from '@/components/withAuthGuard';
import { TabsLayoutHeader } from '@/components/Header';
import { useAvatarUri } from '@/hooks/use-avatar-uri';
import { useColorScheme } from '@/hooks/use-theme-color';
import { COLORS } from '@/theme/colors';
import { DEFAULT_AVATAR } from '@/constants/avatars';

function SettingsScreen() {
  const { profile: user, logout } = useAuthContext();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const { uri: avatarUri } = useAvatarUri(user?.avatar);
  const { colorScheme } = useColorScheme();
  const colors = COLORS[colorScheme];

  const avatarSource = avatarUri ? { uri: avatarUri } : DEFAULT_AVATAR;

  async function handleLogout() {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  }

  function handleDeleteAccount() {
    Alert.alert('Delete Account', 'Are you absolutely sure? This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Alert.alert(
            'Confirm Delete',
            'This will permanently delete your account and all associated data.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete Forever',
                style: 'destructive',
                onPress: async () => {
                  await logout();
                },
              },
            ],
          );
        },
      },
    ]);
  }

  async function openUrl(url: string) {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert('Error', 'Cannot open this link on your device.');
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert('Error', 'Failed to open the link.');
    }
  }

  const SettingRow = ({
    icon,
    title,
    subtitle,
    onPress,
    right,
    destructive = false,
    isFirst = false,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    right?: React.ReactNode;
    destructive?: boolean;
    isFirst?: boolean;
  }) => (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className={[
        "flex-row items-center px-5 py-4",
        !isFirst ? "border-t border-border" : "",
        onPress ? "active:opacity-70" : "",
      ].join(" ")}
    >
      <View
        className={[
          "w-10 h-10 rounded-full items-center justify-center mr-4",
          destructive ? "bg-destructive/10" : "bg-accent/10",
        ].join(" ")}
      >
        <Feather name={icon as any} size={18} color={destructive ? colors.destructive : colors.accent} />
      </View>

      <View className="flex-1">
        <Text className={["text-base font-semibold", destructive ? "text-destructive" : "text-foreground"].join(" ")}>
          {title}
        </Text>
        {subtitle ? <Text className="text-xs text-muted-foreground mt-0.5">{subtitle}</Text> : null}
      </View>

      {right ?? (onPress ? <Feather name="chevron-right" size={18} color={colors.text} /> : null)}
    </Pressable>
  );

  return (
    <ScreenScrollView insetTop={false} contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="bg-background">
        <TabsLayoutHeader title="Settings" variant="navy" showActions={false}>
          <Text className="text-white/80 text-base">
            Manage your account and preferences.
          </Text>
        </TabsLayoutHeader>
      </View>

      <View className="mt-6 px-6">
        {/* Account summary */}
        <Pressable
          onPress={() => router.push('/edit-profile')}
          className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden active:opacity-80"
        >
          <View className="flex-row items-center p-5">
            <View className="w-14 h-14 rounded-full bg-muted overflow-hidden border border-border" style={{ minWidth: 56, minHeight: 56 }}>
              <Image
                source={avatarSource}
                style={{ width: 56, height: 56 }}
                contentFit="cover"
              />
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-base font-bold text-foreground" numberOfLines={1}>
                {user?.name ?? 'Account'}
              </Text>
              {user?.email ? (
                <Text className="text-xs text-muted-foreground mt-1" numberOfLines={1}>
                  {user.email}
                </Text>
              ) : null}
              {user?.role ? (
                <View className="self-start mt-2 px-2.5 py-1 rounded-full bg-accent/10">
                  <Text className="text-[10px] font-bold text-accent uppercase">{user.role}</Text>
                </View>
              ) : null}
            </View>
            <View className="w-10 h-10 rounded-full bg-accent/10 items-center justify-center">
              <Feather name="edit-2" size={18} color={colors.accent} />
            </View>
          </View>
        </Pressable>

        {/* Preferences */}
        <View className="mt-8">
          <Text className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">Preferences</Text>

          <View className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <SettingRow
              icon="bell"
              title="Push Notifications"
              subtitle="Alerts for messages and updates"
              isFirst
              right={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: colors.gray200, true: colors.accent }}
                  thumbColor={colors.white}
                />
              }
            />
            <SettingRow
              icon="mail"
              title="Email Updates"
              subtitle="News and important announcements"
              right={
                <Switch
                  value={emailUpdates}
                  onValueChange={setEmailUpdates}
                  trackColor={{ false: colors.gray200, true: colors.accent }}
                  thumbColor={colors.white}
                />
              }
            />
          </View>
        </View>

        {/* Support */}
        <View className="mt-8">
          <Text className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">Support</Text>
          <View className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <SettingRow
              icon="help-circle"
              title="Help & Support"
              subtitle="Get help or contact ELIDZ"
              isFirst
              onPress={() => openUrl('https://www.elidz.co.za/contact-us/')}
            />
            <SettingRow
              icon="shield"
              title="Privacy Policy"
              onPress={() => openUrl('https://www.elidz.co.za/privacy-policy/')}
            />
            <SettingRow
              icon="file-text"
              title="Terms of Service"
              onPress={() => openUrl('https://www.elidz.co.za/terms-and-conditions/')}
            />
          </View>
        </View>

        {/* Account actions */}
        <View className="mt-8">
          <Text className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">Account</Text>
          <View className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <SettingRow
              icon="log-out"
              title="Logout"
              destructive
              isFirst
              onPress={handleLogout}
            />
            <SettingRow
              icon="trash-2"
              title="Delete Account"
              subtitle="This cannot be undone"
              destructive
              onPress={handleDeleteAccount}
            />
          </View>
        </View>
      </View>
    </ScreenScrollView>
  );
}

export default withAuthGuard(SettingsScreen);

