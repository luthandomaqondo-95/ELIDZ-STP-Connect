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
			<Stack.Screen name="welcome"
				options={{
					animation: 'fade',
					animationDuration: 300,
				}}
			/>
			<Stack.Screen name="auth-choice"
				options={{
					animation: 'slide_from_right',
					animationDuration: 250,
				}}
			/>
			<Stack.Screen name="index"
				options={{
					title: "Login",
					animation: 'slide_from_right',
					animationDuration: 250,
					gestureEnabled: true,
					gestureDirection: 'horizontal',
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
			<Stack.Screen name="change-password" options={{ title: "Change Password" }} />
		</Stack>
	);
}
