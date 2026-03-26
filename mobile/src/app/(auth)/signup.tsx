import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, TextInput, Pressable, TouchableOpacity, Image, ActivityIndicator, Modal, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenKeyboardAwareScrollView } from '@/components/ScreenKeyboardAwareScrollView';
import { useAuthContext } from '@/hooks/use-auth-context';
import { Ionicons } from '@expo/vector-icons';
import { Stars } from '@/components/Stars';
import { Button } from '@/components/ui/button';
import { useColorScheme } from '@/hooks/use-theme-color';
import { COLORS } from '@/theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { validateEmail, validatePassword, validateConfirmPassword, validateIdNumber } from '@/utils/validation';
import { PasswordField } from '@/components/PasswordField';
import { TermsAndPrivacyNotice } from '@/components/TermsAndPrivacyNotice';
import { fetchZaPostalCodesForCity, fetchZaCitiesByProvince, fetchZaProvinces } from '@/services/za-postal-codes.service';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';

const ROLES = ['Entrepreneur', 'Researcher', 'SMME', 'Student', 'Investor', 'Tenant'] as const;

export default function SignupScreen() {
	const { signup, signInWithGoogle, signInWithApple } = useAuthContext();
	const { colorScheme } = useColorScheme();
	const colors = COLORS[colorScheme];
	const { isLoading, error, errorTitle, execute, clearError, setError } = useAsyncOperation();
	const [name, setName] = useState('');
	const [idNumber, setIdNumber] = useState('');
	const [email, setEmail] = useState('');
	const [province, setProvince] = useState<string>('');
	const [city, setCity] = useState('');
	const [postalCode, setPostalCode] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [role, setRole] = useState<'Entrepreneur' | 'Researcher' | 'SMME' | 'Student' | 'Investor' | 'Tenant'>('Entrepreneur');
	const isSubmittingRef = useRef(false);
	const [acceptedTerms, setAcceptedTerms] = useState(false);
	const [cooldownSeconds, setCooldownSeconds] = useState(0);

	const [postalCodesForCity, setPostalCodesForCity] = useState<string[]>([]);
	const [loadingPostalCodes, setLoadingPostalCodes] = useState(false);
	const [postalCodeSearch, setPostalCodeSearch] = useState('');
	const [postalCodeModalVisible, setPostalCodeModalVisible] = useState(false);
	const [provinceModalVisible, setProvinceModalVisible] = useState(false);
	const [cityModalVisible, setCityModalVisible] = useState(false);
	const [roleModalVisible, setRoleModalVisible] = useState(false);

	const [provinces, setProvinces] = useState<string[]>([]);
	const [citiesByProvince, setCitiesByProvince] = useState<string[]>([]);
	const [loadingProvinces, setLoadingProvinces] = useState(true);
	const [loadingCities, setLoadingCities] = useState(false);

	// Fetch provinces from za_postal_codes on mount
	useEffect(() => {
		let cancelled = false;
		fetchZaProvinces()
			.then((list) => {
				if (!cancelled) {
					setProvinces(list);
					if (list.length > 0) setProvince((p) => (p ? p : list[0]));
				}
			})
			.finally(() => {
				if (!cancelled) setLoadingProvinces(false);
			});
		return () => { cancelled = true; };
	}, []);

	// Fetch cities when province changes
	useEffect(() => {
		if (!province) {
			setCitiesByProvince([]);
			return;
		}
		let cancelled = false;
		setLoadingCities(true);
		setCity('');
		fetchZaCitiesByProvince(province)
			.then((list) => {
				if (!cancelled) setCitiesByProvince(list);
			})
			.finally(() => {
				if (!cancelled) setLoadingCities(false);
			});
		return () => { cancelled = true; };
	}, [province]);

	// Fetch postal codes from Supabase (GeoNames dump) when city changes
	useEffect(() => {
		if (!city || city === 'Other') {
			setPostalCodesForCity([]);
			setPostalCode('');
			setPostalCodeSearch('');
			return;
		}
		let cancelled = false;
		setPostalCode('');
		setPostalCodeSearch('');
		setLoadingPostalCodes(true);
		fetchZaPostalCodesForCity(city, 50)
			.then((codes) => {
				if (!cancelled) {
					setPostalCodesForCity(codes);
					// Auto-select first code if only one
					if (codes.length === 1) setPostalCode(codes[0]);
				}
			})
			.finally(() => {
				if (!cancelled) setLoadingPostalCodes(false);
			});
		return () => {
			cancelled = true;
		};
	}, [city]);

	const filteredPostalCodes = useMemo(() => {
		const q = postalCodeSearch.trim();
		const list = q ? postalCodesForCity.filter((c) => c.includes(q)) : postalCodesForCity;
		return list.slice(0, 50);
	}, [postalCodesForCity, postalCodeSearch]);

	// Simple client-side cooldown to avoid hammering Supabase rate limits.
	useEffect(() => {
		if (cooldownSeconds <= 0) return;
		const id = setInterval(() => {
			setCooldownSeconds((s) => (s > 0 ? s - 1 : 0));
		}, 1000);
		return () => clearInterval(id);
	}, [cooldownSeconds]);

	async function handleSignup() {
		if (isSubmittingRef.current || isLoading) {
			return;
		}
		if (cooldownSeconds > 0) {
			setError(`Too many attempts. Try again in ${cooldownSeconds}s.`, 'Rate Limited');
			return;
		}

		if (!name || !idNumber || !email || !password || !province || !city || !postalCode) {
			setError('Please fill in all fields', 'Missing Fields');
			return;
		}

		const idCheck = validateIdNumber(idNumber);
		if (!idCheck.valid) {
			setError(idCheck.message ?? 'Please enter a valid South African ID number', 'Invalid ID Number');
			return;
		}

		// Postal code must be selected from list (no manual entry) unless city is "Other"
		if (city !== 'Other') {
			if (loadingPostalCodes) {
				setError('Postal codes are still loading for your city. Please wait.', 'Loading');
				return;
			}
			if (postalCodesForCity.length === 0) {
				setError(`No postal codes found for ${city}. Please select another city.`, 'No Postal Codes');
				return;
			}
			if (!postalCodesForCity.includes(postalCode)) {
				setError('Please select your postal code from the list.', 'Invalid Postal Code');
				return;
			}
		} else {
			// "Other" city: allow manual 4-digit code only
			if (!/^\d{4}$/.test(postalCode.trim())) {
				setError('Please enter a valid 4-digit South African postal code.', 'Invalid Postal Code');
				return;
			}
		}

		const fullAddress = `${city}, ${province}, ${postalCode}`;

		const emailCheck = validateEmail(email);
		if (!emailCheck.valid) {
			setError(emailCheck.message ?? 'Please enter a valid email address', 'Invalid Email');
			return;
		}
		const pwdCheck = validatePassword(password);
		if (!pwdCheck.valid) {
			setError(pwdCheck.message ?? 'Password must be at least 8 characters', 'Weak Password');
			return;
		}
		const confirmCheck = validateConfirmPassword(password, confirmPassword);
		if (!confirmCheck.valid) {
			setError(confirmCheck.message ?? 'Passwords do not match', 'Password Mismatch');
			return;
		}

		if (!acceptedTerms) {
			setError('Please accept the Terms & Conditions', 'Terms Required');
			return;
		}

		isSubmittingRef.current = true;
		await execute(
			() => signup(name, email, password, role, fullAddress, idNumber.trim()),
			{
				onSuccess: () => {
					// Email confirmation not required (e.g. dev mode) - sign in and navigate
					const navigate = () => {
						if (role === 'SMME') {
							router.replace('/(tabs)');
							setTimeout(() => router.push('/(tabs)/profile'), 300);
						} else {
							router.replace('/(tabs)/messages');
						}
					};
					setTimeout(navigate, 0);
				},
				onError: (err: any) => {
					const message = err?.message ?? '';
					// Email confirmation required: redirect to login with success message
					if (message.includes('EMAIL_CONFIRMATION_REQUIRED')) {
						clearError();
						router.replace({
							pathname: '/(auth)',
							params: { signupSuccess: '1', email: email.trim().toLowerCase() },
						});
						return;
					}
					if (/too many|rate limit|over_email_send_rate_limit/i.test(message)) {
						setCooldownSeconds(60);
					}
				},
			}
		);
		isSubmittingRef.current = false;
	}

	return (
		<View className="flex-1 bg-background">
			<View className="absolute inset-0 z-0">
				<LinearGradient
					colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
					className="absolute top-0 left-0 right-0 h-2/5"
					start={{ x: 0.5, y: 0 }}
					end={{ x: 0.5, y: 1 }}
				/>
				<Stars />
			</View>
			<SafeAreaView className="flex-1 z-10 relative" edges={['top', 'bottom', 'left', 'right']}>
				{/* Fixed above scroll so "Register" / subtitle never sit under the white form card (z-20 > scroll z-0) */}
				<View className="px-6 pt-1 pb-3 rounded-3xl z-20">
					<TouchableOpacity
						className="flex-row items-center self-start mt-1 py-2 pr-3 pl-0 active:opacity-80"
						onPress={() => router.back()}
						accessibilityRole="button"
						accessibilityLabel="Go back"
					>
						<Ionicons name="chevron-back" size={24} color={colors.white} />
						<Text className="text-white text-sm ml-0.5">Back</Text>
					</TouchableOpacity>
					<View className="items-center mt-1">
						<Image
							source={require('../../../assets/logos/blue text-idz logo.png')}
							className="w-60 h-[100px]"
							resizeMode="contain"
						/>
						<Text className="text-white text-3xl font-bold mt-3 mb-1">Register</Text>
						<Text className="text-white/80 text-base mb-1">Create a new account</Text>
					</View>
				</View>

				<ScreenKeyboardAwareScrollView
					contentContainerClassName="flex-grow rounded-3xl"
					className="flex-1 z-0"
					insetTop={false}
					insetBottom={false}
				>
					<View className="w-full px-6 pt-5 pb-8 rounded-3xl mt-2 bg-background flex flex-col">
					{/* Full Name Input */}
					<View className="flex-row items-center bg-input rounded-full mb-4 px-4 h-14 border border-border overflow-hidden">
						<View className="mr-3">
							<Ionicons name="person-outline" size={20} color={colors.accent} />
						</View>
						<TextInput
							className="flex-1 min-h-0 py-0 text-base text-foreground"
							value={name}
							onChangeText={setName}
							placeholder="Full Name"
							placeholderTextColor={colors.placeholder}
							autoCapitalize="words"
							autoComplete="name"
						/>
					</View>

					{/* ID Number Input */}
					<View className="flex-row items-center bg-input rounded-full mb-4 px-4 h-14 border border-border overflow-hidden">
						<View className="mr-3">
							<Ionicons name="card-outline" size={20} color={colors.accent} />
						</View>
						<TextInput
							className="flex-1 min-h-0 py-0 text-base text-foreground"
							value={idNumber}
							onChangeText={(t) => setIdNumber(t.replace(/\D/g, '').slice(0, 13))}
							placeholder="ID number (13 digits)"
							placeholderTextColor={colors.placeholder}
							keyboardType="number-pad"
							maxLength={13}
							autoComplete="off"
						/>
					</View>

					{/* Email Input */}
					<View className="flex-row items-center bg-input rounded-full mb-4 px-4 h-14 border border-border overflow-hidden">
						<View className="mr-3">
							<Ionicons name="mail-outline" size={20} color={colors.accent} />
						</View>
						<TextInput
							className="flex-1 min-h-0 py-0 text-base text-foreground"
							value={email}
							onChangeText={setEmail}
							placeholder="Email address"
							placeholderTextColor={colors.placeholder}
							keyboardType="email-address"
							autoCapitalize="none"
							autoComplete="email"
						/>
					</View>

					{/* Province selector (modal list, same on iOS & Android) */}
					<View className="flex-row items-center bg-input rounded-full mb-4 pl-4 h-14 border border-border overflow-hidden">
						<View className="mr-3">
							<Ionicons name="map-outline" size={20} color={colors.accent} />
						</View>
						<Pressable
							className="flex-1 min-h-0 ml-1 flex-row items-center justify-between py-2"
							onPress={() => setProvinceModalVisible(true)}
						>
							<Text className={province ? 'text-base text-foreground' : 'text-base text-muted-foreground'}>
								{province || 'Select province'}
							</Text>
							<Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
						</Pressable>
						<Modal
							visible={provinceModalVisible}
							animationType="slide"
							transparent
							onRequestClose={() => setProvinceModalVisible(false)}
						>
							<Pressable className="flex-1 bg-black/50 justify-end" onPress={() => setProvinceModalVisible(false)}>
								<Pressable className="bg-card border-t border-border rounded-t-2xl max-h-[70%]" onPress={(e) => e.stopPropagation()}>
									<View className="p-4 border-b border-border">
										<Text className="text-lg font-semibold text-foreground">Select province</Text>
									</View>
									<FlatList
										keyboardShouldPersistTaps="handled"
										data={provinces}
										keyExtractor={(item) => item}
										className="max-h-[280px]"
										ListEmptyComponent={
											loadingProvinces ? (
												<View className="py-8 items-center">
													<ActivityIndicator size="small" color={colors.primary} />
													<Text className="text-muted-foreground mt-2">Loading provinces…</Text>
												</View>
											) : (
												<Text className="text-muted-foreground text-center py-8">No provinces. Ensure za_postal_codes is loaded.</Text>
											)
										}
										renderItem={({ item }) => (
											<Pressable
												className="px-4 py-3 active:bg-muted"
												onPress={() => {
													setProvince(item);
													setCity('');
													setProvinceModalVisible(false);
												}}
											>
												<Text className="text-foreground text-base">{item}</Text>
											</Pressable>
										)}
									/>
								</Pressable>
							</Pressable>
						</Modal>
					</View>

					{/* City selector (modal list, same on iOS & Android) */}
					<View className="flex-row items-center bg-input rounded-full mb-4 pl-4 h-14 border border-border overflow-hidden">
						<View className="mr-3">
							<Ionicons name="business-outline" size={20} color={colors.accent} />
						</View>
						<Pressable
							className="flex-1 min-h-0 ml-1 flex-row items-center justify-between py-2"
							onPress={() => province && setCityModalVisible(true)}
							disabled={!province}
						>
							<Text className={city ? 'text-base text-foreground' : 'text-base text-muted-foreground'}>
								{city || (province ? 'Select city' : 'Select province first')}
							</Text>
							<Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
						</Pressable>
						<Modal
							visible={cityModalVisible}
							animationType="slide"
							transparent
							onRequestClose={() => setCityModalVisible(false)}
						>
							<Pressable className="flex-1 bg-black/50 justify-end" onPress={() => setCityModalVisible(false)}>
								<Pressable className="bg-card border-t border-border rounded-t-2xl max-h-[70%]" onPress={(e) => e.stopPropagation()}>
									<View className="p-4 border-b border-border">
										<Text className="text-lg font-semibold text-foreground">Select city</Text>
									</View>
									<FlatList
										keyboardShouldPersistTaps="handled"
										data={citiesByProvince}
										keyExtractor={(item) => item}
										className="max-h-[280px]"
										ListEmptyComponent={
											loadingCities ? (
												<View className="py-8 items-center">
													<ActivityIndicator size="small" color={colors.primary} />
													<Text className="text-muted-foreground mt-2">Loading cities…</Text>
												</View>
											) : (
												<Text className="text-muted-foreground text-center py-8">No cities for this province.</Text>
											)
										}
										renderItem={({ item }) => (
											<Pressable
												className="px-4 py-3 active:bg-muted"
												onPress={() => {
													setCity(item);
													setCityModalVisible(false);
												}}
											>
												<Text className="text-foreground text-base">{item}</Text>
											</Pressable>
										)}
									/>
								</Pressable>
							</Pressable>
						</Modal>
					</View>

					{/* Postal Code: Picker from API (no manual entry) or manual only for "Other" */}
					<View className="flex-row items-center bg-input rounded-full mb-4 px-4 h-14 border border-border overflow-hidden">
						<View className="mr-3">
							<Ionicons name="location-outline" size={20} color={colors.accent} />
						</View>
						{!city ? (
							<View className="flex-1 flex-row items-center min-h-0">
								<Text className="text-muted-foreground text-base">Select city first</Text>
							</View>
						) : city === 'Other' ? (
							<TextInput
								className="flex-1 min-h-0 py-0 text-base text-foreground"
								value={postalCode}
								onChangeText={(t) => setPostalCode(t.replace(/\D/g, '').slice(0, 4))}
								placeholder="4-digit postal code"
								placeholderTextColor={colors.placeholder}
								keyboardType="number-pad"
								maxLength={4}
							/>
						) : loadingPostalCodes ? (
							<View className="flex-1 flex-row items-center min-h-0">
								<View className="mr-2">
									<ActivityIndicator size="small" color={colors.accent} />
								</View>
								<Text className="text-muted-foreground text-base">Loading postal codes for {city}…</Text>
							</View>
						) : postalCodesForCity.length === 0 ? (
							<View className="flex-1 min-h-0">
								<Text className="text-muted-foreground text-base">No postal codes for {city}. Pick another city.</Text>
							</View>
						) : (
							<View className="flex-1 min-h-0 ml-1">
								<Pressable
									onPress={() => setPostalCodeModalVisible(true)}
									className="flex-row items-center justify-between py-2"
								>
									<Text className={postalCode ? 'text-base text-foreground' : 'text-base text-muted-foreground'}>
										{postalCode || 'Select postal code'}
									</Text>
									<Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
								</Pressable>
								<Modal
									visible={postalCodeModalVisible}
									animationType="slide"
									transparent
									onRequestClose={() => {
										setPostalCodeModalVisible(false);
										setPostalCodeSearch('');
									}}
								>
									<Pressable
										className="flex-1 bg-black/50 justify-end"
										onPress={() => {
											setPostalCodeModalVisible(false);
											setPostalCodeSearch('');
										}}
									>
										<KeyboardAvoidingView
											behavior={Platform.OS === 'ios' ? 'padding' : undefined}
											className="w-full"
										>
											<Pressable
												className="bg-card border-t border-border rounded-2xl max-h-[70%]"
												onPress={(e) => e.stopPropagation()}
											>
												<View className="p-4 border-b border-border">
													<Text className="text-lg font-semibold text-foreground mb-3">Select postal code</Text>
													<View className="flex-row items-center bg-input border border-border rounded-lg px-3 h-11 overflow-hidden">
														<View className="mr-2">
															<Ionicons name="search-outline" size={18} color={colors.textSecondary} />
														</View>
														<TextInput
															className="flex-1 min-h-0 py-0 text-base text-foreground"
															value={postalCodeSearch}
															onChangeText={setPostalCodeSearch}
															placeholder="Search postal code"
															placeholderTextColor={colors.placeholder}
															keyboardType="number-pad"
															autoFocus
														/>
													</View>
												</View>
												<FlatList
													keyboardShouldPersistTaps="handled"
													data={filteredPostalCodes}
													keyExtractor={(item) => item}
													className="max-h-[280px]"
													ListEmptyComponent={
														<View className="py-6 px-4">
															<Text className="text-center text-muted-foreground">No matches</Text>
														</View>
													}
													renderItem={({ item }) => (
														<Pressable
															className="px-4 py-3 active:bg-muted"
															onPress={() => {
																setPostalCode(item);
																setPostalCodeModalVisible(false);
																setPostalCodeSearch('');
															}}
														>
															<Text className="text-foreground text-base">{item}</Text>
														</Pressable>
													)}
												/>
											</Pressable>
										</KeyboardAvoidingView>
									</Pressable>
								</Modal>
							</View>
						)}
					</View>

					<PasswordField
						value={password}
						onChangeText={setPassword}
						placeholder="Password"
						accentColor={colors.accent}
						placeholderColor={colors.placeholder}
						autoComplete="password-new"
						containerClassName="flex-row items-center bg-input rounded-full mb-4 px-4 h-14 border border-border overflow-hidden"
					/>
					<PasswordField
						value={confirmPassword}
						onChangeText={setConfirmPassword}
						placeholder="Confirm Password"
						accentColor={colors.accent}
						placeholderColor={colors.placeholder}
						autoComplete="password-new"
						containerClassName="flex-row items-center bg-input rounded-full mb-4 px-4 h-14 border border-border overflow-hidden"
					/>

					{/* Role selector (modal list, same on iOS & Android) */}
					<View className="flex-row items-center bg-input rounded-full mb-4 pl-4 h-14 border border-border overflow-hidden">
						<View className="mr-3">
							<Ionicons name="briefcase-outline" size={20} color={colors.accent} />
						</View>
						<Pressable
							className="flex-1 min-h-0 ml-1 flex-row items-center justify-between py-2"
							onPress={() => setRoleModalVisible(true)}
						>
							<Text className="text-base text-foreground">{role}</Text>
							<Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
						</Pressable>
						<Modal
							visible={roleModalVisible}
							animationType="slide"
							transparent
							onRequestClose={() => setRoleModalVisible(false)}
						>
							<Pressable className="flex-1 bg-black/50 justify-end" onPress={() => setRoleModalVisible(false)}>
								<Pressable className="bg-card border-t border-border rounded-t-2xl max-h-[70%]" onPress={(e) => e.stopPropagation()}>
									<View className="p-4 border-b border-border">
										<Text className="text-lg font-semibold text-foreground">Select role</Text>
									</View>
									<FlatList
										keyboardShouldPersistTaps="handled"
										data={ROLES}
										keyExtractor={(item) => item}
										className="max-h-[280px]"
										renderItem={({ item }) => (
											<Pressable
												className="px-4 py-3 active:bg-muted"
												onPress={() => {
													setRole(item);
													setRoleModalVisible(false);
												}}
											>
												<Text className="text-foreground text-base">{item}</Text>
											</Pressable>
										)}
									/>
								</Pressable>
							</Pressable>
						</Modal>
					</View>

					{/* Terms & Conditions */}
					<TermsAndPrivacyNotice
						accepted={acceptedTerms}
						onToggle={() => setAcceptedTerms(!acceptedTerms)}
						context="signup"
					/>

					{error && (
						<View className="mb-4 rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3">
							<Text className="text-destructive text-sm">{error}</Text>
						</View>
					)}

					<Text className="text-muted-foreground text-xs text-center mb-4">
						After signing up, check your email to confirm your account before signing in.
					</Text>

					{/* Sign Up Button */}
					<Button
						className="h-14 rounded-full bg-accent justify-center items-center mb-6 active:opacity-80 active:scale-95"
						onPress={handleSignup}
						disabled={isLoading || cooldownSeconds > 0}
					>
						<Text className="text-lg h-10 min-h-8 font-semibold text-white">
							{isLoading ? 'Creating Account...' : cooldownSeconds > 0 ? `Try again in ${cooldownSeconds}s` : 'Sign Up'}
						</Text>
					</Button>

					{/* Divider */}
					<View className="flex-row items-center my-6">
						<View className="flex-1 h-px bg-border" />
						<Text className="text-muted-foreground mx-4 text-sm font-medium">
							Or continue with
						</Text>
						<View className="flex-1 h-px bg-border" />
					</View>

					{/* Google Sign In Button */}
					<Pressable
						className={`h-14 rounded-full bg-card border-2 border-border flex-row items-center justify-center active:opacity-80 active:scale-95 ${Platform.OS === 'ios' ? 'mb-4' : 'mb-6'}`}
						onPress={async () => {
							if (!acceptedTerms) {
								setError('Please accept the Terms & Conditions before continuing.', 'Terms Required');
								return;
							}
							await execute(() => signInWithGoogle(), {
								onSuccess: () => {
									clearError();
									router.replace('/(tabs)');
								},
								onError: (err) => {
									setError(err?.message || 'Failed to sign in with Google', 'Error');
								},
							});
						}}
						disabled={isLoading}
					>
						<Image
							source={require('../../../assets/logos/search.png')}
							className="w-[22px] h-[22px] mr-3"
							resizeMode="contain"
						/>
						<Text className="text-base font-semibold text-foreground">
							{isLoading ? 'Signing in...' : 'Continue with Google'}
						</Text>
					</Pressable>

					{Platform.OS === 'ios' && (
						<Pressable
							className="h-14 rounded-full bg-card border-2 border-border flex-row items-center justify-center mb-6 active:opacity-80 active:scale-95"
							onPress={async () => {
								if (!acceptedTerms) {
									setError('Please accept the Terms & Conditions before continuing.', 'Terms Required');
									return;
								}
								await execute(() => signInWithApple(), {
									onSuccess: () => {
										clearError();
										router.replace('/(tabs)');
									},
									onError: (err) => {
										setError(err?.message || 'Failed to sign in with Apple', 'Error');
									},
								});
							}}
							disabled={isLoading}
						>
							<Image
								source={require('../../../assets/logos/apple-logo.png')}
								className="w-[22px] h-[22px] mr-3"
								resizeMode="contain"
							/>
							<Text className="text-base font-semibold text-foreground">
								{isLoading ? 'Signing in...' : 'Continue with Apple'}
							</Text>
						</Pressable>
					)}

					{/* Login Link */}
					<View className="flex-row justify-center items-center">
						<Text className="text-sm text-muted-foreground">Already have an account? </Text>
						<Pressable onPress={() => router.push('/(auth)')}>
							<Text className="text-sm font-semibold text-accent underline">Log In</Text>
						</Pressable>
					</View>
					</View>
				</ScreenKeyboardAwareScrollView>
			</SafeAreaView>

			{/* ErrorAlert removed - all errors shown inline below form fields */}
		</View>
	);
}
