import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenScrollView } from '../components/ScreenScrollView';
import { useTheme } from '../hooks/useTheme';
import { useAuthContext } from '../hooks/use-auth-context';
import { Spacing, BorderRadius, Typography, Shadow } from '../constants/theme';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { withAuthGuard } from '@/components/withAuthGuard';


// Mock data - in production, fetch from Supabase based on id
const users: Record<string, any> = {
	'1': {
		id: '1',
		name: 'Sarah Johnson',
		role: 'CEO',
		org: 'TechVenture Solutions',
		avatar: 'blue',
		bio: 'Passionate entrepreneur with 15+ years of experience in technology and innovation. Leading TechVenture Solutions to new heights.',
		email: 'sarah.johnson@techventure.co.za',
		location: 'Digital Hub, ELIDZ-STP',
		connected: true,
		expertise: ['Technology', 'Business Strategy', 'Innovation'],
	},
	'2': {
		id: '2',
		name: 'Michael Chen',
		role: 'Researcher',
		org: 'Renewable Energy Centre',
		avatar: 'green',
		bio: 'Research scientist specializing in renewable energy technologies and sustainable solutions.',
		email: 'michael.chen@renewable.co.za',
		location: 'Renewable Energy Centre',
		connected: true,
		expertise: ['Renewable Energy', 'Research', 'Sustainability'],
	},
	'3': {
		id: '3',
		name: 'Amara Nkosi',
		role: 'Product Designer',
		org: 'Creative Design Studio',
		avatar: 'orange',
		bio: 'Creative designer focused on user experience and innovative product design.',
		email: 'amara@creativedesign.co.za',
		location: 'Design Centre',
		connected: true,
		expertise: ['Design', 'UX/UI', 'Product Development'],
	},
	'4': {
		id: '4',
		name: 'David Williams',
		role: 'Manufacturing Lead',
		org: 'AutoParts Manufacturing',
		avatar: 'blue',
		bio: 'Expert in manufacturing processes and automotive parts production.',
		email: 'david.williams@autoparts.co.za',
		location: 'Automotive Incubator',
		connected: true,
		expertise: ['Manufacturing', 'Automotive', 'Production'],
	},
	'5': {
		id: '5',
		name: 'Lisa Thompson',
		role: 'Investor',
		org: 'Growth Capital Partners',
		avatar: 'green',
		bio: 'Venture capitalist focused on early-stage technology startups and innovation.',
		email: 'lisa.thompson@growthcapital.co.za',
		location: 'Main Building',
		connected: false,
		connectionStatus: 'pending',
		expertise: ['Investment', 'Finance', 'Startups'],
	},
	'6': {
		id: '6',
		name: 'James Martinez',
		role: 'CTO',
		org: 'IoT Solutions Africa',
		avatar: 'orange',
		bio: 'Chief Technology Officer with expertise in IoT, cloud computing, and enterprise solutions.',
		email: 'james.martinez@iotafrica.co.za',
		location: 'Digital Hub',
		connected: false,
		connectionStatus: 'pending',
		expertise: ['IoT', 'Cloud Computing', 'Enterprise Tech'],
	},
	'7': {
		id: '7',
		name: 'Emma Davis',
		role: 'Sustainability Consultant',
		org: 'GreenPower Innovations',
		avatar: 'blue',
		bio: 'Consultant specializing in sustainable business practices and green technology.',
		email: 'emma.davis@greenpower.co.za',
		location: 'Renewable Energy Centre',
		connected: false,
		expertise: ['Sustainability', 'Consulting', 'Green Tech'],
	},
	'8': {
		id: '8',
		name: 'Robert Lee',
		role: 'Quality Assurance',
		org: 'FoodSafe Labs',
		avatar: 'green',
		bio: 'Quality assurance specialist ensuring food safety and compliance standards.',
		email: 'robert.lee@foodsafe.co.za',
		location: 'Testing Lab',
		connected: false,
		expertise: ['Quality Assurance', 'Food Safety', 'Compliance'],
	},
	'9': {
		id: '9',
		name: 'Fatima Ahmed',
		role: 'Business Developer',
		org: 'Sustainable Packaging Co',
		avatar: 'orange',
		bio: 'Business development professional focused on sustainable packaging solutions.',
		email: 'fatima.ahmed@sustainablepack.co.za',
		location: 'Main Building',
		connected: false,
		expertise: ['Business Development', 'Sustainability', 'Packaging'],
	},
};


function UserProfileScreen() {
	const { colors } = useTheme();
	const { profile: currentUser } = useAuthContext();
	const params = useLocalSearchParams<{ id?: string; userId?: string; name?: string }>();
	// Handle both 'id' and 'userId' params, and fallback to current user
	const id = params?.id || params?.userId || currentUser?.id;
	const name = params?.name || currentUser?.name || 'User';

	const profileUser = users[id as keyof typeof users] || {
		id,
		name,
		role: 'Member',
		org: 'ELIDZ-STP',
		avatar: 'blue',
		bio: 'Member of the ELIDZ-STP community.',
		email: 'user@elidz.co.za',
		location: 'ELIDZ-STP',
		connected: false,
		expertise: [],
	};

	const isOwnProfile = currentUser?.id === id;
	const isConnected = profileUser.connected;
	const isPending = profileUser.connectionStatus === 'pending';

	const getAvatarSource = (avatar?: string) => {
		switch (avatar) {
			case 'blue': return require('../../assets/avatars/avatar-blue.png');
			case 'green': return require('../../assets/avatars/avatar-green.png');
			case 'orange': return require('../../assets/avatars/avatar-orange.png');
			default: return require('../../assets/avatars/avatar-blue.png');
		}
	};

	const handleMessage = () => {
		if (!id) {
			console.error('Cannot message: user ID is missing');
			return;
		}
		router.push({ pathname: '/message', params: { userId: id, userName: name } });
	};

	const handleConnect = () => {
		if (!id) {
			console.error('Cannot connect: user ID is missing');
			return;
		}
		// TODO: Implement connection request with Supabase
		console.log('Connect clicked for user:', id);
		// For now, show a success message
		// In production, this would create a connection request in Supabase
	};

	const handleAcceptConnection = () => {
		if (!id) {
			console.error('Cannot accept connection: user ID is missing');
			return;
		}
		// TODO: Implement accept connection with Supabase
		console.log('Accept connection for user:', id);
		// For now, show a success message
		// In production, this would update the connection status in Supabase
	};

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
					{profileUser.org}
				</Text>
			</View>

			{!isOwnProfile && (
				<View style={styles.actionButtons}>
					{isConnected ? (
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
					) : isPending ? (
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
					) : (
						<Pressable
							style={({ pressed }) => [
								styles.actionButton,
								{ backgroundColor: colors.accent, opacity: pressed ? 0.7 : 1 },
							]}
							onPress={handleConnect}
						>
							<Feather name="user-plus" size={20} color="#FFFFFF" />
							<Text style={[Typography.body, { color: '#FFFFFF', marginLeft: Spacing.md, fontWeight: '600' }]}>
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
				<View style={[styles.infoRow, { marginTop: Spacing.md }]}>
					<Feather name="map-pin" size={18} color={colors.textSecondary} />
					<Text style={[Typography.body, { color: colors.text, marginLeft: Spacing.md }]}>
						{profileUser.location}
					</Text>
				</View>
			</View>

			{profileUser.expertise && profileUser.expertise.length > 0 && (
				<View style={[styles.card, { backgroundColor: colors.backgroundDefault, ...Shadow.card }]}>
					<Text style={[Typography.h3, { marginBottom: Spacing.md }]}>Areas of Expertise</Text>
					<View style={styles.expertiseContainer}>
						{profileUser.expertise.map((area: string, index: number) => (
							<View style={[styles.expertiseTag, { backgroundColor: colors.backgroundSecondary }]}>
								<Text style={[Typography.small, { color: colors.text }]}>{area}</Text>
							</View>
						))}
					</View>
				</View>
			)}

			{isConnected && (
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

