import React, { useState, useEffect } from 'react';
import { View, Pressable, FlatList, Alert, TextInput } from 'react-native';
import { Text } from '@/components/ui/text';
import { ScreenScrollView } from '@/components/ScreenScrollView';
import { useTheme } from '@/hooks/useTheme';
import { Feather } from '@expo/vector-icons';
import { storage } from '@/utils/storage';
import { withAuthGuard } from '@/components/withAuthGuard';

function DocumentSaverScreen() {
	const { colors } = useTheme();
	const [documents, setDocuments] = useState<any[]>([]);
	const [showAddForm, setShowAddForm] = useState(false);
	const [docName, setDocName] = useState('');
	const [docContent, setDocContent] = useState('');

	useEffect(() => {
		loadDocuments();
	}, []);

	const loadDocuments = async () => {
		const saved = await storage.getOfflineDocuments();
		setDocuments(saved);
	};

	const handleSaveDocument = async () => {
		if (!docName.trim() || !docContent.trim()) {
			Alert.alert('Error', 'Please enter document name and content');
			return;
		}

		try {
			const newDoc = {
				id: Date.now().toString(),
				name: docName,
				content: docContent,
				savedAt: new Date().toISOString(),
				size: `${(docContent.length / 1024).toFixed(2)} KB`,
			};

			const updated = [...documents, newDoc];
			await storage.setOfflineDocuments(updated);
			setDocuments(updated);

			setDocName('');
			setDocContent('');
			setShowAddForm(false);

			Alert.alert('Success', 'Document saved offline successfully!');
		} catch (error) {
			Alert.alert('Error', 'Failed to save document');
		}
	};

	const handleDeleteDocument = async (id: string) => {
		Alert.alert('Delete Document', 'Are you sure you want to delete this document?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Delete',
				style: 'destructive',
				onPress: async () => {
					const updated = documents.filter(doc => doc.id !== id);
					await storage.setOfflineDocuments(updated);
					setDocuments(updated);
				},
			},
		]);
	};

	const renderDocument = ({ item }: any) => (
		<Pressable
			className="p-3 rounded-xl bg-card shadow-sm active:opacity-70"
			onPress={() => { }}
		>
			<View className="flex-row items-center">
				<View className="w-12 h-12 rounded-lg justify-center items-center mr-2.5 bg-primary">
					<Feather name="file-text" size={24} color={colors.buttonText} />
				</View>
				<View className="flex-1">
					<Text className="text-base font-semibold">
						{item.name}
					</Text>
					<Text className="text-sm text-muted-foreground mt-1">
						{item.size} • Saved {new Date(item.savedAt).toLocaleDateString()}
					</Text>
				</View>
				<Pressable
					onPress={() => handleDeleteDocument(item.id)}
					className="active:opacity-50"
				>
					<Feather name="trash-2" size={20} color={colors.textSecondary} />
				</Pressable>
			</View>
			<Text className="text-base text-muted-foreground mt-2.5" numberOfLines={3}>
				{item.content}
			</Text>
		</Pressable>
	);

	return (
		<ScreenScrollView>
			{!showAddForm ? (
				<>
					<Pressable
						className="flex-row items-center justify-center py-2.5 rounded-lg mb-3 bg-primary active:opacity-70"
						onPress={() => setShowAddForm(true)}
					>
						<Feather name="plus" size={20} color={colors.buttonText} />
						<Text className="text-base font-semibold text-primary-foreground ml-2.5">
							New Document
						</Text>
					</Pressable>

					<Text className="text-lg font-bold mt-5 mb-3">
						Saved Documents ({documents.length})
					</Text>

					{documents.length === 0 ? (
						<View className="p-5 rounded-xl bg-card shadow-sm items-center justify-center min-h-[200px]">
							<Feather name="inbox" size={48} color={colors.textSecondary} />
							<Text className="text-base text-muted-foreground mt-3">
								No documents saved yet
							</Text>
							<Text className="text-sm text-muted-foreground mt-2">
								Save documents for offline access
							</Text>
						</View>
					) : (
						<FlatList
							data={documents}
							renderItem={renderDocument}
							keyExtractor={(item) => item.id}
							scrollEnabled={false}
							ItemSeparatorComponent={() => <View className="h-2.5" />}
						/>
					)}
				</>
			) : (
				<View className="mb-3 bg-card shadow-sm rounded-xl p-3">
					<Text className="text-lg font-bold mb-3">
						Save Document Offline
					</Text>

					<View className="mb-3">
						<Text className="text-sm font-semibold mb-2">
							Document Name
						</Text>
						<TextInput
							className="border border-border rounded-lg px-2.5 py-2.5 text-sm bg-background text-foreground"
							placeholder="Enter document name"
							placeholderTextColor={colors.textSecondary}
							value={docName}
							onChangeText={setDocName}
						/>
					</View>

					<View className="mb-3">
						<Text className="text-sm font-semibold mb-2">
							Document Content
						</Text>
						<TextInput
							className="border border-border rounded-lg px-2.5 py-2.5 text-sm bg-background text-foreground min-h-[120px]"
							placeholder="Enter or paste your document content here"
							placeholderTextColor={colors.textSecondary}
							multiline
							numberOfLines={8}
							value={docContent}
							onChangeText={setDocContent}
						/>
					</View>

					<Pressable
						className="flex-row items-center justify-center h-[52px] rounded-lg mb-2.5 bg-primary active:opacity-70"
						onPress={handleSaveDocument}
					>
						<View className="mr-2"><Feather name="save" size={20} color={colors.buttonText} /></View>
						<Text className="text-base font-semibold text-primary-foreground">
							Save Document
						</Text>
					</Pressable>

					<Pressable
						className="h-[52px] rounded-lg justify-center items-center border border-border active:opacity-60"
						onPress={() => {
							setShowAddForm(false);
							setDocName('');
							setDocContent('');
						}}
					>
						<Text className="text-base text-foreground">
							Cancel
						</Text>
					</Pressable>
				</View>
			)}
		</ScreenScrollView>
	);
}

export default withAuthGuard(DocumentSaverScreen);
