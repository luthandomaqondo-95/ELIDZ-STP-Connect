import React from 'react';
import { View, Pressable, Image } from 'react-native';
import { Text } from '@/components/ui/text';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Button } from '@/components/ui/button';
import { COLORS } from '@/theme/colors';

export default function AuthChoiceScreen() {
	return (
		<View className="flex-1 justify-center px-6">
			{/* Logo */}
			<View className="items-center mb-12">
				<Image
					source={require('../../../assets/logos/blue text-idz logo.png')}
					style={{ width: 300, height: 130 }}
					resizeMode="contain"
				/>
				<Text className="text-primary mt-4 text-xl font-semibold">
					Science & Technology Park
				</Text>
			</View>

			{/* Welcome text */}
			<View className="items-center mb-12">
				<Text className="mb-4 text-3xl font-bold">
					Welcome
				</Text>
				<Text className="text-muted-foreground text-center leading-6 text-base">
					Join the ELIDZ-STP community to access exclusive opportunities, connect with innovators, and accelerate your growth.
				</Text>
			</View>

			{/* Action buttons */}
			<View className="gap-4">
				{/* Continue as Guest */}
				<Button
					className="bg-card border border-primary py-4 rounded-lg items-center flex-row justify-center active:opacity-70"
					onPress={() => router.replace('/(tabs)')}
				>
					<View className="mr-3">
						<Feather name="eye" size={20} color="rgb(var(--primary))" />
					</View>
					<Text className="text-primary font-semibold text-base">
						Continue as Guest
					</Text>
				</Button>

				{/* Sign Up */}
				<Button
					className="bg-primary py-4 rounded-lg items-center flex-row justify-center active:opacity-90"
					onPress={() => router.push('/(auth)/signup')}
				>
					<View className="mr-3">
						<Feather name="user-plus" size={20} color="#FFFFFF" />
					</View>
					<Text className="text-primary-foreground font-semibold text-base">
						Sign Up
					</Text>
				</Button>

        {/* Log In */}
        <Button
          variant="outline"
          className="py-4 rounded-lg items-center flex-row justify-center active:opacity-70"
          onPress={() => router.push('/(auth)/login')}
        >
          <View className="mr-3">
            <Feather name="log-in" size={20} color="rgb(var(--foreground))" />
          </View>
          <Text className="text-foreground font-semibold text-base">
            Log In
          </Text>
        </Button>
			</View>

			{/* Features preview */}
			<View className="mt-12">
				<Text className="text-foreground mb-6 text-xl font-semibold text-center">
					What you can do:
				</Text>

				<View className="gap-4">
					{[
						{ icon: 'grid', text: 'Access product lines & facilities' },
						{ icon: 'briefcase', text: 'Discover funding & business opportunities' },
						{ icon: 'users', text: 'Connect with tenants & partners' },
						{ icon: 'calendar', text: 'Register for events & workshops' },
						{ icon: 'star', text: 'Upgrade to premium for exclusive features' },
					].map((feature, index) => (
						<View key={index} className="flex-row items-center">
							<Feather name="check-circle" size={16} color={COLORS.light.primary} />
							<Text className="text-muted-foreground flex-1 text-sm ml-2">
								{feature.text}
							</Text>
						</View>
					))}
				</View>
			</View>
		</View>
	);
}
