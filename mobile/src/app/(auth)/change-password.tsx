import React, { useState, useEffect, useRef } from 'react';
import { View, Pressable, Linking, Dimensions, TouchableOpacity, Image } from 'react-native';
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
import { MIN_PASSWORD_LENGTH } from '@/utils/validation';
import { authBack } from '@/utils/navigation';
import { PasswordField } from '@/components/PasswordField';
import { useAuthContext } from '@/hooks/use-auth-context';
import { authService } from '@/services/auth.service';
import { isCustomAuthEnabled } from '@/lib/feature-flags';

const { height } = Dimensions.get('window');

function validatePasswordStrength(password: string): string | null {
	if (!password) return 'Please enter your new password';
	if (password.length < MIN_PASSWORD_LENGTH) {
		return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
	}
	if (!/[A-Z]/.test(password)) return 'Password must include at least one uppercase letter';
	if (!/[a-z]/.test(password)) return 'Password must include at least one lowercase letter';
	if (!/\d/.test(password)) return 'Password must include at least one number';
	return null;
}

export default function ChangePasswordScreen() {
	const { colorScheme } = useColorScheme();
	const colors = COLORS[colorScheme];
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [currentPassword, setCurrentPassword] = useState('');
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [ready, setReady] = useState(false);
	/** True when opened via email recovery deep link (not Settings while logged in). */
	const isRecoveryFlow = useRef(false);
	const customResetToken = useRef<string | null>(null);
	const { session, isLoggedIn } = useAuthContext();

	useEffect(() => {
		let cancelled = false;
		let linkingSub: ReturnType<typeof Linking.addEventListener> | null = null;

		const processUrl = async (url: string | null) => {
			if (!url || cancelled) return;

			const [, hashRaw = ''] = url.split('#');
			const queryRaw = url.includes('?') ? url.split('?')[1].split('#')[0] : '';
			const hashParams = new URLSearchParams(hashRaw);
			const searchParams = new URLSearchParams(queryRaw);
			const get = (key: string) => hashParams.get(key) ?? searchParams.get(key) ?? null;

			const customToken = get('token');
			if (isCustomAuthEnabled() && customToken) {
				isRecoveryFlow.current = true;
				customResetToken.current = customToken;
				if (!cancelled) setReady(true);
				return;
			}

			const access_token = get('access_token');
			const refresh_token = get('refresh_token');
			const type = get('type');

			if (access_token && refresh_token) {
				isRecoveryFlow.current = true;
				const { error } = await supabase.auth.setSession({ access_token, refresh_token });
				if (!error && !cancelled) setReady(true);
				return;
			}

			if (type === 'recovery' || url.includes('type=recovery') || url.includes('code=')) {
				isRecoveryFlow.current = true;
				const nextSession = await authService.getSession();
				if (nextSession && !cancelled) setReady(true);
			}
		};

		async function init() {
			// Logged-in Settings flow: allow password change without an email recovery link.
			if (isLoggedIn || session?.user) {
				if (!cancelled) setReady(true);
			}

			if (isCustomAuthEnabled()) {
				const { getMemoryUser } = await import('@/lib/custom-auth-session');
				if (getMemoryUser() && !cancelled) setReady(true);
				const initialUrl = await Linking.getInitialURL();
				await processUrl(initialUrl);
				if (!cancelled) {
					linkingSub = Linking.addEventListener('url', ({ url }) => processUrl(url));
				}
				return;
			}

			const existingSession = await authService.getSession();
			if (existingSession && !cancelled) {
				setReady(true);
			}

			const initialUrl = await Linking.getInitialURL();
			await processUrl(initialUrl);

			if (!cancelled) {
				linkingSub = Linking.addEventListener('url', ({ url }) => processUrl(url));
			}
		}

		init();

		if (isCustomAuthEnabled()) {
			return () => {
				cancelled = true;
				linkingSub?.remove();
			};
		}

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, eventSession) => {
			if (cancelled) return;
			if (event === 'PASSWORD_RECOVERY') {
				isRecoveryFlow.current = true;
				setReady(true);
			}
			if (event === 'SIGNED_IN' && eventSession) setReady(true);
		});

		return () => {
			cancelled = true;
			linkingSub?.remove();
			subscription.unsubscribe();
		};
	}, [isLoggedIn, session?.user]);

	useEffect(() => {
		if (session?.user || isLoggedIn) {
			setReady(true);
		}
	}, [session?.user, isLoggedIn]);

	const handleChangePassword = async () => {
		setErrorMessage(null);
		setSuccessMessage(null);

		const sanitizedNewPassword = newPassword.trim();
		const sanitizedConfirmPassword = confirmPassword.trim();

		if (!sanitizedNewPassword || !sanitizedConfirmPassword) {
			setErrorMessage('Please fill in both password fields');
			return;
		}

		if (sanitizedNewPassword !== sanitizedConfirmPassword) {
			setErrorMessage('Passwords do not match');
			return;
		}

		const passwordValidationError = validatePasswordStrength(sanitizedNewPassword);
		if (passwordValidationError) {
			setErrorMessage(passwordValidationError);
			return;
		}

		setIsLoading(true);
		try {
			if (isCustomAuthEnabled()) {
				if (customResetToken.current) {
					const { customResetPassword } = await import('@/lib/custom-auth-session');
					await customResetPassword(customResetToken.current, sanitizedNewPassword);
					customResetToken.current = null;
				} else {
					const current = currentPassword.trim();
					if (!current) {
						throw new Error('Please enter your current password.');
					}
					const { getValidAccessToken } = await import('@/lib/custom-auth-session');
					const { getApiBaseUrl } = await import('@/lib/mobile-api');
					const base = getApiBaseUrl();
					if (!base) {
						throw new Error('API base URL is not configured for password changes.');
					}
					const token = await getValidAccessToken();
					const res = await fetch(`${base}/api/auth/change-password`, {
						method: 'POST',
						headers: {
							Authorization: `Bearer ${token}`,
							'Content-Type': 'application/json',
							Accept: 'application/json',
						},
						body: JSON.stringify({
							currentPassword: current,
							newPassword: sanitizedNewPassword,
						}),
					});
					const json = await res.json().catch(() => ({}));
					if (!res.ok) {
						throw new Error(
							typeof json.error === 'string' ? json.error : 'Failed to update password'
						);
					}
				}
			} else {
				await authService.updatePassword(sanitizedNewPassword);
			}

			setSuccessMessage('Your password has been successfully changed');

			// Recovery: clear session so login is reachable. Settings: keep session unless recovery.
			if (isRecoveryFlow.current && !isCustomAuthEnabled()) {
				await supabase.auth.signOut({ scope: 'local' });
			}

			setTimeout(() => {
				if (isRecoveryFlow.current || !isLoggedIn) {
					router.replace('/(auth)');
				} else {
					router.back();
				}
			}, 1500);
		} catch (err: any) {
			const msg = err?.message ?? 'Failed to change password. Please try again.';
			if (/same password|should be different/i.test(msg)) {
				setErrorMessage('Choose a password that is different from your current one.');
			} else if (/session|not authenticated|JWT|logged in/i.test(msg)) {
				setErrorMessage(
					'Your session expired. Use Forgot Password on the login screen, or sign in again and retry.'
				);
			} else {
				setErrorMessage(msg);
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleBackToLogin = authBack;
	const showCurrentPassword =
		isCustomAuthEnabled() && !customResetToken.current && (isLoggedIn || !!session?.user);

	if (!ready) {
		return (
			<View className="flex-1 bg-background justify-center items-center px-6">
				<Text className="text-center text-muted-foreground mb-4">
					Waiting for password recovery context. Open the reset link from your email to continue,
					or sign in and change your password from Settings.
				</Text>
				<Button onPress={handleBackToLogin} className="min-h-[56px] rounded-full px-6 py-3.5">
					<Text className="text-base leading-6 text-white font-semibold text-center">
						Back to Login
					</Text>
				</Button>
			</View>
		);
	}

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
						onPress={() => (isLoggedIn ? router.back() : handleBackToLogin())}
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
						<Text className="text-white/80 text-base text-center px-4">
							Enter your new password below.
						</Text>
					</View>
				</View>

				<ScreenKeyboardAwareScrollView
					contentContainerClassName="flex-grow rounded-3xl"
					contentContainerStyle={{ flexGrow: 1 }}
					style={{ flex: 1, zIndex: 2 }}
				>
					<View
						className="flex-1 px-6 pb-10 pt-6 rounded-3xl mt-4"
						style={{ backgroundColor: colors.background }}
					>
						{showCurrentPassword && (
							<View className="mb-4">
								<PasswordField
									value={currentPassword}
									onChangeText={(t) => {
										setCurrentPassword(t);
										setErrorMessage(null);
										setSuccessMessage(null);
									}}
									placeholder="Current password"
									accentColor={colors.accent}
									placeholderColor={colors.placeholder}
									editable={!isLoading}
									autoComplete="password"
									containerClassName="flex-row items-center bg-input rounded-full px-4 h-14 border border-border"
								/>
							</View>
						)}
						<View className="mb-4">
							<PasswordField
								value={newPassword}
								onChangeText={(t) => {
									setNewPassword(t);
									setErrorMessage(null);
									setSuccessMessage(null);
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
									setErrorMessage(null);
									setSuccessMessage(null);
								}}
								placeholder="Confirm new password"
								accentColor={colors.accent}
								placeholderColor={colors.placeholder}
								editable={!isLoading}
								autoComplete="password-new"
								containerClassName="flex-row items-center bg-input rounded-full px-4 h-14 border border-border"
							/>
							{errorMessage && (
								<View className="mt-2 rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3">
									<Text className="text-destructive text-sm">{errorMessage}</Text>
								</View>
							)}
							{successMessage && (
								<View className="mt-2 rounded-lg bg-green-100 border border-green-300 px-4 py-3">
									<Text className="text-green-800 text-sm">{successMessage}</Text>
								</View>
							)}
						</View>

						<Button
							className="min-h-[56px] rounded-full bg-accent justify-center items-center mb-4 px-6 py-3.5"
							onPress={handleChangePassword}
							disabled={isLoading || !ready}
						>
							<Text className="text-base leading-6 font-bold text-white text-center">
								{isLoading ? 'Updating…' : 'Change Password'}
							</Text>
						</Button>

						{!isLoggedIn && (
							<View className="items-center mt-2">
								<Pressable onPress={handleBackToLogin} hitSlop={10} className="px-3 py-2">
									<Text className="text-muted-foreground">
										Remember your password?{' '}
										<Text className="text-accent font-bold">Log In</Text>
									</Text>
								</Pressable>
							</View>
						)}
					</View>
				</ScreenKeyboardAwareScrollView>
			</SafeAreaView>
		</View>
	);
}
