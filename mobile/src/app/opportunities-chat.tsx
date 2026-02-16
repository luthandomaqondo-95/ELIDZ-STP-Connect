import React, { useState, useEffect } from 'react';
import { View, Pressable, FlatList, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenKeyboardAwareScrollView } from '@/components/ScreenKeyboardAwareScrollView';
import { useTheme } from '@/hooks/useTheme';
import { Feather } from '@expo/vector-icons';
import { storage } from '@/utils/storage';
import { withAuthGuard } from '@/components/withAuthGuard';
import { useAuthContext } from '@/hooks/use-auth-context';
import { connectionService } from '@/services/connection.service';
import { OpportunityService } from '@/services/opportunity.service';

function OpportunitiesChatScreen() {
	const { colors } = useTheme();
	const { profile } = useAuthContext();
	const [opportunities, setOpportunities] = useState<any[]>([]);
	const [contacts, setContacts] = useState<{ id: string; name: string }[]>([]);
	const [selectedOpp, setSelectedOpp] = useState<any>(null);
	const [shareMessage, setShareMessage] = useState('');
	const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

	useEffect(() => {
		loadOpportunities();
	}, []);

	useEffect(() => {
		if (!profile?.id) {
			setContacts([]);
			return;
		}
		loadContacts(profile.id);
	}, [profile?.id]);

	const loadOpportunities = async () => {
		try {
			const opps = await OpportunityService.getOpportunities();
			setOpportunities((opps || []).slice(0, 5));
		} catch (error) {
			console.error('Error loading opportunities for sharing:', error);
			setOpportunities([]);
		}
	};

	const loadContacts = async (userId: string) => {
		try {
			const allContacts = await connectionService.getAllContacts(userId);
			const shareable = allContacts
				.filter((contact) => contact.connectionStatus === 'connected')
				.map((contact) => ({ id: contact.id, name: contact.name }));
			setContacts(shareable);
		} catch (error) {
			console.error('Error loading contacts for sharing:', error);
			setContacts([]);
		}
	};

	const handleShareOpportunity = async () => {
		if (!selectedOpp) {
			Alert.alert('Error', 'Please select an opportunity to share');
			return;
		}

		if (selectedContacts.length === 0) {
			Alert.alert('Error', 'Please select at least one contact');
			return;
		}

		try {
			const sharedItem = {
				id: Date.now().toString(),
				opportunityId: selectedOpp.id,
				opportunityTitle: selectedOpp.title,
				message: shareMessage,
				sharedWith: selectedContacts,
				timestamp: new Date().toISOString(),
			};

			const saved = await storage.getSharedOpportunities();
			await storage.setSharedOpportunities([...saved, sharedItem]);

			Alert.alert('Success', `Opportunity shared with ${selectedContacts.length} contact(s)!`, [
				{
					text: 'OK',
					onPress: () => router.back(),
				},
			]);
		} catch (error) {
			Alert.alert('Error', 'Failed to share opportunity');
		}
	};

	return (
		<ScreenKeyboardAwareScrollView>
			<View className="bg-card shadow-sm rounded-xl p-3 mb-3">
				<Text className="text-lg font-bold mb-3">
					Select Opportunity to Share
				</Text>
				<FlatList
					data={opportunities}
					scrollEnabled={false}
					renderItem={({ item }) => (
						<Pressable
							className={`flex-row items-center py-2.5 px-2.5 rounded-lg border active:opacity-70 ${selectedOpp?.id === item.id ? 'bg-primary border-primary' : 'bg-background border-border'}`}
							onPress={() => setSelectedOpp(item)}
						>
							<Feather
								name={selectedOpp?.id === item.id ? 'check-circle' : 'circle'}
								size={20}
								color={selectedOpp?.id === item.id ? '#FFFFFF' : colors.textSecondary}
							/>
							<View className="flex-1 ml-2.5">
								<Text className={`text-base font-medium ${selectedOpp?.id === item.id ? 'text-primary-foreground' : 'text-foreground'}`}>
									{item.title}
								</Text>
							</View>
						</Pressable>
					)}
					keyExtractor={(item) => item.id}
					ItemSeparatorComponent={() => <View className="h-2" />}
				/>
			</View>

			<View className="bg-card shadow-sm rounded-xl p-3 mb-3">
				<Text className="text-lg font-bold mb-3">
					Select Contacts to Share With
				</Text>
				<FlatList
					data={contacts}
					scrollEnabled={false}
					renderItem={({ item }) => (
						<Pressable
							className="flex-row items-center py-2.5 active:opacity-70"
							onPress={() => {
								if (selectedContacts.includes(item.id)) {
									setSelectedContacts(selectedContacts.filter(id => id !== item.id));
								} else {
									setSelectedContacts([...selectedContacts, item.id]);
								}
							}}
						>
							<Feather
								name={selectedContacts.includes(item.id) ? 'check-square' : 'square'}
								size={20}
								color={selectedContacts.includes(item.id) ? colors.primary : colors.textSecondary}
							/>
							<Text className="text-base ml-2.5 flex-1">
								{item.name}
							</Text>
						</Pressable>
					)}
					keyExtractor={(item) => item.id}
					ItemSeparatorComponent={() => <View className="h-2" />}
				/>
				{contacts.length === 0 && (
					<Text className="text-base text-muted-foreground">
						No connected contacts available to share with yet.
					</Text>
				)}
			</View>

			<View className="bg-card shadow-sm rounded-xl p-3 mb-3">
				<Text className="text-lg font-bold mb-3">
					Add Personal Message
				</Text>
				<TextInput
					className="border border-border rounded-lg px-2.5 py-2.5 text-sm bg-background text-foreground min-h-[100px]"
					placeholder="Add a personal message..."
					placeholderTextColor={colors.textSecondary}
					multiline
					numberOfLines={4}
					value={shareMessage}
					onChangeText={setShareMessage}
				/>
			</View>

			<Pressable
				className="flex-row items-center justify-center h-[52px] rounded-lg mb-5 bg-primary active:opacity-70"
				onPress={handleShareOpportunity}
			>
				<View className="mr-2"><Feather name="send" size={20} color="#FFFFFF" /></View>
				<Text className="text-base font-semibold text-primary-foreground">
					Share Opportunity
				</Text>
			</Pressable>
		</ScreenKeyboardAwareScrollView>
	);
}

export default withAuthGuard(OpportunitiesChatScreen);
