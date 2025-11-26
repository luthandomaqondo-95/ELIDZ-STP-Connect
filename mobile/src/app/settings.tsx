import React, { useState } from 'react';
import { View, Pressable, Alert, Switch } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenScrollView } from '../components/ScreenScrollView';
import { useAuthContext } from '../hooks/use-auth-context';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { withAuthGuard } from '@/components/withAuthGuard';

function SettingsScreen() {
  const { profile: user, logout } = useAuthContext();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);

  const getAvatarSource = (avatar?: string) => {
    switch (avatar) {
      case 'blue': return require('../../assets/avatars/avatar-blue.png');
      case 'green': return require('../../assets/avatars/avatar-green.png');
      case 'orange': return require('../../assets/avatars/avatar-orange.png');
      default: return require('../../assets/avatars/avatar-blue.png');
    }
  };

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

  return (
    <ScreenScrollView>
      <View className="flex-row items-center p-4 rounded-xl mb-6 bg-card shadow-sm gap-4">
        <Image source={getAvatarSource(user?.avatar)} className="w-16 h-16 rounded-full" contentFit="cover" />
        <View className="flex-1">
          <Text className="text-lg font-bold">{user?.name}</Text>
          <Text className="text-sm text-muted-foreground mt-1">
            {user?.email}
          </Text>
          <Text className="text-xs text-primary mt-1">
            {user?.role}
          </Text>
        </View>
        <Pressable onPress={() => router.push('/edit-profile')}>
          <Feather name="edit-2" size={20} color="#007BFF" />
        </Pressable>
      </View>

      <View className="mb-8">
        <Text className="text-lg font-bold mb-4">Preferences</Text>

        <View className="flex-row items-center justify-between p-4 rounded-xl bg-card shadow-sm mb-3">
          <View className="flex-row items-center flex-1 gap-3">
            <Feather name="bell" size={20} color="#111" />
            <Text className="text-base">Push Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#E0E0E0', true: '#007BFF' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View className="flex-row items-center justify-between p-4 rounded-xl bg-card shadow-sm">
          <View className="flex-row items-center flex-1 gap-3">
            <Feather name="mail" size={20} color="#111" />
            <Text className="text-base">Email Updates</Text>
          </View>
          <Switch
            value={emailUpdates}
            onValueChange={setEmailUpdates}
            trackColor={{ false: '#E0E0E0', true: '#007BFF' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View className="mb-8">
        <Text className="text-lg font-bold mb-4">Support</Text>

        <Pressable className="flex-row items-center justify-between p-4 rounded-xl bg-card active:opacity-70 shadow-sm">
          <View className="flex-row items-center flex-1 gap-3">
            <Feather name="help-circle" size={20} color="#111" />
            <Text className="text-base">Help & Support</Text>
          </View>
          <Feather name="chevron-right" size={20} color="rgb(153, 153, 158)" />
        </Pressable>

        <Pressable className="flex-row items-center justify-between p-4 rounded-xl bg-card active:opacity-70 shadow-sm mt-3">
          <View className="flex-row items-center flex-1 gap-3">
            <Feather name="shield" size={20} color="#111" />
            <Text className="text-base">Privacy Policy</Text>
          </View>
          <Feather name="chevron-right" size={20} color="rgb(153, 153, 158)" />
        </Pressable>

        <Pressable className="flex-row items-center justify-between p-4 rounded-xl bg-card active:opacity-70 shadow-sm mt-3">
          <View className="flex-row items-center flex-1 gap-3">
            <Feather name="file-text" size={20} color="#111" />
            <Text className="text-base">Terms of Service</Text>
          </View>
          <Feather name="chevron-right" size={20} color="rgb(153, 153, 158)" />
        </Pressable>
      </View>

      <View className="mb-8">
        <Text className="text-lg font-bold mb-4">Account</Text>

        <Pressable
          className="flex-row items-center justify-between p-4 rounded-xl bg-card active:opacity-70 shadow-sm"
          onPress={handleLogout}
        >
          <View className="flex-row items-center flex-1 gap-3">
            <Feather name="log-out" size={20} color="#EF4444" />
            <Text className="text-base text-red-500">
              Logout
            </Text>
          </View>
        </Pressable>

        <Pressable
          className="flex-row items-center justify-between p-4 rounded-xl bg-card active:opacity-70 shadow-sm mt-3"
          onPress={handleDeleteAccount}
        >
          <View className="flex-row items-center flex-1 gap-3">
            <Feather name="trash-2" size={20} color="#EF4444" />
            <Text className="text-base text-red-500">
              Delete Account
            </Text>
          </View>
        </Pressable>
      </View>
    </ScreenScrollView>
  );
}

export default withAuthGuard(SettingsScreen);

