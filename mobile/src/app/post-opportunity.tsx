import React, { useState } from 'react';
import { View, TextInput, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenKeyboardAwareScrollView } from '@/components/ScreenKeyboardAwareScrollView';
import { Picker } from '@react-native-picker/picker';
import { withAuthGuard } from '@/components/withAuthGuard';

function PostOpportunityScreen() {
	const [type, setType] = useState('Funding');
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [deadline, setDeadline] = useState('');

	function handlePost() {
		if (!title || !description) {
			Alert.alert('Error', 'Please fill in all required fields');
			return;
		}

		Alert.alert('Success', 'Opportunity posted successfully!', [
			{ text: 'OK', onPress: () => router.back() },
		]);
	}

	return (
		<ScreenKeyboardAwareScrollView className="flex-grow">
			<Text className="text-sm mb-2">Opportunity Type</Text>
			<View className="border border-border rounded-lg overflow-hidden bg-background">
				<Picker
					selectedValue={type}
					onValueChange={(value: any) => setType(value)}
					className="text-foreground"
				>
					<Picker.Item label="Funding" value="Funding" />
					<Picker.Item label="Job" value="Job" />
					<Picker.Item label="Project" value="Project" />
					<Picker.Item label="Collaboration" value="Collaboration" />
				</Picker>
			</View>

			<Text className="text-sm mb-2 mt-4">Title</Text>
			<TextInput
				className="h-12 border border-border rounded-lg px-4 text-base bg-background text-foreground"
				value={title}
				onChangeText={setTitle}
				placeholder="Enter opportunity title"
				placeholderTextColor="rgb(153, 153, 158)"
			/>

			<Text className="text-sm mb-2 mt-4">Description</Text>
			<TextInput
				className="min-h-30 border border-border rounded-lg px-4 py-3 text-base bg-background text-foreground"
				value={description}
				onChangeText={setDescription}
				placeholder="Describe the opportunity"
				placeholderTextColor="rgb(153, 153, 158)"
				multiline
				numberOfLines={6}
				textAlignVertical="top"
			/>

			<Text className="text-sm mb-2 mt-4">Deadline (optional)</Text>
			<TextInput
				className="h-12 border border-border rounded-lg px-4 text-base bg-background text-foreground"
				value={deadline}
				onChangeText={setDeadline}
				placeholder="e.g., Dec 31, 2025"
				placeholderTextColor="rgb(153, 153, 158)"
			/>

			<Pressable
				className={`h-13 rounded-lg justify-center items-center mt-8 bg-primary active:opacity-70`}
				onPress={handlePost}
			>
				<Text className="text-base text-white font-semibold">
					Post Opportunity
				</Text>
			</Pressable>
		</ScreenKeyboardAwareScrollView>
	);
}

export default withAuthGuard(PostOpportunityScreen);
