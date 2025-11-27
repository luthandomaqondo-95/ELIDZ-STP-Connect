import React, { useState } from 'react';
import { View, TextInput, Pressable, Alert, Image } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenKeyboardAwareScrollView } from '@/components/ScreenKeyboardAwareScrollView';
import { useAuthContext } from '@/hooks/use-auth-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/button';

export default function ChangePasswordScreen() {
	const { profile: user } = useAuthContext();
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const player = useVideoPlayer(require('../../../assets/videos/ELIDZ from above.mp4'), (player) => {
		player.loop = true;
		player.muted = true;
		player.play();
	});

	const navigateBack = () => {
		if (router.canGoBack()) {
			router.back();
		}
	};

	const handleChangePassword = async () => {
		if (!currentPassword.trim()) {
			Alert.alert('Error', 'Please enter your current password');
			return;
		}

		if (!newPassword.trim()) {
			Alert.alert('Error', 'Please enter a new password');
			return;
		}

		if (newPassword.length < 6) {
			Alert.alert('Error', 'New password must be at least 6 characters long');
			return;
		}

		if (newPassword !== confirmPassword) {
			Alert.alert('Error', 'New passwords do not match');
			return;
		}

		if (currentPassword === newPassword) {
			Alert.alert('Error', 'New password must be different from current password');
			return;
		}

		setIsLoading(true);

		try {
			// TODO: Implement password change with Supabase
			console.log('Changing password for user:', user?.email);

			await new Promise((resolve) => setTimeout(resolve, 1500));
			Alert.alert('Success', 'Password changed successfully!', [
				{ text: 'OK', onPress: navigateBack },
			]);
		} catch (error) {
			console.error('Password change error:', error);
			Alert.alert('Error', 'Failed to change password. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<View className="flex-1 bg-transparent">
			<VideoView
				player={player}
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					bottom: 0,
					right: 0,
					width: '100%',
					height: '100%',
					zIndex: 0,
					opacity: 0.4,
				}}
				contentFit="cover"
				nativeControls={false}
				pointerEvents="none"
			/>

			<View
				className="absolute inset-0 bg-black/70"
				style={{ zIndex: 1 }}
				pointerEvents="none"
			/>

			<ScreenKeyboardAwareScrollView
				contentContainerClassName="flex-grow"
				style={{ zIndex: 2 }}
			>
				<View className="flex-1 justify-center px-6 py-12">
					<Pressable
						className="flex-row items-center gap-2 mb-6 w-24"
						onPress={navigateBack}
					>
						<Ionicons name="chevron-back" size={20} color="#ffffff" />
						<Text className="text-white font-semibold">Back</Text>
					</Pressable>

					<View className="items-center mb-8">
						<Image
							source={require('../../../assets/logos/blue text-idz logo.png')}
							style={{ width: 280, height: 120, opacity: 1 }}
							resizeMode="contain"
						/>
					</View>

					<View className="bg-black/30 border border-white/10 rounded-3xl p-6">
						<Text className="text-white text-2xl font-bold text-center mb-2">
							Change Password
						</Text>
						<Text className="text-white/80 text-center mb-6">
							Update your password regularly to keep your ELIDZ-STP account secure.
						</Text>

						<View className="flex-row items-center bg-white/10 rounded-full mb-4 px-4 h-14 border border-white/20">
							<Ionicons name="lock-closed-outline" size={20} color="#FF6600" style={{ marginRight: 12 }} />
							<TextInput
								className="flex-1 text-base text-white"
								value={currentPassword}
								onChangeText={setCurrentPassword}
								placeholder="Current Password"
								placeholderTextColor="#9CA3AF"
								secureTextEntry={!showCurrentPassword}
								autoCapitalize="none"
								autoComplete="password"
							/>
							<Pressable
								className="p-1"
								onPress={() => setShowCurrentPassword((prev) => !prev)}
							>
								<Ionicons
									name={showCurrentPassword ? 'eye-outline' : 'eye-off-outline'}
									size={20}
									color="#FF6600"
								/>
							</Pressable>
						</View>

						<View className="flex-row items-center bg-white/10 rounded-full mb-4 px-4 h-14 border border-white/20">
							<Ionicons name="lock-closed-outline" size={20} color="#FF6600" style={{ marginRight: 12 }} />
							<TextInput
								className="flex-1 text-base text-white"
								value={newPassword}
								onChangeText={setNewPassword}
								placeholder="New Password"
								placeholderTextColor="#9CA3AF"
								secureTextEntry={!showNewPassword}
								autoCapitalize="none"
								autoComplete="password-new"
							/>
							<Pressable
								className="p-1"
								onPress={() => setShowNewPassword((prev) => !prev)}
							>
								<Ionicons
									name={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
									size={20}
									color="#FF6600"
								/>
							</Pressable>
						</View>

						<View className="flex-row items-center bg-white/10 rounded-full mb-6 px-4 h-14 border border-white/20">
							<Ionicons name="lock-closed-outline" size={20} color="#FF6600" style={{ marginRight: 12 }} />
							<TextInput
								className="flex-1 text-base text-white"
								value={confirmPassword}
								onChangeText={setConfirmPassword}
								placeholder="Confirm New Password"
								placeholderTextColor="#9CA3AF"
								secureTextEntry={!showConfirmPassword}
								autoCapitalize="none"
								autoComplete="password-new"
							/>
							<Pressable
								className="p-1"
								onPress={() => setShowConfirmPassword((prev) => !prev)}
							>
								<Ionicons
									name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
									size={20}
									color="#FF6600"
								/>
							</Pressable>
						</View>

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
							className="h-14 rounded-full border-white/40 bg-transparent justify-center items-center"
							onPress={navigateBack}
							disabled={isLoading}
						>
							<Text className="text-lg font-semibold text-white">Cancel</Text>
						</Button>
					</View>
				</View>
			</ScreenKeyboardAwareScrollView>
		</View>
	);
}
