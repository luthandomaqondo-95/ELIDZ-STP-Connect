import React, { useState } from 'react';
import { View, Pressable, Alert, Image, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenKeyboardAwareScrollView } from '@/components/ScreenKeyboardAwareScrollView';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/button';
import { Stars } from '@/components/Stars';
import { supabase } from '@/lib/supabase';
import { useColorScheme } from '@/hooks/use-theme-color';
import { COLORS } from '@/theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { validatePassword, validateConfirmPassword } from '@/utils/validation';
import { PasswordField } from '@/components/PasswordField';

const { height } = Dimensions.get('window');

export default function ChangePasswordScreen() {
	const { colorScheme } = useColorScheme();
	const colors = COLORS[colorScheme];
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const navigateBack = () => {
		if (router.canGoBack()) {
			router.back();
		}
	};

	const handleChangePassword = async () => {
		const pwdCheck = validatePassword(newPassword, { minLength: 6 });
		if (!pwdCheck.valid) {
			Alert.alert('Error', pwdCheck.message ?? 'Please enter a new password');
			return;
		}
		const confirmCheck = validateConfirmPassword(newPassword, confirmPassword);
		if (!confirmCheck.valid) {
			Alert.alert('Error', confirmCheck.message ?? 'New passwords do not match');
			return;
		}

		setIsLoading(true);

		try {
			const { error } = await supabase.auth.updateUser({ password: newPassword });
			if (error) throw error;
			Alert.alert('Success', 'Password changed successfully!', [
				{ text: 'OK', onPress: navigateBack },
			]);
		} catch (err: any) {
			Alert.alert('Error', err?.message ?? 'Failed to change password. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<View className="flex-1 bg-background">
			<LinearGradient
				colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
				className="absolute inset-0"
				style={{ height: height * 0.4 }}
				start={{ x: 0.5, y: 0 }}
				end={{ x: 0.5, y: 1 }}
			/>
			<Stars />
			<SafeAreaView className="flex-1" edges={['top']}>
				<View className="px-6 pt-2 rounded-3xl" style={{ height: height * 0.24 }}>
					<TouchableOpacity
						className="w-10 h-10 rounded-full flex-row justify-center items-center mt-2"
						onPress={navigateBack}
					>
						<Ionicons name="chevron-back" size={24} color="#FFFFFF" />
						<Text className="text-white text-sm ml-1">Back</Text>
					</TouchableOpacity>
					<View className="items-center mt-2">
						<Image
							source={require('../../../assets/logos/blue text-idz logo.png')}
							style={{ width: 240, height: 100 }}
							resizeMode="contain"
						/>
						<Text className="text-white text-3xl font-bold mt-4 mb-2">Change Password</Text>
						<Text className="text-white/80 text-base text-center px-4 mb-2">
							Update your password regularly to keep your ELIDZ-STP account secure.
						</Text>
					</View>
				</View>

				<ScreenKeyboardAwareScrollView
					contentContainerClassName="flex-grow rounded-3xl"
					style={{ zIndex: 2 }}
				>
					<View className="w-full px-6 pb-10 pt-6 rounded-3xl bg-background mt-4">
						<PasswordField
							value={newPassword}
							onChangeText={setNewPassword}
							placeholder="New Password"
							accentColor={colors.accent}
							placeholderColor={colors.placeholder}
							editable={!isLoading}
							autoComplete="password-new"
							containerClassName="flex-row items-center bg-input rounded-full mb-4 px-4 h-14 border border-border"
						/>
						<PasswordField
							value={confirmPassword}
							onChangeText={setConfirmPassword}
							placeholder="Confirm New Password"
							accentColor={colors.accent}
							placeholderColor={colors.placeholder}
							editable={!isLoading}
							autoComplete="password-new"
							containerClassName="flex-row items-center bg-input rounded-full mb-6 px-4 h-14 border border-border"
						/>

						<Button
							className="h-14 rounded-full bg-accent justify-center items-center mb-4 active:opacity-80 active:scale-95"
							onPress={handleChangePassword}
							disabled={isLoading}
						>
							<Text className="text-lg font-semibold text-white">
								{isLoading ? 'Changing...' : 'Change Password'}
							</Text>
						</Button>

						<Button
							variant="outline"
							className="h-14 rounded-full border-border justify-center items-center"
							onPress={navigateBack}
							disabled={isLoading}
						>
							<Text className="text-lg font-semibold text-foreground">Cancel</Text>
						</Button>
					</View>
				</ScreenKeyboardAwareScrollView>
			</SafeAreaView>
		</View>
	);
}
