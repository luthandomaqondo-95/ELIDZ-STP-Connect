import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, View, ActivityIndicator, Linking, Alert, TextInput, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { PanoramaViewer } from '@/components/mixed-experiences/PanoramaViewer';
import { facilitiesService, type Facility, type FacilityWithTour, type VRScene, type VRSection } from '@/services/facilities.service';
import { getTenantsByLocation } from '@/data/vrToursData';
import type { Tenant } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { TabsLayoutHeader } from '@/components/Header';
import { useDebounce } from '@/hooks/useDebounce';
import { analyticsService } from '@/services/analytics.service';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

type ScreenMode = 'list' | 'detail';

export default function ServicesScreen() {
	const params = useLocalSearchParams<{ id?: string }>();
	const [screenMode, setScreenMode] = useState<ScreenMode>('list');
	const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
	const [selectedService, setSelectedService] = useState<VRSection | null>(null);

	// Data states
	const [facilities, setFacilities] = useState<Facility[]>([]);
	const [facilityWithTour, setFacilityWithTour] = useState<FacilityWithTour | null>(null);
	const [loading, setLoading] = useState(true);
	const [loadingTour, setLoadingTour] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const debouncedSearch = useDebounce(searchQuery, 300);

	// Use facility ID from params or selected facility
	const facilityId = params.id || selectedFacilityId;

	const tenants = useMemo(
		() => (facilityWithTour ? getTenantsByLocation(facilityWithTour.location) : []),
		[facilityWithTour]
	);

	// Fetch all facilities on mount
	useEffect(() => {
		loadFacilities();
	}, []);

	// Fetch facility tour data when facility is selected
	useEffect(() => {
		if (facilityId) {
			loadFacilityTour(facilityId);
		}
	}, [facilityId]);

	const loadFacilities = async () => {
		setLoading(true);
		try {
			const data = await facilitiesService.getAllFacilities();
			// Filter by search query if provided
			let filteredData = data;
			if (debouncedSearch.trim()) {
				filteredData = data.filter(facility =>
					facility.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
					facility.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
					facility.location.toLowerCase().includes(debouncedSearch.toLowerCase())
				);
			}
			setFacilities(filteredData);
		} catch (error) {
			console.error('Error loading facilities:', error);
		} finally {
			setLoading(false);
		}
	};

	// Refetch when search query changes
	useEffect(() => {
		if (screenMode === 'list') {
			loadFacilities();
		}
	}, [debouncedSearch]);

	const loadFacilityTour = async (id: string) => {
		setLoadingTour(true);
		try {
			const data = await facilitiesService.getFacilityWithTour(id);
			setFacilityWithTour(data);
		} catch (error) {
			console.error('Error loading facility tour:', error);
		} finally {
			setLoadingTour(false);
		}
	};

	// Handle facility selection
	const handleFacilitySelect = (facilityId: string) => {
		const facility = facilities.find(f => f.id === facilityId);
		if (facility) {
			analyticsService.recordVisit('service', facility.id, facility.name);
		}
		setSelectedFacilityId(facilityId);
		setSelectedService(null);
		setScreenMode('detail');
	};

	// Handle service selection for VR tour
	const handleServiceSelect = (service: VRSection) => {
		if (service.has_vr) {
			router.push({
				pathname: '/vr-tour',
				params: { id: facilityWithTour?.id }
			});
		}
	};

	// Handle back to list
	const handleBackToList = () => {
		setSelectedFacilityId(null);
		setSelectedService(null);
		setScreenMode('list');
		router.setParams({});
	};

	// Handle service access actions
	const handleRequestAccess = (service: VRSection) => {
		if (!facilityWithTour) return;

		Alert.alert(
			'Request Access',
			`Would you like to request access to ${service.title}?`,
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Submit Enquiry',
					onPress: () => {
						router.push({
							pathname: '/enquiry-form',
							params: {
								type: 'Facility',
								facilityId: facilityWithTour.id,
								subject: `Request Access: ${service.title}`,
							},
						});
					},
				},
				{
					text: 'View Tenants',
					onPress: () => {
						// Scroll to tenants section or show tenant list
						Alert.alert('Tenants', 'Please scroll down to view tenants offering this service.');
					},
				},
			]
		);
	};

	const handleContactFacility = () => {
		if (!facilityWithTour) return;

		Alert.alert(
			'Contact Facility',
			`How would you like to contact ${facilityWithTour.name}?`,
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Submit Enquiry',
					onPress: () => {
						router.push({
							pathname: '/enquiry-form',
							params: {
								type: 'Facility',
								facilityId: facilityWithTour.id,
								subject: `Enquiry about ${facilityWithTour.name}`,
							},
						});
					},
				},
				{
					text: 'Send Email',
					onPress: () => {
						const email = 'info@elidz.co.za'; // Default ELIDZ email
						Linking.openURL(`mailto:${email}?subject=Inquiry about ${facilityWithTour.name}`);
					},
				},
				{
					text: 'Visit Website',
					onPress: () => {
						Linking.openURL('https://www.elidz.co.za');
					},
				},
			]
		);
	};

	const handleContactTenant = (tenant: any) => {
		const options: string[] = [];
		const actions: Array<{ text: string; onPress: () => void }> = [];

		if (tenant.contact_email) {
			options.push('Email');
			actions.push({
				text: 'Email',
				onPress: () => Linking.openURL(`mailto:${tenant.contact_email}`),
			});
		}

		if (tenant.contact_phone) {
			options.push('Call');
			actions.push({
				text: 'Call',
				onPress: () => Linking.openURL(`tel:${tenant.contact_phone}`),
			});
		}

		if (tenant.website) {
			options.push('Website');
			actions.push({
				text: 'Website',
				onPress: () => Linking.openURL(tenant.website),
			});
		}

		if (tenant.application_url) {
			options.push('Apply');
			actions.push({
				text: 'Apply',
				onPress: () => Linking.openURL(tenant.application_url),
			});
		}

		if (options.length === 0) {
			Alert.alert('No Contact Information', 'Contact information is not available for this tenant.');
			return;
		}

		Alert.alert(
			`Contact ${tenant.name}`,
			'How would you like to contact them?',
			[
				{ text: 'Cancel', style: 'cancel' },
				...actions,
				{
					text: 'View Profile',
					onPress: () => router.push(`/tenant-detail?id=${tenant.id}`),
				},
			]
		);
	};

	return (
		<View className="flex-1">
			{/* Header */}
			<View className="bg-background">
				<TabsLayoutHeader title="Services" variant="navy">
					<View
						style={{
							maxWidth: isTablet ? 1200 : '100%',
							alignSelf: 'center',
							width: '100%'
						}}
					>
						<Text className="text-white/80 text-base mb-6">
							Explore our world-class facilities and innovation centers
						</Text>

						{/* Search Bar */}
						<View
							className="flex-row items-center bg-white/10 border border-white/20 h-12 rounded-xl px-4"
						>
							<Feather name="search" size={20} color="rgba(255,255,255,0.7)" />
							<TextInput
								className="flex-1 ml-3 text-base text-white"
								placeholder="Search facilities..."
								placeholderTextColor="rgba(255,255,255,0.5)"
								value={searchQuery}
								onChangeText={setSearchQuery}
							/>
							{searchQuery.length > 0 && (
								<Pressable
									onPress={() => setSearchQuery('')}
									className="ml-2"
									hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
								>
									<Feather name="x" size={18} color="rgba(255,255,255,0.7)" />
								</Pressable>
							)}
						</View>
					</View>
				</TabsLayoutHeader>
			</View>
			{screenMode === 'list' && (
				<ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: 40 }}>


					{/* Facilities List */}
					<View
						className="py-4"
						style={{
							paddingHorizontal: isTablet ? 24 : 20,
							maxWidth: isTablet ? 1200 : '100%',
							alignSelf: 'center',
							width: '100%'
						}}
					>
						{loading ? (
							<View className="items-center py-12">
								<ActivityIndicator size="large" color="#002147" />
								<Text className="text-muted-foreground mt-4">Loading facilities...</Text>
							</View>
						) : facilities.length === 0 ? (
							<View className="items-center py-12 bg-card rounded-2xl border border-border border-dashed">
								<Feather name="home" size={48} color="#CBD5E0" />
								<Text className="text-muted-foreground text-base mt-4 text-center font-medium">
									{searchQuery ? 'No facilities found' : 'No facilities available'}
								</Text>
								<Text className="text-muted-foreground text-sm mt-2 text-center">
									{searchQuery ? 'Try a different search term' : 'Check back soon for updates'}
								</Text>
							</View>
						) : (
							facilities.map((facility) => (
								<Pressable
									key={facility.id}
									className="bg-card rounded-2xl mb-4 p-4 shadow-sm border border-border active:opacity-95"
									onPress={() => handleFacilitySelect(facility.id)}
								>
									<View className="flex-row items-center">
										<View className="w-16 h-16 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: facility.color }}>
											<Feather name={facility.icon as any} size={28} color="#FFFFFF" />
										</View>
										<View className="flex-1">
											<Text className="text-lg font-bold text-foreground mb-1">{facility.name}</Text>
											<Text className="text-muted-foreground text-sm mb-2">{facility.description}</Text>
											<View className="flex-row items-center">
												<Text className="text-xs text-muted-foreground">{facility.location}</Text>
												<Feather name="chevron-right" size={16} color="#FF6600" style={{ marginLeft: 'auto' }} />
											</View>
										</View>
									</View>
								</Pressable>
							))
						)}
					</View>
				</ScrollView>
			)}

			{screenMode === 'detail' && facilityWithTour && (
				<ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: 40 }}>
					{/* Header */}
					<View className="px-6 pt-12 pb-6 bg-card shadow-sm">
						<View className="flex-row items-center mb-4">
							<Pressable onPress={handleBackToList} className="p-2 mr-3">
								<Feather name="arrow-left" size={24} color="#002147" />
							</Pressable>
							<View className="w-12 h-12 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: facilityWithTour.color }}>
								<Feather name={facilityWithTour.icon as any} size={24} color="#FFFFFF" />
							</View>
							<View className="flex-1">
								<Text className="text-2xl font-bold text-foreground">{facilityWithTour.name}</Text>
								<Text className="text-muted-foreground text-sm">{facilityWithTour.location}</Text>
							</View>
						</View>
						<Text className="text-muted-foreground text-base">{facilityWithTour.description}</Text>
					</View>

					{/* Loading State */}
					{loadingTour && (
						<View className="flex-1 items-center justify-center py-20">
							<ActivityIndicator size="large" color="#002147" />
						</View>
					)}

					{/* Services List */}
					{!loadingTour && (
						<View className="mx-5 py-4">
							<Text className="text-xl font-bold text-foreground mb-4">Available Services</Text>
							{facilityWithTour.sections.map((service, index) => (
								<View
									key={index}
									className="bg-card rounded-2xl mb-4 p-4 shadow-sm border border-border"
								>
									<Pressable
										onPress={() => handleServiceSelect(service)}
										className="active:opacity-95"
									>
										<View className="flex-row items-center justify-between mb-3">
											<View className="flex-1">
												<Text className="text-lg font-bold text-foreground mb-2">{service.title}</Text>
												<Text className="text-muted-foreground text-sm mb-3">{service.description}</Text>
												<View className="flex-row flex-wrap">
													{service.details.slice(0, 3).map((detail: string, i: number) => (
														<View key={i} className="bg-primary/10 px-2 py-1 rounded-md mr-2 mb-1">
															<Text className="text-primary text-[10px] font-medium">{detail}</Text>
														</View>
													))}
												</View>
											</View>
											{service.has_vr ? (
												<View className="ml-4">
													<Feather name="eye" size={24} color="#FF6600" />
												</View>
											) : null}
										</View>
									</Pressable>

									{/* Access Actions */}
									<View className="flex-row gap-2 mt-2 pt-3 border-t border-border">
										<Pressable
											onPress={() => handleRequestAccess(service)}
											className="flex-1 bg-[#002147] py-2.5 rounded-lg active:opacity-90"
										>
											<View className="flex-row items-center justify-center">
												<Feather name="user-plus" size={16} color="white" />
												<Text className="text-white font-semibold text-sm ml-2">Request Access</Text>
											</View>
										</Pressable>
										<Pressable
											onPress={handleContactFacility}
											className="px-4 py-2.5 border border-[#002147] rounded-lg active:opacity-90"
										>
											<View className="flex-row items-center">
												<Feather name="mail" size={16} color="#002147" />
											</View>
										</Pressable>
										{service.has_vr && (
											<Pressable
												onPress={() => handleServiceSelect(service)}
												className="px-4 py-2.5 border border-[#FF6600] rounded-lg active:opacity-90"
											>
												<View className="flex-row items-center">
													<Feather name="eye" size={16} color="#FF6600" />
												</View>
											</Pressable>
										)}
									</View>
								</View>
							))}
						</View>
					)}

					{/* Tenants */}
					{!loadingTour && tenants.length > 0 && (
						<View className="mx-5 py-4">
							<Text className="text-xl font-bold text-foreground mb-4">Tenants in this Facility</Text>
							<Text className="text-muted-foreground text-sm mb-4">
								Connect with tenants offering services in this facility
							</Text>
							{tenants.map(tenant => (
								<Pressable
									key={tenant.id}
									onPress={() => router.push(`/tenant-detail?id=${tenant.id}`)}
									className="bg-card p-4 rounded-xl mb-3 flex-row items-center border border-border active:opacity-95"
								>
									<View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3">
										<Text className="text-primary font-bold">{tenant.name.charAt(0)}</Text>
									</View>
									<View className="flex-1">
										<Text className="font-semibold text-foreground">{tenant.name}</Text>
										<Text className="text-xs text-muted-foreground mt-1" numberOfLines={2}>{tenant.description}</Text>
										{(tenant.contact_email || tenant.contact_phone || tenant.website) && (
											<View className="flex-row items-center mt-2 gap-3">
												{tenant.contact_email && (
													<Pressable
														onPress={(e) => {
															e.stopPropagation();
															Linking.openURL(`mailto:${tenant.contact_email}`);
														}}
														className="flex-row items-center"
													>
														<Feather name="mail" size={12} color="#002147" />
														<Text className="text-primary text-[10px] ml-1">Email</Text>
													</Pressable>
												)}
												{tenant.contact_phone && (
													<Pressable
														onPress={(e) => {
															e.stopPropagation();
															Linking.openURL(`tel:${tenant.contact_phone}`);
														}}
														className="flex-row items-center"
													>
														<Feather name="phone" size={12} color="#002147" />
														<Text className="text-primary text-[10px] ml-1">Call</Text>
													</Pressable>
												)}
												{tenant.website && (
													<Pressable
														onPress={(e) => {
															e.stopPropagation();
															Linking.openURL(tenant.website!);
														}}
														className="flex-row items-center"
													>
														<Feather name="globe" size={12} color="#002147" />
														<Text className="text-primary text-[10px] ml-1">Website</Text>
													</Pressable>
												)}
											</View>
										)}
									</View>
									<Feather name="chevron-right" size={20} color="#FF6600" />
								</Pressable>
							))}
						</View>
					)}

					{/* Contact Facility Section */}
					{!loadingTour && (
						<View className="mx-5 py-4">
							<View className="bg-card rounded-2xl p-5 shadow-sm border border-border">
								<Text className="text-lg font-bold text-foreground mb-3">Need Help?</Text>
								<Text className="text-muted-foreground text-sm mb-4">
									Contact the facility directly for inquiries, bookings, or more information about services.
								</Text>
								<View className="flex-row gap-2">
									<Pressable
										onPress={handleContactFacility}
										className="flex-1 bg-[#002147] py-3 rounded-lg active:opacity-90"
									>
										<View className="flex-row items-center justify-center">
											<Feather name="mail" size={16} color="white" />
											<Text className="text-white font-semibold text-sm ml-2">Contact Facility</Text>
										</View>
									</Pressable>
									<Pressable
										onPress={() => Linking.openURL('https://www.elidz.co.za')}
										className="px-4 py-3 border border-[#002147] rounded-lg active:opacity-90"
									>
										<Feather name="globe" size={18} color="#002147" />
									</Pressable>
								</View>
							</View>
						</View>
					)}
				</ScrollView>
			)}
		</View>
	);
}