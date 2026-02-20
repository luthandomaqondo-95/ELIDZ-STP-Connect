import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, View, ActivityIndicator, Linking, Alert, TextInput, Dimensions, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { PanoramaViewer } from '@/components/mixed-experiences/PanoramaViewer';
import { facilitiesService, type Facility, type FacilityWithTour, type VRScene, type VRSection } from '@/services/facilities.service';
import { tenantService } from '@/services/tenant.service';
import type { Tenant } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { TabsLayoutHeader } from '@/components/Header';
import { useDebounce } from '@/hooks/useDebounce';
import { analyticsService } from '@/services/analytics.service';
import { useColorScheme } from '@/hooks/use-theme-color';
import { COLORS } from '@/theme/colors';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

type ScreenMode = 'list' | 'detail' | 'service';

export default function ServicesScreen() {
	const { colorScheme } = useColorScheme();
	const colors = COLORS[colorScheme ?? 'light'];
	const params = useLocalSearchParams<{ id?: string }>();
	const [screenMode, setScreenMode] = useState<ScreenMode>('list');
	const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
	const [selectedService, setSelectedService] = useState<VRSection | null>(null);

	// Data states
	const [facilities, setFacilities] = useState<Facility[]>([]);
	const [facilityWithTour, setFacilityWithTour] = useState<FacilityWithTour | null>(null);
	const [facilityTenants, setFacilityTenants] = useState<Tenant[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadingTour, setLoadingTour] = useState(false);
	const [loadingTenants, setLoadingTenants] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const debouncedSearch = useDebounce(searchQuery, 300);
	const [requestAccessService, setRequestAccessService] = useState<VRSection | null>(null);

	// Use facility ID from params or selected facility
	const facilityId = params.id || selectedFacilityId;

	const normalize = (value?: string) =>
		(value || '')
			.toLowerCase()
			.replace(/&/g, 'and')
			.replace(/[^a-z0-9]/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();

	const getFacilityAliases = (facility: FacilityWithTour) => {
		const aliases = [facility.id, facility.name, facility.location];
		// Known naming variants between centres and tenant locations.
		if (facility.id === 'automotive-incubator') aliases.push('incubators');
		if (facility.id === 'food-water') aliases.push('analytical laboratory');
		if (facility.id === 'design-centre') aliases.push('design centre');
		if (facility.id === 'digital-hub') aliases.push('digital hub');
		if (facility.id === 'renewable-energy') aliases.push('renewable energy centre');
		return aliases.map(normalize).filter(Boolean);
	};

	const loadFacilityTenants = async (facility: FacilityWithTour) => {
		setLoadingTenants(true);
		try {
			const aliases = getFacilityAliases(facility);

			// Source of truth: DB tenants only
			const dbTenants = await tenantService.getTenants(200);
			const matchedDbTenants = (dbTenants || []).filter((tenant) => {
				const tenantLoc = normalize(tenant.location);
				return aliases.some((alias) => tenantLoc.includes(alias) || alias.includes(tenantLoc));
			});

			// De-duplicate by id, then name.
			const unique = matchedDbTenants.filter((tenant, index, all) => {
				const idMatch = all.findIndex((t) => t.id === tenant.id);
				if (idMatch === index) return true;
				return all.findIndex((t) => t.name.toLowerCase() === tenant.name.toLowerCase()) === index;
			});

			setFacilityTenants(unique);
		} catch (error) {
			console.error('Error loading facility tenants:', error);
			setFacilityTenants([]);
		} finally {
			setLoadingTenants(false);
		}
	};

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
			if (data) {
				await loadFacilityTenants(data);
			} else {
				setFacilityTenants([]);
			}
		} catch (error) {
			console.error('Error loading facility tour:', error);
			setFacilityTenants([]);
		} finally {
			setLoadingTour(false);
		}
	};

	// Handle facility selection
	const handleFacilitySelect = (facilityId: string) => {
		const facility = facilities.find(f => f.id === facilityId);
		if (facility) {
			analyticsService.recordVisit('facility', facility.id, facility.name);
		}
		setSelectedFacilityId(facilityId);
		setSelectedService(null);
		setScreenMode('detail');
	};

	// Handle service selection: show single-service view (no header, only this service)
	const handleServiceSelect = (service: VRSection) => {
		setSelectedService(service);
		setScreenMode('service');
	};

	// Open VR tour for the current facility (from single-service view)
	const handleOpenVR = () => {
		if (facilityWithTour?.id) {
			router.push({ pathname: '/vr-tour', params: { id: facilityWithTour.id } });
		}
	};

	// Back from single-service view to facility's service list
	const handleBackToServiceList = () => {
		setSelectedService(null);
		setScreenMode('detail');
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
		setRequestAccessService(service);
	};

	const handleRequestAccessSubmit = () => {
		if (!facilityWithTour || !requestAccessService) return;
		setRequestAccessService(null);
		router.push({
			pathname: '/enquiry-form',
			params: {
				type: 'Facility',
				facilityId: facilityWithTour.id,
				subject: `Request Access: ${requestAccessService.title}`,
			},
		});
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
		const actions: { text: string; onPress: () => void }[] = [];

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
			{/* Request Access – styled modal */}
			<Modal
				visible={!!requestAccessService}
				transparent
				animationType="fade"
				onRequestClose={() => setRequestAccessService(null)}
			>
				<Pressable
					className="flex-1 bg-black/50 justify-center items-center px-6"
					onPress={() => setRequestAccessService(null)}
				>
					<Pressable
						className="w-full max-w-sm rounded-2xl overflow-hidden border border-border"
						style={{ backgroundColor: colors.card }}
						onPress={(e) => e.stopPropagation()}
					>
						<LinearGradient
							colors={['#002147', '#003366']}
							className="px-5 py-4"
						>
							<View className="flex-row items-center">
								<View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3">
									<Feather name="user-plus" size={20} color="white" />
								</View>
								<Text className="text-white text-lg font-bold">Request Access</Text>
							</View>
						</LinearGradient>
						<View className="px-5 py-4">
							<Text className="text-foreground text-base mb-5" style={{ color: colors.text }}>
								Would you like to request access to {requestAccessService?.title}?
							</Text>
							<View className="flex-row gap-3">
								<Pressable
									onPress={() => setRequestAccessService(null)}
									className="flex-1 py-3 rounded-xl border items-center justify-center"
									style={{ borderColor: colors.accent }}
								>
									<Text className="font-semibold text-base" style={{ color: colors.accent }}>Cancel</Text>
								</Pressable>
								<Pressable
									onPress={handleRequestAccessSubmit}
									className="flex-1 py-3 rounded-xl items-center justify-center"
									style={{ backgroundColor: colors.accent }}
								>
									<Text className="font-semibold text-base text-white">Submit Enquiry</Text>
								</Pressable>
							</View>
						</View>
					</Pressable>
				</Pressable>
			</Modal>

			{/* Header – only on list view */}
			{screenMode === 'list' && (
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
							<Feather name="search" size={20} color={colors.whiteOpacity70} />
							<TextInput
								className="flex-1 ml-3 text-base text-white"
								placeholder="Search facilities..."
								placeholderTextColor={colors.whiteOpacity50}
								value={searchQuery}
								onChangeText={setSearchQuery}
							/>
							{searchQuery.length > 0 && (
								<Pressable
									onPress={() => setSearchQuery('')}
									className="ml-2"
									hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
								>
									<Feather name="x" size={18} color={colors.whiteOpacity70} />
								</Pressable>
							)}
						</View>
					</View>
				</TabsLayoutHeader>
			</View>
			)}
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
												<Feather name="chevron-right" size={16} color="#F38C1E" style={{ marginLeft: 'auto' }} />
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
								<Feather name="arrow-left" size={24} color={colors.text} />
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
							<ActivityIndicator size="large" color={colors.accent} />
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
														<View
															key={i}
															className="px-2.5 py-1 rounded-md mr-2 mb-1"
															style={{
																backgroundColor: colorScheme === 'light' ? 'rgba(0, 33, 71, 0.08)' : colors.input,
															}}
														>
															<Text
																className="text-[10px] font-medium"
																style={{ color: colorScheme === 'light' ? colors.primary : colors.textSecondary }}
															>
																{detail}
															</Text>
														</View>
													))}
												</View>
											</View>
										</View>
									</Pressable>

									{/* Access Actions */}
									<View className="flex-row gap-2 mt-2 pt-3 border-t border-border">
										<Pressable
											onPress={() => handleRequestAccess(service)}
											className="flex-1 bg-accent py-2.5 rounded-lg active:opacity-90"
										>
											<View className="flex-row items-center justify-center">
												<Feather name="user-plus" size={16} color="white" />
												<Text className="text-white font-semibold text-sm ml-2">Request Access</Text>
											</View>
										</Pressable>
										<Pressable
											onPress={handleContactFacility}
											className="px-4 py-2.5 border border-accent rounded-lg active:opacity-90"
										>
											<View className="flex-row items-center">
												<Feather name="mail" size={16} color={colors.accent} />
											</View>
										</Pressable>
										{service.has_vr && (
											<Pressable
												onPress={() => handleServiceSelect(service)}
												className="px-4 py-2.5 border border-accent rounded-lg active:opacity-90"
											>
												<View className="flex-row items-center">
													<Feather name="eye" size={16} color={colors.accent} />
													<Text className="text-accent text-sm font-semibold ml-2">VR Tour</Text>
												</View>
											</Pressable>
										)}
									</View>
								</View>
							))}
						</View>
					)}

					{/* Tenants */}
					{!loadingTour && !loadingTenants && facilityTenants.length > 0 && (
						<View className="mx-5 py-4">
							<Text className="text-xl font-bold text-foreground mb-4">Tenants in this Facility</Text>
							<Text className="text-muted-foreground text-sm mb-4">
								Connect with tenants offering services in this facility
							</Text>
							{facilityTenants.map(tenant => (
								<Pressable
									key={tenant.id}
									onPress={() => router.push(`/tenant-detail?id=${tenant.id}`)}
									className="bg-card p-4 rounded-xl mb-3 flex-row items-center border border-border active:opacity-95"
								>
									<View className="w-10 h-10 bg-accent/10 rounded-full items-center justify-center mr-3">
										<Text className="text-accent font-bold">{tenant.name.charAt(0)}</Text>
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
														<Feather name="mail" size={12} color={colors.accent} />
														<Text className="text-accent text-[10px] ml-1">Email</Text>
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
														<Feather name="phone" size={12} color={colors.accent} />
														<Text className="text-accent text-[10px] ml-1">Call</Text>
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
														<Feather name="globe" size={12} color={colors.accent} />
														<Text className="text-accent text-[10px] ml-1">Website</Text>
													</Pressable>
												)}
											</View>
										)}
									</View>
									<Feather name="chevron-right" size={20} color={colors.accent} />
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
										className="flex-1 bg-accent py-3 rounded-lg active:opacity-90"
									>
										<View className="flex-row items-center justify-center">
											<Feather name="mail" size={16} color="white" />
											<Text className="text-white font-semibold text-sm ml-2">Contact Facility</Text>
										</View>
									</Pressable>
									<Pressable
										onPress={() => Linking.openURL('https://www.elidz.co.za')}
										className="px-4 py-3 border border-accent rounded-lg active:opacity-90"
									>
										<Feather name="globe" size={18} color={colors.accent} />
									</Pressable>
								</View>
							</View>
						</View>
					)}
				</ScrollView>
			)}

			{/* Single service view – no main header, only this service */}
			{screenMode === 'service' && selectedService && facilityWithTour && (
				<ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: 40 }}>
					<View className="px-4 pt-12 pb-4 flex-row items-center border-b border-border bg-card">
						<Pressable onPress={handleBackToServiceList} className="p-2 mr-3">
							<Feather name="arrow-left" size={24} color={colors.text} />
						</Pressable>
						<Text className="text-lg font-bold text-foreground flex-1" numberOfLines={1}>
							{selectedService.title}
						</Text>
					</View>
					<View className="mx-5 mt-6">
						<View className="bg-card rounded-2xl p-5 shadow-sm border border-border">
							<Text className="text-muted-foreground text-sm mb-3">{selectedService.description}</Text>
							<View className="flex-row flex-wrap mb-4">
								{selectedService.details.slice(0, 5).map((detail: string, i: number) => (
									<View
										key={i}
										className="px-2.5 py-1 rounded-md mr-2 mb-1"
										style={{
											backgroundColor: colorScheme === 'light' ? 'rgba(0, 33, 71, 0.08)' : colors.input,
										}}
									>
										<Text
											className="text-[10px] font-medium"
											style={{ color: colorScheme === 'light' ? colors.primary : colors.textSecondary }}
										>
											{detail}
										</Text>
									</View>
								))}
							</View>
							<View className="flex-row gap-2">
								<Pressable
									onPress={() => handleRequestAccess(selectedService)}
									className="flex-1 bg-accent py-2.5 rounded-lg active:opacity-90"
								>
									<View className="flex-row items-center justify-center">
										<Feather name="user-plus" size={16} color="white" />
										<Text className="text-white font-semibold text-sm ml-2">Request Access</Text>
									</View>
								</Pressable>
								<Pressable
									onPress={handleContactFacility}
									className="px-4 py-2.5 border border-accent rounded-lg active:opacity-90"
								>
									<View className="flex-row items-center">
										<Feather name="mail" size={16} color={colors.accent} />
									</View>
								</Pressable>
								{selectedService.has_vr && (
									<Pressable
										onPress={handleOpenVR}
										className="px-4 py-2.5 border border-accent rounded-lg active:opacity-90 flex-row items-center"
									>
										<Feather name="eye" size={16} color={colors.accent} />
										<Text className="text-accent text-sm font-semibold ml-2">VR Tour</Text>
									</Pressable>
								)}
							</View>
						</View>
					</View>
				</ScrollView>
			)}
		</View>
	);
}