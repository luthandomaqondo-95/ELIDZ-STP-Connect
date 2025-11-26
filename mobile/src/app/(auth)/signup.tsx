import React, { useState } from 'react';
import { View, TextInput, Pressable, Alert, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenKeyboardAwareScrollView } from '@/components/ScreenKeyboardAwareScrollView';
import { useAuthContext } from '@/hooks/use-auth-context';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { Checkbox } from '@/components/ui/checkbox';
import { Stars } from '@/components/Stars';
import { Button } from '@/components/ui/button';

const { width, height } = Dimensions.get('window');

export default function SignupScreen() {
	const { signup } = useAuthContext();
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [role, setRole] = useState<'Entrepreneur' | 'Researcher' | 'SME' | 'Student' | 'Investor' | 'Tenant'>('Entrepreneur');
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [acceptedTerms, setAcceptedTerms] = useState(false);

	async function handleSignup() {
		if (!name || !email || !password) {
			Alert.alert('Error', 'Please fill in all fields');
			return;
		}

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

		setIsLoading(true);
		try {
			await signup(name, email, password, role);
			router.replace('/(tabs)');
		} catch (error: any) {
			Alert.alert('Error', error?.message || 'Failed to sign up. Please try again.');
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<View className="flex-1 bg-white">
			<LinearGradient
				colors={['#0a1628', '#122a4d', '#1a3a5c']}
				className="absolute inset-0"
				style={{ height: height * 0.35 }}
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
					<Ionicons name="chevron-back" size={24} color="#fff" />
					<Text className="text-white text-sm">Back</Text>
				</TouchableOpacity>

				{/* Title */}
				<View className="items-center">
					<Text className="text-3xl font-bold text-white mb-2">Register</Text>
					<Text className="text-white/80">Create a new account</Text>
				</View>
			</View>

			<ScreenKeyboardAwareScrollView
				contentContainerClassName="flex-grow"
				style={{ zIndex: 2 }}
			>
				{/* White Card Form */}
				<View className="flex-1 bg-white w-full px-6 pb-10 -mt-16 pt-12 " style={{ borderTopLeftRadius: 50, borderTopRightRadius: 50, marginTop: -70, paddingTop: 50 }}>
					{/* Full Name Input */}
					<View className="hidden" />
					<View className="flex-row items-center bg-[#D4A03B]/10 rounded-full mb-4 px-4 h-14">
						<Ionicons name="person-outline" size={20} color="#D4A03B" style={{ marginRight: 12 }} />
						<TextInput
							className="flex-1 text-base text-[#333]"
							value={name}
							onChangeText={setName}
							placeholder="Your mail"
							placeholderTextColor="#D4A03B"
							keyboardType="email-address"
							autoCapitalize="none"
							autoComplete="email"
						/>
					</View>

					{/* Email Input */}
					<View className="flex-row items-center bg-[#D4A03B]/10 rounded-full mb-4 px-4 h-14">
						<Ionicons name="mail-outline" size={20} color="#D4A03B" style={{ marginRight: 12 }} />
						<TextInput
							className="flex-1 text-base text-[#333]"
							value={email}
							onChangeText={setEmail}
							placeholder="Your mail"
							placeholderTextColor="#D4A03B"
							keyboardType="email-address"
							autoCapitalize="none"
							autoComplete="email"
						/>
					</View>

					{/* Password Input */}
					<View className="flex-row items-center bg-[#D4A03B]/10 rounded-full mb-4 px-4 h-14">
						<Ionicons name="lock-closed-outline" size={20} color="#D4A03B" style={{ marginRight: 12 }} />
						<TextInput
							className="flex-1 text-base text-[#333]"
							value={password}
							onChangeText={setPassword}
							placeholder="Password"
							placeholderTextColor="#D4A03B"
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
								color="#D4A03B"
							/>
						</Pressable>
					</View>

					{/* Confirm Password Input */}
					<View className="flex-row items-center bg-[#D4A03B]/10 rounded-full mb-4 px-4 h-14">
						<Ionicons name="lock-closed-outline" size={20} color="#D4A03B" style={{ marginRight: 12 }} />
						<TextInput
							className="flex-1 text-base text-[#333]"
							value={confirmPassword}
							onChangeText={setConfirmPassword}
							placeholder="Confirm Password"
							placeholderTextColor="#D4A03B"
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
								color="#D4A03B"
							/>
						</Pressable>
					</View>

					{/* Role Picker */}
					<View className="flex-row items-center bg-[#D4A03B]/10 rounded-full mb-4 pl-4 h-14">
						<Ionicons name="briefcase-outline" size={20} color="#D4A03B" style={{ marginRight: 12 }} />
						<View className="flex-1 ml-1">
							<Picker
								selectedValue={role}
								onValueChange={(value) => setRole(value)}
								style={{ flex: 1, color: '#333' }}
								dropdownIconColor="#D4A03B"
							>
								<Picker.Item label="Entrepreneur" value="Entrepreneur" color="#333" />
								<Picker.Item label="Researcher" value="Researcher" color="#333" />
								<Picker.Item label="SME" value="SME" color="#333" />
								<Picker.Item label="Student" value="Student" color="#333" />
								<Picker.Item label="Investor" value="Investor" color="#333" />
								<Picker.Item label="Tenant" value="Tenant" color="#333" />
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
								borderColor: acceptedTerms ? '#D4A03B' : '#D4A03B',
								backgroundColor: acceptedTerms ? '#D4A03B' : 'transparent',
								alignItems: 'center',
								justifyContent: 'center',
								marginRight: 10
							}}>
								{acceptedTerms && <Ionicons name="checkmark" size={16} color="white" />}
							</View>
						</Pressable>
						<Text className="flex-1 text-[13px] text-[#8a8a8a] leading-5">
							By Creating an account, you agree to our{' '}
							<Text className="text-[#D4A03B] font-semibold">Terms & Conditions</Text>
							{' '}and agree to{' '}
							<Text className="text-[#D4A03B] font-semibold">Privacy Policy</Text>
						</Text>
					</View>

					{/* Sign Up Button */}
					<Button
						className="h-14 rounded-full bg-[#D4A03B] justify-center items-center mb-6 active:opacity-80 active:scale-95"
						onPress={handleSignup}
						disabled={isLoading}
					>
						<Text className="text-lg font-semibold text-white">
							{isLoading ? 'Creating Account...' : 'Sign Up'}
						</Text>
					</Button>

					{/* Login Link */}
					<View className="flex-row justify-center items-center">
						<Text className="text-sm text-[#8a8a8a]">Already have an account? </Text>
						<Pressable onPress={() => router.push('/(auth)')}>
							<Text className="text-sm font-semibold text-[#2a5298] underline">Log In</Text>
						</Pressable>
					</View>
				</View>
			</ScreenKeyboardAwareScrollView>
		</View>
	);
}
