import React, { useMemo, useState } from 'react';
import { Image, Pressable, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { ScreenScrollView } from '@/components/ScreenScrollView';
import { FACILITIES, TENANTS } from '@/data/vrToursData';
// import ARCarDemo from '@/components/mixed-experiences/ar-demos/ARCarDemo';

export default function VRToursScreen() {
	const [searchQuery, setSearchQuery] = useState('');

	const filteredItems = useMemo(() => {
		const lowerQuery = searchQuery.toLowerCase().trim();
		if (!lowerQuery) return FACILITIES;

		return FACILITIES.filter(facility => {
			const matchesFacility =
				facility.name.toLowerCase().includes(lowerQuery) ||
				facility.description.toLowerCase().includes(lowerQuery);

			const matchesTenant = TENANTS.some(
				tenant =>
					tenant.location === facility.location &&
					tenant.name.toLowerCase().includes(lowerQuery)
			);

			return matchesFacility || matchesTenant;
		});
	}, [searchQuery]);

	return (
		<ScreenScrollView>
			<View className="p-6 pb-4">
				<Text className="text-3xl font-bold text-foreground">Virtual Tour</Text>
				<Text className="text-muted-foreground text-base mt-2">
					Explore the ELIDZ Science & Technology Park campus virtually.
				</Text>
			</View>

			{/* <ARCarDemo /> */}

			<View className="flex-row items-center px-4 h-12 rounded-lg border border-border mx-6 mb-6 bg-card">
				<Feather name="search" size={20} color="rgb(var(--muted-foreground))" />
				<TextInput
					className="flex-1 ml-3 text-base text-foreground"
					placeholder="Search rooms, labs, or tenants..."
					placeholderTextColor="rgb(var(--muted-foreground))"
					value={searchQuery}
					onChangeText={setSearchQuery}
				/>
			</View>

			<View className="px-6 pb-6">
				{filteredItems.map(facility => {
					const tenantsInFacility = TENANTS.filter(tenant => tenant.location === facility.location);

					return (
						<Pressable
							key={facility.id}
							className="mb-4 bg-card rounded-xl overflow-hidden shadow-sm border border-border active:opacity-90"
							onPress={() => router.push({ pathname: '/vr-tour', params: { id: facility.id } })}
						>
							<View className="h-40 bg-muted relative">
								<Image source={facility.image} className="w-full h-full" resizeMode="cover" />
								<View className="absolute inset-0 bg-black/30 flex-row items-center justify-center">
									<View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center backdrop-blur-md">
										<Feather name="play-circle" size={24} color="#FFFFFF" />
									</View>
								</View>
							</View>

							<View className="p-4">
								<View className="flex-row items-center justify-between mb-2">
									<Text className="text-xl font-bold text-foreground">{facility.name}</Text>
									<Feather name={facility.icon as any} size={20} color={facility.color} />
								</View>

								<Text className="text-muted-foreground text-sm mb-4">
									{facility.description}
								</Text>

								{tenantsInFacility.length > 0 && (
									<View className="bg-muted/10 rounded-lg p-3">
										<Text className="text-xs font-semibold text-muted-foreground mb-2">
											TENANTS IN THIS WING
										</Text>
										{tenantsInFacility.slice(0, 3).map(tenant => (
											<View key={tenant.id} className="flex-row items-center mb-1">
												<View className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
												<Text className="text-xs text-foreground">{tenant.name}</Text>
											</View>
										))}
										{tenantsInFacility.length > 3 && (
											<Text className="text-xs text-muted-foreground mt-1 ml-3.5">
												+{tenantsInFacility.length - 3} more
											</Text>
										)}
									</View>
								)}
							</View>
						</Pressable>
					);
				})}

				{filteredItems.length === 0 && (
					<View className="items-center py-12">
						<Feather name="map" size={48} color="rgb(var(--muted-foreground))" />
						<Text className="text-muted-foreground text-base mt-4 text-center">
							No facilities found matching "{searchQuery}"
						</Text>
					</View>
				)}
			</View>
		</ScreenScrollView>
	);
}