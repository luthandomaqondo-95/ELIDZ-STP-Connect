import React, { useState } from 'react';
import { View, Pressable, Alert, Dimensions, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenKeyboardAwareScrollView } from '@/components/ScreenKeyboardAwareScrollView';
import { Ionicons } from '@expo/vector-icons';
import { Stars } from '@/components/Stars';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useColorScheme } from '@/hooks/use-theme-color';
import { COLORS } from '@/theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { validatePassword, validateConfirmPassword, MIN_PASSWORD_LENGTH } from '@/utils/validation';
import { PasswordField } from '@/components/PasswordField';
import { authBack } from '@/utils/navigation';

const { height } = Dimensions.get('window');

export default function InAppChangePasswordScreen() {
  const { colorScheme } = useColorScheme();
  const colors = COLORS[colorScheme];
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const withTimeout = async <T,>(promise: Promise<T>, ms: number, message: string): Promise<T> => {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    });
    return Promise.race([promise, timeoutPromise]);
  };

  const handleChangePassword = async () => {
    console.log('[ChangePassword] Submit pressed');
    setError(null);
    const pwdCheck = validatePassword(newPassword, { minLength: MIN_PASSWORD_LENGTH });
    if (!pwdCheck.valid) {
      console.log('[ChangePassword] Validation failed: password', { message: pwdCheck.message });
      setError(pwdCheck.message ?? `Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }
    const confirmCheck = validateConfirmPassword(newPassword.trim(), confirmPassword.trim());
    if (!confirmCheck.valid) {
      console.log('[ChangePassword] Validation failed: confirm password', { message: confirmCheck.message });
      setError(confirmCheck.message ?? 'Passwords do not match');
      return;
    }

    console.log('[ChangePassword] Validation passed');
    setIsLoading(true);
    let passwordUpdatedEventSeen = false;
    const {
      data: { subscription: passwordUpdateSubscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'USER_UPDATED') {
        passwordUpdatedEventSeen = true;
      }
    });
    try {
      console.log('[ChangePassword] updateUser start');
      const { error: updateError } = await withTimeout(
        supabase.auth.updateUser({ password: newPassword.trim() }),
        25000,
        'Request timed out. Please try again.'
      );
      console.log('[ChangePassword] updateUser done', { hasError: !!updateError, errorMessage: updateError?.message });
      if (updateError) throw updateError;
      // Never let sign-out block UX; continue even if local storage/network is slow.
      console.log('[ChangePassword] signOut(local) start');
      await withTimeout(
        supabase.auth.signOut({ scope: 'local' }),
        3000,
        'Sign out timed out.'
      ).catch(() => undefined);
      console.log('[ChangePassword] signOut(local) done-or-timeout');
      setIsLoading(false);
      console.log('[ChangePassword] showing success alert');
      Alert.alert(
        'Password Changed',
        'Your password has been successfully updated. Please sign in again.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)') }]
      );
      // Fallback redirect in case alert interaction is delayed or dismissed.
      setTimeout(() => {
        console.log('[ChangePassword] fallback redirect / (auth)');
        router.replace('/(auth)');
      }, 1200);
      return;
    } catch (err: any) {
      const isTimeout = /timed out/i.test(err?.message ?? '');
      if (isTimeout && passwordUpdatedEventSeen) {
        console.log('[ChangePassword] timeout but USER_UPDATED seen -> continuing success flow');
        await withTimeout(
          supabase.auth.signOut({ scope: 'local' }),
          3000,
          'Sign out timed out.'
        ).catch(() => undefined);
        setIsLoading(false);
        Alert.alert(
          'Password Changed',
          'Your password has been successfully updated. Please sign in again.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)') }]
        );
        setTimeout(() => {
          router.replace('/(auth)');
        }, 1200);
        return;
      }
      console.log('[ChangePassword] submit failed', {
        message: err?.message,
        code: err?.code,
        status: err?.status,
      });
      setError(err?.message ?? 'Failed to change password. Please try again.');
    } finally {
      passwordUpdateSubscription.unsubscribe();
      console.log('[ChangePassword] finally -> setIsLoading(false)');
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.4 }}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <Stars />
      </View>

      <SafeAreaView className="flex-1" edges={['top']} style={{ zIndex: 1, position: 'relative' }}>
        <View className="px-6 pt-2 rounded-3xl" style={{ height: height * 0.24, zIndex: 1 }}>
          <TouchableOpacity
            className="w-10 h-10 rounded-full flex-row justify-center items-center mt-2"
            onPress={authBack}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            <Text className="text-white text-sm ml-1">Back</Text>
          </TouchableOpacity>
          <View className="items-center mt-2">
            <Image
              source={require('../../assets/logos/blue text-idz logo.png')}
              style={{ width: 240, height: 100 }}
              resizeMode="contain"
            />
            <Text className="text-white text-3xl font-bold mt-4 mb-2">Change Password</Text>
            <Text className="text-white/80 text-base text-center px-4">Enter your new password below.</Text>
          </View>
        </View>

        <ScreenKeyboardAwareScrollView
          contentContainerClassName="flex-grow rounded-3xl"
          contentContainerStyle={{ flexGrow: 1 }}
          style={{ flex: 1, zIndex: 2 }}
        >
          <View className="flex-1 px-6 pb-10 pt-6 rounded-3xl mt-4" style={{ backgroundColor: colors.background }}>
            <View className="mb-4">
              <PasswordField
                value={newPassword}
                onChangeText={(t) => {
                  setNewPassword(t);
                  setError(null);
                }}
                placeholder={`New password (min ${MIN_PASSWORD_LENGTH} characters)`}
                accentColor={colors.accent}
                placeholderColor={colors.placeholder}
                editable={!isLoading}
                autoComplete="password-new"
                containerClassName="flex-row items-center bg-input rounded-full px-4 h-14 border border-border"
              />
            </View>

            <View className="mb-6">
              <PasswordField
                value={confirmPassword}
                onChangeText={(t) => {
                  setConfirmPassword(t);
                  setError(null);
                }}
                placeholder="Confirm new password"
                accentColor={colors.accent}
                placeholderColor={colors.placeholder}
                editable={!isLoading}
                autoComplete="password-new"
                containerClassName="flex-row items-center bg-input rounded-full px-4 h-14 border border-border"
              />
              {error && (
                <View className="mt-2 rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3">
                  <Text className="text-destructive text-sm">{error}</Text>
                </View>
              )}
            </View>

            <Button
              className="min-h-[56px] rounded-full bg-accent justify-center items-center mb-4 px-6 py-3.5"
              onPress={handleChangePassword}
              disabled={isLoading}
            >
              <Text className="text-base leading-6 font-bold text-white text-center">
                {isLoading ? 'Updating…' : 'Change Password'}
              </Text>
            </Button>

            <View className="flex-row justify-center mt-2">
              <Text className="text-muted-foreground">Remember your password? </Text>
              <Pressable onPress={() => router.replace('/(auth)')}>
                <Text className="text-accent font-bold">Log In</Text>
              </Pressable>
            </View>
          </View>
        </ScreenKeyboardAwareScrollView>
      </SafeAreaView>
    </View>
  );
}
