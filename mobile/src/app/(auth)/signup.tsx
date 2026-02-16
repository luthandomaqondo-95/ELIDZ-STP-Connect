import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Pressable, Alert, Dimensions, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenKeyboardAwareScrollView } from '@/components/ScreenKeyboardAwareScrollView';
import { useAuthContext } from '@/hooks/use-auth-context';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { Stars } from '@/components/Stars';
import { Button } from '@/components/ui/button';
import { useColorScheme } from '@/hooks/use-theme-color';
import { COLORS } from '@/theme/colors';
import { fetchZaPostalCodesForCity } from '@/services/za-postal-codes.service';

const { height } = Dimensions.get('window');

export default function SignupScreen() {
	const { signup, signInWithGoogle } = useAuthContext();
	const { colorScheme } = useColorScheme();
	const colors = COLORS[colorScheme];
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [province, setProvince] = useState('Eastern Cape');
	const [city, setCity] = useState('');
	const [postalCode, setPostalCode] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [role, setRole] = useState<'Entrepreneur' | 'Researcher' | 'SMME' | 'Student' | 'Investor' | 'Tenant'>('Entrepreneur');
	const [isLoading, setIsLoading] = useState(false);
	const isSubmittingRef = useRef(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [acceptedTerms, setAcceptedTerms] = useState(false);

	const [postalCodesForCity, setPostalCodesForCity] = useState<string[]>([]);
	const [loadingPostalCodes, setLoadingPostalCodes] = useState(false);
	// Kept for backwards compatibility with cached bundles (no longer used in UI)
	const showPostalSuggestions = false;

	const provinces = [
		'Eastern Cape',
		'Free State',
		'Gauteng',
		'KwaZulu-Natal',
		'Limpopo',
		'Mpumalanga',
		'North West',
		'Northern Cape',
		'Western Cape',
	];

	// Map of major cities/towns for each province
	const citiesByProvince: Record<string, string[]> = {
		'Eastern Cape': ['East London', 'Gqeberha (Port Elizabeth)', 'Mthatha', 'Bhisho', 'Uitenhage', 'Grahamstown', 'Queenstown', 'King William\'s Town', 'Other'],
		'Free State': ['Bloemfontein', 'Welkom', 'Sasolburg', 'Parys', 'Phuthaditjhaba', 'Kroonstad', 'Other'],
		'Gauteng': ['Johannesburg', 'Pretoria', 'Soweto', 'Centurion', 'Sandton', 'Midrand', 'Roodepoort', 'Kempton Park', 'Other'],
		'KwaZulu-Natal': ['Durban', 'Pietermaritzburg', 'Richards Bay', 'Newcastle', 'Port Shepstone', 'Other'],
		'Limpopo': ['Polokwane', 'Thohoyandou', 'Tzaneen', 'Mokopane', 'Bela-Bela', 'Other'],
		'Mpumalanga': ['Mbombela (Nelspruit)', 'Witbank', 'Secunda', 'Middelburg', 'Other'],
		'North West': ['Mahikeng', 'Klerksdorp', 'Rustenburg', 'Potchefstroom', 'Brits', 'Other'],
		'Northern Cape': ['Kimberley', 'Upington', 'Springbok', 'De Aar', 'Other'],
		'Western Cape': ['Cape Town', 'Stellenbosch', 'George', 'Paarl', 'Worcester', 'Mossel Bay', 'Knysna', 'Other'],
	};

	// Fetch postal codes from Supabase (GeoNames dump) when city changes
	useEffect(() => {
		if (!city || city === 'Other') {
			setPostalCodesForCity([]);
			setPostalCode('');
			return;
		}
		let cancelled = false;
		setPostalCode('');
		setLoadingPostalCodes(true);
		fetchZaPostalCodesForCity(city, 1200)
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

	async function handleSignup() {
		if (isSubmittingRef.current || isLoading) {
			return;
		}

		if (!name || !email || !password || !province || !city || !postalCode) {
			Alert.alert('Error', 'Please fill in all fields');
			return;
		}

		// Postal code must be selected from list (no manual entry) unless city is "Other"
		if (city !== 'Other') {
			if (loadingPostalCodes) {
				Alert.alert('Please wait', 'Postal codes are still loading for your city.');
				return;
			}
			if (postalCodesForCity.length === 0) {
				Alert.alert('Postal code required', `No postal codes found for ${city}. Please select another city.`);
				return;
			}
			if (!postalCodesForCity.includes(postalCode)) {
				Alert.alert('Invalid postal code', 'Please select your postal code from the list.');
				return;
			}
		} else {
			// "Other" city: allow manual 4-digit code only
			if (!/^\d{4}$/.test(postalCode.trim())) {
				Alert.alert('Invalid postal code', 'Please enter a valid 4-digit South African postal code.');
				return;
			}
		}

		const fullAddress = `${city}, ${province}, ${postalCode}`;

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+(\.[^\s@]+)*$/;
		if (!emailRegex.test(email.trim())) {
			Alert.alert('Invalid Email', 'Please enter a valid email address');
			return;
		}

		if (password.length < 8) {
			Alert.alert('Error', 'Password must be at least 8 characters');
			return;
		}

		if (password !== confirmPassword) {
			Alert.alert('Error', 'Passwords do not match');
			return;
		}

		if (!acceptedTerms) {
			Alert.alert('Error', 'Please accept the Terms & Conditions');
			return;
		}

		isSubmittingRef.current = true;
		setIsLoading(true);
		try {
			await signup(name, email, password, role, fullAddress);
			// If we get here, email confirmation is not required or user is already confirmed

			// Show verification notice for SMME users
			if (role === 'SMME') {
				Alert.alert(
					'Welcome, SMME Partner!',
					'To access all features and appear in the Verified SMMEs directory, you need to complete business verification. This requires uploading 3 documents: Business Registration, ID Document, and Business Profile.\n\nYou can start the verification process from your profile page.',
					[
						{
							text: 'Go to Profile',
							onPress: () => {
								router.replace('/(tabs)');
								// Navigate to profile after a short delay to ensure tabs are loaded
								setTimeout(() => {
									router.push('/(tabs)/profile');
								}, 500);
							}
						},
						{
							text: 'Later',
							style: 'cancel',
							onPress: () => router.replace('/(tabs)')
						}
					]
				);
			} else {
				router.replace('/(tabs)');
			}
		} catch (error: any) {
			const errorMessage = error?.message || 'Failed to sign up. Please try again.';

			// Check if this is an email confirmation error
			if (errorMessage.includes('EMAIL_CONFIRMATION_REQUIRED')) {
				Alert.alert(
					'Account Created Successfully',
					'Please check your email to confirm your account. You will be able to log in after confirming your email address.' + (role === 'SMME' ? '\n\nNote: As an SMME, you will need to complete business verification after logging in to access all features.' : ''),
					[
						{
							text: 'OK',
							onPress: () => router.replace('/(auth)')
						}
					]
				);
			} else {
				Alert.alert('Error', errorMessage);
			}
		} finally {
			isSubmittingRef.current = false;
			setIsLoading(false);
		}
	}

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
			{/* Header Section */}
			<View className="px-4 pt-1" style={{ height: height * 0.25 }}>
				{/* Back Button */}
				<TouchableOpacity
					className="w-10 h-10 rounded-full flex-row justify-center items-center"
					style={{ marginTop: 40 }}
					onPress={() => router.back()}
				>
					<Ionicons name="chevron-back" size={24} color={colors.white} />
					<Text className="text-white text-sm">Back</Text>
				</TouchableOpacity>

				{/* Title */}
				<View className="items-center">
					<Text className="text-3xl font-bold text-white mb-2">Register</Text>
					<Text className="text-white/80 mb-4">Create a new account</Text>
					<Image
						source={require('../../../assets/logos/blue text-idz logo.png')}
						style={{ width: 300, height: 130 }}
						resizeMode="contain"
					/>
				</View>
			</View>

			<ScreenKeyboardAwareScrollView
				contentContainerClassName="flex-grow mt-4 rounded-3xl"
				style={{ zIndex: 2 }}
			>
				{/* Form Fields */}
				<View className="w-full px-6 pb-10 pt-6 rounded-3xl bg-background" style={{ marginTop: 10 }}>
					{/* Full Name Input */}
					<View className="hidden" />
					<View className="flex-row items-center bg-input rounded-full mb-4 px-4 h-14 border border-border">
						<Ionicons name="person-outline" size={20} color="#FF6600" style={{ marginRight: 12 }} />
						<TextInput
							className="flex-1 text-base text-foreground"
							value={name}
							onChangeText={setName}
							placeholder="Full Name"
							placeholderTextColor={colors.placeholder}
							autoCapitalize="words"
							autoComplete="name"
						/>
					</View>

					{/* Email Input */}
					<View className="flex-row items-center bg-input rounded-full mb-4 px-4 h-14 border border-border">
						<Ionicons name="mail-outline" size={20} color="#FF6600" style={{ marginRight: 12 }} />
						<TextInput
							className="flex-1 text-base text-foreground"
							value={email}
							onChangeText={setEmail}
							placeholder="Your mail"
							placeholderTextColor={colors.placeholder}
							keyboardType="email-address"
							autoCapitalize="none"
							autoComplete="email"
						/>
					</View>

					{/* Province Picker */}
					<View className="flex-row items-center bg-input rounded-full mb-4 pl-4 h-14 border border-border">
						<Ionicons name="map-outline" size={20} color={colors.accent} style={{ marginRight: 12 }} />
						<View className="flex-1 ml-1">
							<Picker
								selectedValue={province}
								onValueChange={(value) => {
									setProvince(value);
									setCity(''); // Reset city when province changes
								}}
								style={{ flex: 1, color: '#FF6600' }}
								dropdownIconColor="#FF6600"
							>
								{provinces.map((p) => (
									<Picker.Item key={p} label={p} value={p} color="#FF6600" />
								))}
							</Picker>
						</View>
					</View>

					{/* City Picker */}
					<View className="flex-row items-center bg-input rounded-full mb-4 pl-4 h-14 border border-border">
						<Ionicons name="business-outline" size={20} color={colors.accent} style={{ marginRight: 12 }} />
						<View className="flex-1 ml-1">
							<Picker
								selectedValue={city}
								onValueChange={(value) => setCity(value)}
								style={{ flex: 1, color: '#FF6600' }}
								dropdownIconColor="#FF6600"
							>
								<Picker.Item label="Select City" value="" color="#9CA3AF" />
								{citiesByProvince[province]?.map((c) => (
									<Picker.Item key={c} label={c} value={c} color="#FF6600" />
								))}
							</Picker>
						</View>
					</View>

					{/* Postal Code: Picker from API (no manual entry) or manual only for "Other" */}
					<View className="flex-row items-center bg-input rounded-full mb-4 px-4 h-14 border border-border">
						<Ionicons name="location-outline" size={20} color="#FF6600" style={{ marginRight: 12 }} />
						{!city ? (
							<View className="flex-1 flex-row items-center">
								<Text className="text-muted-foreground text-base">Select city first</Text>
							</View>
						) : city === 'Other' ? (
							<TextInput
								className="flex-1 text-base text-foreground"
								value={postalCode}
								onChangeText={(t) => setPostalCode(t.replace(/\D/g, '').slice(0, 4))}
								placeholder="4-digit postal code"
								placeholderTextColor={colors.placeholder}
								keyboardType="number-pad"
								maxLength={4}
							/>
						) : loadingPostalCodes ? (
							<View className="flex-1 flex-row items-center">
								<ActivityIndicator size="small" color={colors.accent} style={{ marginRight: 8 }} />
								<Text className="text-muted-foreground text-base">Loading postal codes for {city}…</Text>
							</View>
						) : postalCodesForCity.length === 0 ? (
							<View className="flex-1">
								<Text className="text-muted-foreground text-base">No postal codes for {city}. Pick another city.</Text>
							</View>
						) : (
							<View className="flex-1 ml-1">
								<Picker
									selectedValue={postalCode}
									onValueChange={(value) => setPostalCode(value)}
									style={{ flex: 1, color: '#FF6600' }}
									dropdownIconColor="#FF6600"
									prompt="Select postal code"
								>
									<Picker.Item label="Select postal code" value="" color="#9CA3AF" />
									{postalCodesForCity.map((code) => (
										<Picker.Item key={code} label={code} value={code} color="#FF6600" />
									))}
								</Picker>
							</View>
						)}
					</View>

					{/* Password Input */}
					<View className="flex-row items-center bg-input rounded-full mb-4 px-4 h-14 border border-border">
						<Ionicons name="lock-closed-outline" size={20} color="#FF6600" style={{ marginRight: 12 }} />
						<TextInput
							className="flex-1 text-base text-foreground"
							value={password}
							onChangeText={setPassword}
							placeholder="Password"
							placeholderTextColor={colors.placeholder}
							secureTextEntry={!showPassword}
							autoCapitalize="none"
							autoComplete="password-new"
						/>
						<Pressable
							className="p-1"
							onPress={() => setShowPassword(!showPassword)}
						>
							<Ionicons
								name={showPassword ? "eye-outline" : "eye-off-outline"}
								size={20}
								color={colors.accent}
							/>
						</Pressable>
					</View>

					{/* Confirm Password Input */}
					<View className="flex-row items-center bg-input rounded-full mb-4 px-4 h-14 border border-border">
						<Ionicons name="lock-closed-outline" size={20} color={colors.accent} style={{ marginRight: 12 }} />
						<TextInput
							className="flex-1 text-base text-foreground"
							value={confirmPassword}
							onChangeText={setConfirmPassword}
							placeholder="Confirm Password"
							placeholderTextColor={colors.placeholder}
							secureTextEntry={!showConfirmPassword}
							autoCapitalize="none"
							autoComplete="password-new"
						/>
						<Pressable
							className="p-1"
							onPress={() => setShowConfirmPassword(!showConfirmPassword)}
						>
							<Ionicons
								name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
								size={20}
								color="#FF6600"
							/>
						</Pressable>
					</View>

					{/* Role Picker */}
					<View className="flex-row items-center bg-input rounded-full mb-4 pl-4 h-14 border border-border">
						<Ionicons name="briefcase-outline" size={20} color={colors.accent} style={{ marginRight: 12 }} />
						<View className="flex-1 ml-1">
							<Picker
								selectedValue={role}
								onValueChange={(value) => setRole(value)}
								style={{ flex: 1, color: '#FF6600' }}
								dropdownIconColor="#FF6600"
							>
								<Picker.Item label="Entrepreneur" value="Entrepreneur" color="#FF6600" />
								<Picker.Item label="Researcher" value="Researcher" color="#FF6600" />
								<Picker.Item label="SMME" value="SMME" color="#FF6600" />
								<Picker.Item label="Student" value="Student" color="#FF6600" />
								<Picker.Item label="Investor" value="Investor" color="#FF6600" />
								<Picker.Item label="Tenant" value="Tenant" color="#FF6600" />
							</Picker>
						</View>
					</View>

					{/* Terms & Conditions */}
					<View className="flex-row items-start mb-6 pr-2">
						<Pressable
							onPress={() => setAcceptedTerms(!acceptedTerms)}
							style={{ flexDirection: 'row', alignItems: 'center' }}
						>
							<View style={{
								width: 20,
								height: 20,
								borderRadius: 4,
								borderWidth: 2,
								borderColor: acceptedTerms ? '#FF6600' : '#FF6600',
								backgroundColor: acceptedTerms ? '#FF6600' : 'transparent',
								alignItems: 'center',
								justifyContent: 'center',
								marginRight: 10
							}}>
								{acceptedTerms && <Ionicons name="checkmark" size={16} color="white" />}
							</View>
						</Pressable>
						<Text className="flex-1 text-[13px] text-muted-foreground leading-5">
							By Creating an account, you agree to our{' '}
							<Text className="text-accent font-semibold">Terms & Conditions</Text>
							{' '}and agree to{' '}
							<Text className="text-accent font-semibold">Privacy Policy</Text>
						</Text>
					</View>

					{/* Sign Up Button */}
					<Button
						className="h-14 rounded-full bg-accent justify-center items-center mb-6 active:opacity-80 active:scale-95"
						onPress={handleSignup}
						disabled={isLoading}
					>
						<Text className="text-lg font-semibold text-white">
							{isLoading ? 'Creating Account...' : 'Sign Up'}
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
						className="h-14 rounded-full bg-card border-2 border-border flex-row items-center justify-center mb-6 active:opacity-80 active:scale-95"
						onPress={async () => {
							try {
								await signInWithGoogle();
							} catch (error: any) {
								Alert.alert('Error', error?.message || 'Failed to sign in with Google');
							}
						}}
					>
						<Ionicons name="logo-google" size={20} color="#4285F4" style={{ marginRight: 12 }} />
						<Text className="text-base font-semibold text-foreground">
							Continue with Google
						</Text>
					</Pressable>

					{/* Login Link */}
					<View className="flex-row justify-center items-center">
						<Text className="text-sm text-muted-foreground">Already have an account? </Text>
						<Pressable onPress={() => router.push('/(auth)')}>
							<Text className="text-sm font-semibold text-accent underline">Log In</Text>
						</Pressable>
					</View>
				</View>
			</ScreenKeyboardAwareScrollView>
		</View>
	);
}
