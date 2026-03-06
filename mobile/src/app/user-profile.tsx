import React, { useState, useEffect } from 'react';
import { View, Pressable, Alert, Linking } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenScrollView } from '../components/ScreenScrollView';
import { useTheme } from '../hooks/useTheme';
import { useAuthContext } from '../hooks/use-auth-context';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { withAuthGuard } from '@/components/withAuthGuard';
import { supabase } from '@/lib/supabase';
import { connectionService } from '@/services/connection.service';
import { smmmeService, SMMEServiceProduct } from '@/services/smme.service';
import { Profile } from '@/types';
import { useAvatarUri } from '@/hooks/use-avatar-uri';





function UserProfileScreen() {
	const { colors } = useTheme();
	const { profile: currentUser } = useAuthContext();
	const params = useLocalSearchParams<{ id?: string; userId?: string; name?: string }>();

	const [profileUser, setProfileUser] = useState<Profile | null>(null);
	const { uri: profileUserAvatarUri } = useAvatarUri(profileUser?.avatar);
	const [connectionStatus, setConnectionStatus] = useState<'connected' | 'pending_sent' | 'pending_received' | 'available' | null>(null);
	const [loading, setLoading] = useState(true);
	const [connectionId, setConnectionId] = useState<string | null>(null);
	const [smmeServices, setSmmeServices] = useState<SMMEServiceProduct[]>([]);
	const [smmeProducts, setSmmeProducts] = useState<SMMEServiceProduct[]>([]);

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
						.or(`and(user_id.eq.${currentUser.id},connected_user_id.eq.${userId}),and(user_id.eq.${userId},connected_user_id.eq.${currentUser.id})`)
						.maybeSingle();

					if (directConnection) {
						console.log('Direct connection found:', directConnection);
						if (directConnection.status === 'accepted') {
							setConnectionStatus('connected');
							setConnectionId(directConnection.id);
						} else if (directConnection.status === 'pending') {
							if (directConnection.user_id === currentUser.id) {
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

	// Fetch SMME services and products when viewing a verified SMME profile
	useEffect(() => {
		if (!profileUser || profileUser.role !== 'SMME') {
			setSmmeServices([]);
			setSmmeProducts([]);
			return;
		}
		let cancelled = false;
		smmmeService.getServicesProductsBySMME(profileUser.id).then(({ services, products }) => {
			if (!cancelled) {
				setSmmeServices(services);
				setSmmeProducts(products);
			}
		}).catch((err) => {
			if (!cancelled) {
				setSmmeServices([]);
				setSmmeProducts([]);
			}
			console.warn('UserProfile: failed to load SMME services/products', err);
		});
		return () => { cancelled = true; };
	}, [profileUser?.id, profileUser?.role]);

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

	const handleAcceptConnection = () => {
		if (!connectionId) {
			console.error('Cannot accept connection: connection ID is missing');
			return;
		}
		const name = profileUser?.name;
		connectionService.acceptConnectionRequest(connectionId)
			.then(() => {
				setTimeout(() => {
					setConnectionStatus('connected');
					Alert.alert('Success', `You are now connected with ${name}!`);
				}, 0);
			})
			.catch((error: any) => {
				console.error('Error accepting connection:', error);
				setTimeout(() => Alert.alert('Error', error.message || 'Failed to accept connection request.'), 0);
			});
	};

	const handleDeclineConnection = () => {
		if (!connectionId) {
			console.error('Cannot decline connection: connection ID is missing');
			return;
		}
		const name = profileUser?.name;
		connectionService.declineConnectionRequest(connectionId)
			.then(() => {
				setTimeout(() => {
					setConnectionStatus('available');
					setConnectionId(null);
					Alert.alert('Request Declined', `Connection request from ${name} has been declined.`);
				}, 0);
			})
			.catch((error: any) => {
				console.error('Error declining connection:', error);
				setTimeout(() => Alert.alert('Error', error.message || 'Failed to decline connection request.'), 0);
			});
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
					onPress: () => {
						const name = profileUser?.name;
						connectionService.cancelConnectionRequest(connectionId)
							.then(() => {
								setTimeout(() => {
									setConnectionStatus('available');
									setConnectionId(null);
									Alert.alert('Request Cancelled', `Connection request to ${name} has been cancelled.`);
								}, 0);
							})
							.catch((error: any) => {
								console.error('Error cancelling connection:', error);
								setTimeout(() => Alert.alert('Error', error.message || 'Failed to cancel connection request.'), 0);
							});
					},
				},
			]
		);
	};

	if (loading) {
		return (
			<ScreenScrollView>
				<View className="p-5 rounded-xl mb-3 items-center bg-primary">
					<View className="w-[100px] h-[100px] rounded-full border-4 border-primary-foreground bg-white/20" />
					<View className="w-[200px] h-6 bg-white/20 rounded mt-3" />
					<View className="w-[150px] h-4 bg-white/15 rounded mt-1" />
					<View className="w-[120px] h-3.5 bg-white/10 rounded mt-1" />
				</View>
			</ScreenScrollView>
		);
	}

	if (!profileUser) {
		return (
			<ScreenScrollView>
				<View className="flex-1 justify-center items-center p-5">
					<Feather name="user-x" size={48} color={colors.textSecondary} />
					<Text className="text-lg font-bold text-foreground mt-3 mb-2.5">
						User Not Found
					</Text>
					<Text className="text-base text-muted-foreground text-center">
						The user you&apos;re looking for doesn&apos;t exist or has been removed.
					</Text>
				</View>
			</ScreenScrollView>
		);
	}

	return (
		<ScreenScrollView>
			<View className="p-5 rounded-xl mb-3 items-center bg-primary">
				<Image
					source={profileUserAvatarUri ? { uri: profileUserAvatarUri } : getAvatarSource(profileUser.avatar)}
					className="w-[100px] h-[100px] rounded-full border-4 border-primary-foreground"
					contentFit="cover"
				/>
				<Text className="text-xl font-bold text-white mt-3">
					{profileUser.name}
				</Text>
				<Text className="text-base text-white/90 mt-1">
					{profileUser.role}
				</Text>
				<Text className="text-sm text-primary-foreground/80 mt-1">
					{profileUser.organization || 'No organization'}
				</Text>
			</View>

			{!isOwnProfile && currentUser && (
				<View className="mb-3">
					{connectionStatus === 'connected' ? (
						<Pressable
							className="flex-row justify-center items-center h-[52px] rounded-lg mb-2.5 bg-primary active:opacity-70"
							onPress={handleMessage}
						>
							<Feather name="message-circle" size={20} color={colors.buttonText} />
							<Text className="text-base font-semibold text-primary-foreground ml-2.5">
								Message
							</Text>
						</Pressable>
					) : connectionStatus === 'pending_received' ? (
						<>
							<Pressable
								className="flex-row justify-center items-center h-[52px] rounded-lg mb-2.5 bg-green-600 active:opacity-70"
								onPress={handleAcceptConnection}
							>
								<Feather name="check" size={20} color={colors.buttonText} />
								<Text className="text-base font-semibold text-primary-foreground ml-2.5">
									Accept Request
								</Text>
							</Pressable>
							<Pressable
								className="flex-row justify-center items-center h-[52px] rounded-lg mb-2.5 bg-destructive active:opacity-70"
								onPress={handleDeclineConnection}
							>
								<Feather name="x" size={20} color={colors.buttonText} />
								<Text className="text-base font-semibold text-primary-foreground ml-2.5">
									Decline Request
								</Text>
							</Pressable>
						</>
					) : connectionStatus === 'pending_sent' ? (
						<>
							<Pressable
								className="flex-row justify-center items-center h-[52px] rounded-lg mb-2.5 bg-muted active:opacity-70"
								disabled
							>
								<Feather name="clock" size={20} color={colors.buttonText} />
								<Text className="text-base font-semibold text-primary-foreground ml-2.5">
									Request Sent
								</Text>
							</Pressable>
							<Pressable
								className="flex-row justify-center items-center h-[52px] rounded-lg mb-2.5 bg-destructive active:opacity-70"
								onPress={handleCancelConnection}
							>
								<Feather name="x-circle" size={20} color={colors.buttonText} />
								<Text className="text-base font-semibold text-primary-foreground ml-2.5">
									Cancel Request
								</Text>
							</Pressable>
						</>
					) : (
						<Pressable
							className="flex-row justify-center items-center h-[52px] rounded-lg mb-2.5 bg-accent active:opacity-80 shadow-lg"
							onPress={handleConnect}
						>
							<Feather name="user-plus" size={22} color={colors.buttonText} />
							<Text className="text-base font-bold text-white ml-2.5">
								Connect
							</Text>
						</Pressable>
					)}
				</View>
			)}

			{profileUser.bio && (
				<View className="p-3 rounded-xl mb-3 bg-card shadow-sm">
					<Text className="text-lg font-bold mb-2.5">About</Text>
					<Text className="text-base text-foreground leading-6">
						{profileUser.bio}
					</Text>
				</View>
			)}

			<View className="p-3 rounded-xl mb-3 bg-card shadow-sm">
				<Text className="text-lg font-bold mb-2.5">Contact Information</Text>
				<Pressable onPress={() => Linking.openURL(`mailto:${profileUser.email}`)} className="flex-row items-center">
					<Feather name="mail" size={18} color={colors.textSecondary} />
					<Text className="text-base text-primary ml-2.5">
						{profileUser.email}
					</Text>
				</Pressable>
				{profileUser.address && (
					<View className="flex-row items-center mt-2.5">
						<Feather name="map-pin" size={18} color={colors.textSecondary} />
						<Text className="text-base text-foreground ml-2.5">
							{profileUser.address}
						</Text>
					</View>
				)}
				{(() => {
					const firstWithContact = [...smmeServices, ...smmeProducts].find(
						(i) => i.contact_phone || i.website_url
					);
					const phone = firstWithContact?.contact_phone;
					const website = firstWithContact?.website_url;
					return (
						<>
							{phone && (
								<Pressable onPress={() => Linking.openURL(`tel:${phone}`)} className="flex-row items-center mt-2.5">
									<Feather name="phone" size={18} color={colors.textSecondary} />
									<Text className="text-base text-primary ml-2.5">{phone}</Text>
								</Pressable>
							)}
							{website && (
								<Pressable onPress={() => Linking.openURL(website)} className="flex-row items-center mt-2.5">
									<Feather name="globe" size={18} color={colors.textSecondary} />
									<Text className="text-base text-primary ml-2.5" numberOfLines={1}>{website}</Text>
									<Feather name="external-link" size={14} color={colors.primary} style={{ marginLeft: 4 }} />
								</Pressable>
							)}
						</>
					);
				})()}
			</View>

			{smmeProducts.length > 0 && (
				<View className="p-3 rounded-xl mb-3 bg-card shadow-sm">
					<Text className="text-lg font-bold mb-2.5">Products</Text>
					{smmeProducts.map((product) => (
						<View key={product.id} className="mb-4 last:mb-0 p-3 rounded-lg bg-muted/40 border border-border">
							<Text className="text-base font-semibold text-foreground">{product.name}</Text>
							{product.description ? (
								<Text className="text-sm text-muted-foreground mt-1" numberOfLines={3}>{product.description}</Text>
							) : null}
							<View className="flex-row flex-wrap gap-2 mt-2">
								<View className="bg-primary/10 px-2 py-0.5 rounded">
									<Text className="text-xs text-primary font-medium">{product.category}</Text>
								</View>
								{product.price && (
									<Text className="text-xs text-foreground font-medium">{product.price}</Text>
								)}
							</View>
							{(product.contact_email || product.contact_phone) && (
								<View className="flex-row flex-wrap gap-3 mt-2">
									{product.contact_email && (
										<Pressable onPress={() => Linking.openURL(`mailto:${product.contact_email}`)}>
											<Text className="text-xs text-primary">{product.contact_email}</Text>
										</Pressable>
									)}
									{product.contact_phone && (
										<Pressable onPress={() => Linking.openURL(`tel:${product.contact_phone}`)}>
											<Text className="text-xs text-primary">{product.contact_phone}</Text>
										</Pressable>
									)}
								</View>
							)}
						</View>
					))}
				</View>
			)}

			{smmeServices.length > 0 && (
				<View className="p-3 rounded-xl mb-3 bg-card shadow-sm">
					<Text className="text-lg font-bold mb-2.5">Services</Text>
					{smmeServices.map((service) => (
						<View key={service.id} className="mb-4 last:mb-0 p-3 rounded-lg bg-muted/40 border border-border">
							<Text className="text-base font-semibold text-foreground">{service.name}</Text>
							{service.description ? (
								<Text className="text-sm text-muted-foreground mt-1" numberOfLines={3}>{service.description}</Text>
							) : null}
							<View className="flex-row flex-wrap gap-2 mt-2">
								<View className="bg-primary/10 px-2 py-0.5 rounded">
									<Text className="text-xs text-primary font-medium">{service.category}</Text>
								</View>
								{service.price && (
									<Text className="text-xs text-foreground font-medium">{service.price}</Text>
								)}
							</View>
							{(service.contact_email || service.contact_phone) && (
								<View className="flex-row flex-wrap gap-3 mt-2">
									{service.contact_email && (
										<Pressable onPress={() => Linking.openURL(`mailto:${service.contact_email}`)}>
											<Text className="text-xs text-primary">{service.contact_email}</Text>
										</Pressable>
									)}
									{service.contact_phone && (
										<Pressable onPress={() => Linking.openURL(`tel:${service.contact_phone}`)}>
											<Text className="text-xs text-primary">{service.contact_phone}</Text>
										</Pressable>
									)}
								</View>
							)}
						</View>
					))}
				</View>
			)}

			{connectionStatus === 'connected' && (
				<View className="p-3 rounded-xl mb-3 bg-card shadow-sm">
					<Text className="text-lg font-bold mb-2.5">Connection Status</Text>
					<View className="flex-row items-center">
						<Feather name="check-circle" size={20} color={colors.success} />
						<Text className="text-base text-foreground ml-2.5">
							Connected
						</Text>
					</View>
				</View>
			)}
		</ScreenScrollView>
	);
}

export default withAuthGuard(UserProfileScreen);

