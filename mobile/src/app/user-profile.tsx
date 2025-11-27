import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenScrollView } from '../components/ScreenScrollView';
import { useTheme } from '../hooks/useTheme';
import { useAuthContext } from '../hooks/use-auth-context';
import { Spacing, BorderRadius, Typography, Shadow } from '../constants/theme';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { withAuthGuard } from '@/components/withAuthGuard';
import { supabase } from '@/lib/supabase';
import { connectionService } from '@/services/connection.service';
import { Profile } from '@/types';




function UserProfileScreen() {
	const { colors } = useTheme();
	const { profile: currentUser } = useAuthContext();
	const params = useLocalSearchParams<{ id?: string; userId?: string; name?: string }>();

	const [profileUser, setProfileUser] = useState<Profile | null>(null);
	const [connectionStatus, setConnectionStatus] = useState<'connected' | 'pending_sent' | 'pending_received' | 'available' | null>(null);
	const [loading, setLoading] = useState(true);
	const [connectionId, setConnectionId] = useState<string | null>(null);

	// Handle both 'id' and 'userId' params
	const userId = params?.id || params?.userId;

	const isOwnProfile = currentUser?.id === userId;

	useEffect(() => {
		console.log('useEffect triggered, userId:', userId, 'currentUser:', currentUser);
		if (!userId) {
			console.log('No userId provided, setting loading to false');
			setLoading(false);
			return;
		}

		// Continue with profile fetch even if not logged in

		const fetchUserData = async () => {
			try {
				setLoading(true);
				console.log('Starting to fetch user data for:', userId);

				// Fetch user profile
				const { data: userData, error: userError } = await supabase
					.from('profiles')
					.select('*')
					.eq('id', userId)
					.single();

				if (userError) {
					console.error('Error fetching user:', userError);
					return;
				}

				setProfileUser(userData);

				// If it's the current user's profile or no user is logged in, skip connection check
				if (isOwnProfile || !currentUser) {
					setConnectionStatus(null);
					setLoading(false);
					return;
				}

				// Check connection status - first try direct database query for accuracy
				console.log('Checking connection status for userId:', userId, 'currentUserId:', currentUser.id);
				try {
					// Direct query to check connection status
					const { data: directConnection, error: directError } = await supabase
						.from('connections')
						.select('*')
						.or(`and(requester_id.eq.${currentUser.id},addressee_id.eq.${userId}),and(requester_id.eq.${userId},addressee_id.eq.${currentUser.id})`)
						.maybeSingle();

					if (directConnection) {
						console.log('Direct connection found:', directConnection);
						if (directConnection.status === 'accepted') {
							setConnectionStatus('connected');
							setConnectionId(directConnection.id);
						} else if (directConnection.status === 'pending') {
							if (directConnection.requester_id === currentUser.id) {
								setConnectionStatus('pending_sent');
							} else {
								setConnectionStatus('pending_received');
							}
							setConnectionId(directConnection.id);
						} else {
							setConnectionStatus('available');
						}
					} else {
						// Fallback to getAllContacts if direct query doesn't find it
						console.log('No direct connection found, checking getAllContacts');
						const contacts = await connectionService.getAllContacts(currentUser.id);
						console.log('Found contacts:', contacts.length, 'contacts');
						const contact = contacts.find(c => c.id === userId);
						console.log('Contact found in getAllContacts:', contact);

						if (contact) {
							console.log('Setting connection status from getAllContacts:', contact.connectionStatus);
							setConnectionStatus(contact.connectionStatus);
							setConnectionId(contact.connectionId || null);
						} else {
							console.log('No contact found, setting status to available');
							setConnectionStatus('available');
						}
					}
				} catch (error) {
					console.error('Error fetching connection status:', error);
					// If connection service fails, assume available for connection
					setConnectionStatus('available');
				}

			} catch (error) {
				console.error('Error fetching user data:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchUserData();
	}, [userId, currentUser?.id, isOwnProfile]);

	const getAvatarSource = (avatar?: string) => {
		switch (avatar) {
			case 'blue': return require('../../assets/avatars/avatar-blue.png');
			case 'green': return require('../../assets/avatars/avatar-green.png');
			case 'orange': return require('../../assets/avatars/avatar-orange.png');
			default: return require('../../assets/avatars/avatar-blue.png');
		}
	};

	const handleMessage = () => {
		if (!profileUser) {
			console.error('Cannot message: user data is missing');
			return;
		}
		router.push({ pathname: '/message', params: { userId: profileUser.id, userName: profileUser.name } });
	};

	const handleConnect = async () => {
		if (!profileUser || !currentUser) {
			console.error('Cannot connect: user data is missing');
			return;
		}

		try {
			await connectionService.sendConnectionRequest(currentUser.id, profileUser.id);
			Alert.alert('Success', `Connection request sent to ${profileUser.name}!`);
			setConnectionStatus('pending_sent');
		} catch (error: any) {
			console.error('Error sending connection request:', error);
			Alert.alert('Error', error.message || 'Failed to send connection request.');
		}
	};

	const handleAcceptConnection = async () => {
		if (!connectionId) {
			console.error('Cannot accept connection: connection ID is missing');
			return;
		}

		try {
			await connectionService.acceptConnectionRequest(connectionId);
			Alert.alert('Success', `You are now connected with ${profileUser?.name}!`);
			setConnectionStatus('connected');
		} catch (error: any) {
			console.error('Error accepting connection:', error);
			Alert.alert('Error', error.message || 'Failed to accept connection request.');
		}
	};

	const handleDeclineConnection = async () => {
		if (!connectionId) {
			console.error('Cannot decline connection: connection ID is missing');
			return;
		}

		try {
			await connectionService.declineConnectionRequest(connectionId);
			Alert.alert('Request Declined', `Connection request from ${profileUser?.name} has been declined.`);
			setConnectionStatus('available');
			setConnectionId(null);
		} catch (error: any) {
			console.error('Error declining connection:', error);
			Alert.alert('Error', error.message || 'Failed to decline connection request.');
		}
	};

	const handleCancelConnection = async () => {
		if (!connectionId) {
			console.error('Cannot cancel connection: connection ID is missing');
			return;
		}

		Alert.alert(
			'Cancel Connection Request',
			`Are you sure you want to cancel the connection request to ${profileUser?.name}?`,
			[
				{
					text: 'No',
					style: 'cancel',
				},
				{
					text: 'Yes, Cancel',
					style: 'destructive',
					onPress: async () => {
						try {
							await connectionService.cancelConnectionRequest(connectionId);
							Alert.alert('Request Cancelled', `Connection request to ${profileUser?.name} has been cancelled.`);
							setConnectionStatus('available');
							setConnectionId(null);
						} catch (error: any) {
							console.error('Error cancelling connection:', error);
							Alert.alert('Error', error.message || 'Failed to cancel connection request.');
						}
					},
				},
			]
		);
	};

	if (loading) {
		return (
			<ScreenScrollView>
				<View style={[styles.headerCard, { backgroundColor: colors.primary }]}>
					<View style={[styles.avatar, { backgroundColor: '#FFFFFF20' }]} />
					<View style={{ width: 200, height: 24, backgroundColor: '#FFFFFF20', borderRadius: 4, marginTop: Spacing.lg }} />
					<View style={{ width: 150, height: 16, backgroundColor: '#FFFFFF15', borderRadius: 4, marginTop: Spacing.xs }} />
					<View style={{ width: 120, height: 14, backgroundColor: '#FFFFFF10', borderRadius: 4, marginTop: Spacing.xs }} />
				</View>
			</ScreenScrollView>
		);
	}

	if (!profileUser) {
		return (
			<ScreenScrollView>
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl }}>
					<Feather name="user-x" size={48} color={colors.textSecondary} />
					<Text style={[Typography.h3, { color: colors.text, marginTop: Spacing.lg, marginBottom: Spacing.md }]}>
						User Not Found
					</Text>
					<Text style={[Typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>
						The user you're looking for doesn't exist or has been removed.
					</Text>
				</View>
			</ScreenScrollView>
		);
	}

	return (
		<ScreenScrollView>
			<View style={[styles.headerCard, { backgroundColor: colors.primary }]}>
				<Image source={getAvatarSource(profileUser.avatar)} style={styles.avatar} contentFit="cover" />
				<Text style={[Typography.h2, { color: '#FFFFFF', marginTop: Spacing.lg }]}>
					{profileUser.name}
				</Text>
				<Text style={[Typography.body, { color: '#FFFFFF', opacity: 0.9, marginTop: Spacing.xs }]}>
					{profileUser.role}
				</Text>
				<Text style={[Typography.caption, { color: '#FFFFFF', opacity: 0.8, marginTop: Spacing.xs }]}>
					{profileUser.organization || 'No organization'}
				</Text>
			</View>

			{!isOwnProfile && currentUser && (
				<View style={styles.actionButtons}>
					{connectionStatus === 'connected' ? (
						<Pressable
							style={({ pressed }) => [
								styles.actionButton,
								{ backgroundColor: colors.primary, opacity: pressed ? 0.7 : 1 },
							]}
							onPress={handleMessage}
						>
							<Feather name="message-circle" size={20} color="#FFFFFF" />
							<Text style={[Typography.body, { color: '#FFFFFF', marginLeft: Spacing.md, fontWeight: '600' }]}>
								Message
							</Text>
						</Pressable>
					) : connectionStatus === 'pending_received' ? (
						<>
							<Pressable
								style={({ pressed }) => [
									styles.actionButton,
									{ backgroundColor: colors.success, opacity: pressed ? 0.7 : 1 },
								]}
								onPress={handleAcceptConnection}
							>
								<Feather name="check" size={20} color="#FFFFFF" />
								<Text style={[Typography.body, { color: '#FFFFFF', marginLeft: Spacing.md, fontWeight: '600' }]}>
									Accept Request
								</Text>
							</Pressable>
							<Pressable
								style={({ pressed }) => [
									styles.actionButton,
									{ backgroundColor: '#dc3545', opacity: pressed ? 0.7 : 1 },
								]}
								onPress={handleDeclineConnection}
							>
								<Feather name="x" size={20} color="#FFFFFF" />
								<Text style={[Typography.body, { color: '#FFFFFF', marginLeft: Spacing.md, fontWeight: '600' }]}>
									Decline Request
								</Text>
							</Pressable>
						</>
					) : connectionStatus === 'pending_sent' ? (
						<>
							<Pressable
								style={({ pressed }) => [
									styles.actionButton,
									{ backgroundColor: '#6c757d', opacity: pressed ? 0.7 : 1 },
								]}
								disabled
							>
								<Feather name="clock" size={20} color="#FFFFFF" />
								<Text style={[Typography.body, { color: '#FFFFFF', marginLeft: Spacing.md, fontWeight: '600' }]}>
									Request Sent
								</Text>
							</Pressable>
							<Pressable
								style={({ pressed }) => [
									styles.actionButton,
									{ backgroundColor: '#dc3545', opacity: pressed ? 0.7 : 1 },
								]}
								onPress={handleCancelConnection}
							>
								<Feather name="x-circle" size={20} color="#FFFFFF" />
								<Text style={[Typography.body, { color: '#FFFFFF', marginLeft: Spacing.md, fontWeight: '600' }]}>
									Cancel Request
								</Text>
							</Pressable>
						</>
					) : (
						<Pressable
							style={({ pressed }) => [
								styles.actionButton,
								{ backgroundColor: colors.accent || '#FF6600', opacity: pressed ? 0.8 : 1 },
								styles.connectButton,
							]}
							onPress={handleConnect}
						>
							<Feather name="user-plus" size={22} color="#FFFFFF" />
							<Text style={[Typography.body, { color: '#FFFFFF', marginLeft: Spacing.md, fontWeight: '700', fontSize: 16 }]}>
								Connect
							</Text>
						</Pressable>
					)}
				</View>
			)}

			{profileUser.bio && (
				<View style={[styles.card, { backgroundColor: colors.backgroundDefault, ...Shadow.card }]}>
					<Text style={[Typography.h3, { marginBottom: Spacing.md }]}>About</Text>
					<Text style={[Typography.body, { color: colors.text, lineHeight: 24 }]}>
						{profileUser.bio}
					</Text>
				</View>
			)}

			<View style={[styles.card, { backgroundColor: colors.backgroundDefault, ...Shadow.card }]}>
				<Text style={[Typography.h3, { marginBottom: Spacing.md }]}>Contact Information</Text>
				<View style={styles.infoRow}>
					<Feather name="mail" size={18} color={colors.textSecondary} />
					<Text style={[Typography.body, { color: colors.primary, marginLeft: Spacing.md }]}>
						{profileUser.email}
					</Text>
				</View>
				{profileUser.address && (
					<View style={[styles.infoRow, { marginTop: Spacing.md }]}>
						<Feather name="map-pin" size={18} color={colors.textSecondary} />
						<Text style={[Typography.body, { color: colors.text, marginLeft: Spacing.md }]}>
							{profileUser.address}
						</Text>
					</View>
				)}
			</View>

			{connectionStatus === 'connected' && (
				<View style={[styles.card, { backgroundColor: colors.backgroundDefault, ...Shadow.card }]}>
					<Text style={[Typography.h3, { marginBottom: Spacing.md }]}>Connection Status</Text>
					<View style={styles.connectionStatus}>
						<Feather name="check-circle" size={20} color={colors.success} />
						<Text style={[Typography.body, { color: colors.text, marginLeft: Spacing.md }]}>
							Connected
						</Text>
					</View>
				</View>
			)}
		</ScreenScrollView>
	);
}

const styles = StyleSheet.create({
	headerCard: {
		padding: Spacing.xl,
		borderRadius: BorderRadius.card,
		marginBottom: Spacing.lg,
		alignItems: 'center',
	},
	avatar: {
		width: 100,
		height: 100,
		borderRadius: 50,
		borderWidth: 4,
		borderColor: '#FFFFFF',
	},
	actionButtons: {
		marginBottom: Spacing.lg,
	},
	actionButton: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		height: Spacing.buttonHeight,
		borderRadius: BorderRadius.button,
		marginBottom: Spacing.md,
	},
	connectButton: {
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	card: {
		padding: Spacing.lg,
		borderRadius: BorderRadius.card,
		marginBottom: Spacing.lg,
	},
	infoRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	expertiseContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginTop: Spacing.sm,
	},
	expertiseTag: {
		paddingHorizontal: Spacing.md,
		paddingVertical: Spacing.xs,
		borderRadius: BorderRadius.button,
		marginRight: Spacing.sm,
		marginBottom: Spacing.sm,
	},
	connectionStatus: {
		flexDirection: 'row',
		alignItems: 'center',
	},
});

export default withAuthGuard(UserProfileScreen);

