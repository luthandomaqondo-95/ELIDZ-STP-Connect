import React from "react";
import { Stack } from "expo-router";

export default function AuthLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				animation: "slide_from_right",
			}}
		>
			<Stack.Screen name="index"
				options={{
					title: "Sign In",
					animation: 'slide_from_right',
					animationDuration: 250,
				}}
			/>
			<Stack.Screen name="signup"
				options={{
					title: "Sign Up",
					animation: 'slide_from_right',
					animationDuration: 250,
					gestureEnabled: true,
					gestureDirection: 'horizontal',
				}}
			/>
			<Stack.Screen name="forgot-password" options={{ title: "Forgot Password" }} />
			<Stack.Screen name="reset-password" options={{ title: "Reset Password" }} />
			<Stack.Screen name="email-confirmed" options={{ title: "Email Confirmed" }} />
		</Stack>
	);
}
