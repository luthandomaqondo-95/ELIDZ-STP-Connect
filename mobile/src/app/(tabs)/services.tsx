import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, View, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { PanoramaViewer } from '@/components/mixed-experiences/PanoramaViewer';
import { facilitiesService, type Facility, type FacilityWithTour, type VRScene, type VRSection } from '@/services/facilities.service';
import { getTenantsByLocation } from '@/data/vrToursData';

type ViewMode = 'panorama' | 'sections';
type ScreenMode = 'list' | 'detail' | 'vr-tour';

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

	// Use facility ID from params or selected facility
	const facilityId = params.id || selectedFacilityId;

	const tenants = useMemo(
		() => (facilityWithTour ? getTenantsByLocation(facilityWithTour.location) : []),
		[facilityWithTour]
	);

	const [viewMode, setViewMode] = useState<ViewMode>('panorama');
	const [currentSection, setCurrentSection] = useState(0);
	const [currentSceneId, setCurrentSceneId] = useState<string | null>(null);

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
			setFacilities(data);
		} catch (error) {
			console.error('Error loading facilities:', error);
		} finally {
			setLoading(false);
		}
	};

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

	useEffect(() => {
		setCurrentSection(0);
		setCurrentSceneId(null);
		setViewMode('panorama');
	}, [facilityId]);

	// Handle facility selection
	const handleFacilitySelect = (facilityId: string) => {
		setSelectedFacilityId(facilityId);
		setSelectedService(null);
		setScreenMode('detail');
	};

	// Handle service selection for VR tour
	const handleServiceSelect = (service: VRSection) => {
		if (service.has_vr) {
			setSelectedService(service);
			setCurrentSceneId(service.vr_scene_id || facilityWithTour?.initialSceneId || null);
			setScreenMode('vr-tour');
		}
	};

	// Handle back to list
	const handleBackToList = () => {
		setSelectedFacilityId(null);
		setSelectedService(null);
		setScreenMode('list');
		router.setParams({});
	};

	// Handle back to facility detail
	const handleBackToDetail = () => {
		setSelectedService(null);
		setScreenMode('detail');
	};

	const activeSceneId = currentSceneId ?? facilityWithTour?.initialSceneId;
	const activeScene = activeSceneId && facilityWithTour?.scenes 
		? facilityWithTour.scenes.find(s => s.id === activeSceneId) 
		: null;
	const hasSections = facilityWithTour?.sections ? facilityWithTour.sections.length > 0 : false;

	const handleHotspotClick = (hotspotId: string) => {
		if (!activeScene || !activeScene.hotspots) return;
		const hotspot = activeScene.hotspots.find((h) => h.id === hotspotId);
		if (hotspot?.target_scene_id) {
			setCurrentSceneId(hotspot.target_scene_id);
		}
	};

	return (
		<View className="flex-1">
			{screenMode === 'list' && (
				<ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ paddingBottom: 40 }}>
					{/* Header */}
					<View className="px-6 pt-12 pb-6 bg-white shadow-sm">
						<Text className="text-2xl font-bold text-[#002147] mb-2">IDZ STP Services</Text>
						<Text className="text-gray-600 text-base">
							Explore our world-class facilities and innovation centers
						</Text>
					</View>

					{/* Loading State */}
					{loading && (
						<View className="flex-1 items-center justify-center py-20">
							<ActivityIndicator size="large" color="#002147" />
							<Text className="text-gray-500 mt-4">Loading facilities...</Text>
						</View>
					)}

					{/* Facilities List */}
					{!loading && (
					<View className="px-6 py-4">
							{facilities.map((facility) => (
							<Pressable
								key={facility.id}
								className="bg-white rounded-2xl mb-4 p-4 shadow-sm border border-gray-100 active:opacity-95"
								onPress={() => handleFacilitySelect(facility.id)}
							>
								<View className="flex-row items-center">
									<View className="w-16 h-16 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: facility.color }}>
										<Feather name={facility.icon as any} size={28} color="#FFFFFF" />
									</View>
									<View className="flex-1">
										<Text className="text-lg font-bold text-[#002147] mb-1">{facility.name}</Text>
										<Text className="text-gray-600 text-sm mb-2">{facility.description}</Text>
										<View className="flex-row items-center">
											<Text className="text-xs text-gray-500">{facility.location}</Text>
											<Feather name="chevron-right" size={16} color="#FF6600" style={{ marginLeft: 'auto' }} />
										</View>
									</View>
								</View>
							</Pressable>
						))}
					</View>
					)}
				</ScrollView>
			)}

			{screenMode === 'detail' && facilityWithTour && (
				<ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ paddingBottom: 40 }}>
					{/* Header */}
					<View className="px-6 pt-12 pb-6 bg-white shadow-sm">
						<View className="flex-row items-center mb-4">
							<Pressable onPress={handleBackToList} className="p-2 mr-3">
								<Feather name="arrow-left" size={24} color="#002147" />
							</Pressable>
							<View className="w-12 h-12 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: facilityWithTour.color }}>
								<Feather name={facilityWithTour.icon as any} size={24} color="#FFFFFF" />
							</View>
							<View className="flex-1">
								<Text className="text-2xl font-bold text-[#002147]">{facilityWithTour.name}</Text>
								<Text className="text-gray-600 text-sm">{facilityWithTour.location}</Text>
							</View>
						</View>
						<Text className="text-gray-600 text-base">{facilityWithTour.description}</Text>
					</View>

					{/* Loading State */}
					{loadingTour && (
						<View className="flex-1 items-center justify-center py-20">
							<ActivityIndicator size="large" color="#002147" />
						</View>
					)}

					{/* Services List */}
					{!loadingTour && (
					<View className="px-6 py-4">
						<Text className="text-xl font-bold text-[#002147] mb-4">Available Services</Text>
							{facilityWithTour.sections.map((service, index) => (
							<Pressable
								key={index}
								className="bg-white rounded-2xl mb-4 p-4 shadow-sm border border-gray-100 active:opacity-95"
								onPress={() => handleServiceSelect(service)}
							>
								<View className="flex-row items-center justify-between">
									<View className="flex-1">
										<Text className="text-lg font-bold text-[#002147] mb-2">{service.title}</Text>
										<Text className="text-gray-600 text-sm mb-3">{service.description}</Text>
										<View className="flex-row flex-wrap">
											{service.details.slice(0, 3).map((detail: string, i: number) => (
												<View key={i} className="bg-blue-50 px-2 py-1 rounded-md mr-2 mb-1">
													<Text className="text-[#002147] text-[10px] font-medium">{detail}</Text>
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
						))}
					</View>
					)}

					{/* Tenants */}
					{!loadingTour && tenants.length > 0 && (
						<View className="px-6 py-4">
							<Text className="text-xl font-bold text-[#002147] mb-4">Tenants in this Facility</Text>
							{tenants.map(tenant => (
								<View key={tenant.id} className="bg-white p-4 rounded-xl mb-3 flex-row items-center border border-gray-100">
									<View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3">
										<Text className="text-primary font-bold">{tenant.name.charAt(0)}</Text>
									</View>
									<View className="flex-1">
										<Text className="font-semibold text-foreground">{tenant.name}</Text>
										<Text className="text-xs text-muted-foreground">{tenant.description}</Text>
									</View>
								</View>
							))}
						</View>
					)}
				</ScrollView>
			)}

			{screenMode === 'vr-tour' && facilityWithTour && selectedService && (
				<View className="flex-1 bg-background">
					<View className="px-6 pt-12 pb-6 flex-row items-center justify-between" style={{ backgroundColor: facilityWithTour.color }}>
						<Pressable onPress={handleBackToDetail} className="p-2 bg-white/20 rounded-full">
							<Feather name="arrow-left" size={24} color="#FFFFFF" />
						</Pressable>
						<View className="items-center">
							<Text className="text-white text-lg font-bold">{selectedService.title}</Text>
							<Text className="text-white/80 text-xs">
								{viewMode === 'panorama' && activeScene ? activeScene.title : 'Virtual Tour'}
							</Text>
						</View>
						<View className="flex-row gap-2">
							<Pressable
								className={`p-2 rounded-full ${viewMode === 'panorama' ? 'bg-white text-primary' : 'bg-white/20'}`}
								onPress={() => setViewMode('panorama')}
							>
								<Feather name="globe" size={20} color={viewMode === 'panorama' ? facilityWithTour.color : '#FFFFFF'} />
							</Pressable>
							<Pressable
								className={`p-2 rounded-full ${viewMode === 'sections' ? 'bg-white text-primary' : 'bg-white/20'}`}
								onPress={() => hasSections && setViewMode('sections')}
								disabled={!hasSections}
							>
								<Feather name="list" size={20} color={viewMode === 'sections' ? facilityWithTour.color : '#FFFFFF'} />
							</Pressable>
						</View>
					</View>

					{/* VR Panorama Viewer */}
					{viewMode === 'panorama' && activeScene ? (
						<PanoramaViewer
							imageUrl={facilitiesService.getImageUrl(activeScene.image_url, facilityWithTour.id)}
							title={activeScene.title}
							hotspots={activeScene.hotspots || []}
							onHotspotClick={handleHotspotClick}
						/>
					) : (
						<ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
							{/* Service Overview */}
							<View className="bg-card rounded-2xl p-6 shadow-sm border border-border mb-6">
								<View className="flex-row items-center mb-4">
									<View className="w-12 h-12 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: facilityWithTour.color }}>
										<Feather name={facilityWithTour.icon as any} size={24} color="#FFFFFF" />
									</View>
									<View className="flex-1">
										<Text className="text-xl font-bold text-foreground">{selectedService.title}</Text>
										<Text className="text-sm text-muted-foreground">{facilityWithTour.location}</Text>
									</View>
								</View>
								<Text className="text-base text-muted-foreground leading-6">
									{selectedService.description}
								</Text>
							</View>

							{/* Service Details */}
							<View className="bg-card rounded-2xl p-6 shadow-sm border border-border mb-6">
								<Text className="text-lg font-semibold text-foreground mb-4">Key Features & Services</Text>
								{selectedService.details.map((detail: string, index: number) => (
									<View key={index} className="flex-row items-center mb-3">
										<View className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: facilityWithTour.color }} />
										<Text className="text-base text-foreground flex-1">{detail}</Text>
									</View>
								))}
							</View>

							{/* Tenants */}
							<View className="mb-6">
								<Text className="text-lg font-semibold text-foreground mb-4">Tenants in this Facility</Text>
								{tenants.length === 0 && (
									<Text className="text-muted-foreground">No tenants listed for this facility.</Text>
								)}
								{tenants.map(tenant => (
									<View key={tenant.id} className="bg-card p-4 rounded-xl mb-3 flex-row items-center border border-border">
										<View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3">
											<Text className="text-primary font-bold">{tenant.name.charAt(0)}</Text>
										</View>
										<View className="flex-1">
											<Text className="font-semibold text-foreground">{tenant.name}</Text>
											<Text className="text-xs text-muted-foreground">{tenant.description}</Text>
										</View>
									</View>
								))}
							</View>
						</ScrollView>
					)}
				</View>
			)}
		</View>
	);
}