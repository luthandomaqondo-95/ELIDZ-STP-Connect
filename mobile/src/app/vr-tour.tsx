import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenScrollView } from '@/components/ScreenScrollView';
import { PanoramaViewer } from '@/components/mixed-experiences/PanoramaViewer';
import { TenantLogo } from '@/components/TenantLogo';
import {
	facilitiesService,
	type FacilityWithTour,
	type VRHotspot,
	type VRScene,
} from '@/services/facilities.service';
import { tenantService } from '@/services/tenant.service';
import type { Tenant } from '@/types';

type ViewMode = 'panorama' | 'sections';

const normalize = (value?: string) =>
	(value || '')
		.toLowerCase()
		.replace(/&/g, 'and')
		.replace(/[^a-z0-9]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

const getFacilityAliases = (facility: FacilityWithTour) => {
	const aliases = [facility.id, facility.name, facility.location];
	if (facility.id === 'automotive-incubator') aliases.push('incubators');
	if (facility.id === 'food-water') aliases.push('analytical laboratory');
	if (facility.id === 'design-centre') aliases.push('design centre');
	if (facility.id === 'digital-hub') aliases.push('digital hub');
	if (facility.id === 'renewable-energy') aliases.push('renewable energy centre');
	return aliases.map(normalize).filter(Boolean);
};

export default function VRTourScreen() {
	const params = useLocalSearchParams<{ id?: string }>();
	const facilityId = params.id as string | undefined;

	const [facilityWithTour, setFacilityWithTour] = useState<FacilityWithTour | null>(null);
	const [tenants, setTenants] = useState<Tenant[]>([]);
	const [loading, setLoading] = useState(true);
	const [viewMode, setViewMode] = useState<ViewMode>('panorama');
	const [currentSection, setCurrentSection] = useState(0);
	const [currentSceneId, setCurrentSceneId] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;
		async function loadTour() {
			if (!facilityId) {
				setFacilityWithTour(null);
				setTenants([]);
				setLoading(false);
				return;
			}

			setLoading(true);
			setCurrentSection(0);
			setCurrentSceneId(null);
			setViewMode('panorama');

			try {
				const facility = await facilitiesService.getFacilityWithTour(facilityId);
				if (!isMounted) return;
				setFacilityWithTour(facility);

				if (!facility) {
					setTenants([]);
					return;
				}

				const aliases = getFacilityAliases(facility);
				const dbTenants = await tenantService.getTenants(200);
				if (!isMounted) return;

				const matched = (dbTenants || []).filter((tenant) => {
					const tenantLoc = normalize(tenant.location);
					return aliases.some((alias) => tenantLoc.includes(alias) || alias.includes(tenantLoc));
				});
				setTenants(matched);
			} catch (error) {
				console.error('Error loading VR tour:', error);
				if (isMounted) {
					setFacilityWithTour(null);
					setTenants([]);
				}
			} finally {
				if (isMounted) setLoading(false);
			}
		}

		loadTour();
		return () => {
			isMounted = false;
		};
	}, [facilityId]);

	const scenesById = useMemo(() => {
		if (!facilityWithTour) return {};
		return facilityWithTour.scenes.reduce<Record<string, any>>((acc, scene: VRScene) => {
			let image = scene.image_url?.startsWith('http')
				? scene.image_url
				: facilitiesService.getImageUrl(scene.image_url, facilityWithTour.id);
			if (image == null || image === '') {
				image = facilitiesService.getImageUrl('renewableenergy.jpeg', 'renewable-energy');
			}
			acc[scene.id] = {
				id: scene.id,
				title: scene.title,
				image,
				regions: scene.regions || [],
				hotspots: (scene.hotspots || []).map((hotspot: VRHotspot) => ({
					id: hotspot.id,
					text: hotspot.text,
					position: hotspot.position,
					targetSceneId: hotspot.target_scene_id,
				})),
			};
			return acc;
		}, {});
	}, [facilityWithTour]);

	if (loading) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				<ActivityIndicator size="large" color="#3B6E8F" />
				<Text className="mt-4 text-muted-foreground">Loading tour...</Text>
			</View>
		);
	}

	if (!facilityId || !facilityWithTour) {
		return (
			<ScreenScrollView>
				<View className="flex-1 items-center justify-center py-12 px-6">
					<Text className="text-xl font-semibold text-foreground mb-4">Tour unavailable</Text>
					<Text className="text-center text-muted-foreground mb-6">
						We could not find the requested virtual tour. Please select a facility from the VR Tours page.
					</Text>
					<Pressable
						className="px-6 py-3 rounded-full bg-primary"
						onPress={() => router.replace('/(tabs)/vr-tours')}
					>
						<Text className="text-white font-semibold">Back to VR Tours</Text>
					</Pressable>
				</View>
			</ScreenScrollView>
		);
	}

	const activeSceneId = currentSceneId ?? facilityWithTour.initialSceneId;
	const activeScene = activeSceneId ? scenesById[activeSceneId] : undefined;
	const hasSections = facilityWithTour.sections.length > 0;
	const section = hasSections ? facilityWithTour.sections[currentSection] : undefined;

	const handleHotspotClick = (hotspotId: string) => {
		if (!activeScene) return;
		const hotspot = activeScene.hotspots.find((h: { id: string; targetSceneId?: string }) => h.id === hotspotId);
		if (hotspot?.targetSceneId) {
			setCurrentSceneId(hotspot.targetSceneId);
		}
	};

	return (
		<View className="flex-1 bg-background">
			<View className="px-6 pt-12 pb-6 flex-row items-center justify-between" style={{ backgroundColor: facilityWithTour.color }}>
				<Pressable onPress={() => router.back()} className="p-2 bg-white/20 rounded-full">
					<Feather name="arrow-left" size={24} color="#FFFFFF" />
				</Pressable>
				<View className="items-center">
					<Text className="text-white text-lg font-bold">{facilityWithTour.name}</Text>
					<Text className="text-white/80 text-xs">
						{viewMode === 'panorama' && activeScene ? activeScene.title : 'Virtual Tour Details'}
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

			{viewMode === 'panorama' && activeScene ? (
				<PanoramaViewer
					imageUrl={activeScene.image}
					title={activeScene.title}
					hotspots={activeScene.hotspots}
					regions={activeScene.regions}
					onHotspotClick={handleHotspotClick}
				/>
			) : (
				<ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
					{section ? (
						<View className="bg-card rounded-2xl p-6 shadow-sm border border-border mb-6">
							<View className="flex-row justify-between items-center mb-4 pb-4 border-b border-border">
								<View>
									<Text className="text-sm text-muted-foreground uppercase font-semibold">Current Location</Text>
									<Text className="text-2xl font-bold text-foreground mt-1">{section.title}</Text>
								</View>
								<View className="bg-primary/10 px-3 py-1 rounded-full">
									<Text className="text-primary font-bold">
										{currentSection + 1}/{facilityWithTour.sections.length}
									</Text>
								</View>
							</View>

							<Text className="text-base text-muted-foreground leading-6 mb-6">
								{section.description}
							</Text>

							<Text className="text-lg font-semibold text-foreground mb-4">Key Features</Text>
							{(section.details || []).map((detail, index) => (
								<View key={index} className="flex-row items-center mb-3">
									<View className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: facilityWithTour.color }} />
									<Text className="text-base text-foreground flex-1">{detail}</Text>
								</View>
							))}

							{section.has_vr && section.vr_scene_id && (
								<Pressable
									className="mt-6 flex-row items-center justify-center px-6 py-3 rounded-full"
									style={{ backgroundColor: facilityWithTour.color }}
									onPress={() => {
										setCurrentSceneId(section.vr_scene_id!);
										setViewMode('panorama');
									}}
								>
									<Feather name="globe" size={20} color="#FFFFFF" />
									<Text className="ml-2 text-white font-semibold">View 360° Panorama</Text>
								</Pressable>
							)}
						</View>
					) : (
						<View className="bg-card rounded-2xl p-6 shadow-sm border border-border mb-6">
							<Text className="text-lg font-semibold text-foreground mb-2">Tour Details coming soon</Text>
							<Text className="text-muted-foreground">
								This facility does not have sectioned details yet. Explore the panorama to view the space.
							</Text>
						</View>
					)}

					<View className="mb-6">
						<Text className="text-lg font-semibold text-foreground mb-4">Tenants in this Wing</Text>
						{tenants.length === 0 && (
							<Text className="text-muted-foreground">No tenants listed for this facility.</Text>
						)}
						{tenants.map(tenant => (
							<Pressable
								key={tenant.id}
								className="bg-card p-4 rounded-xl mb-3 flex-row items-center border border-border active:opacity-90"
								onPress={() =>
									router.push({
										pathname: '/tenant-detail',
										params: {
											id: tenant.id,
											name: tenant.name,
											tenant: JSON.stringify(tenant),
										},
									})
								}
							>
								<View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3">
									<TenantLogo name={tenant.name} logoUrl={tenant.logo_url} />
								</View>
								<View className="flex-1">
									<Text className="font-semibold text-foreground">{tenant.name}</Text>
									<Text className="text-xs text-muted-foreground">{tenant.description}</Text>
								</View>
								<Feather name="chevron-right" size={18} color="rgb(var(--muted-foreground))" />
							</Pressable>
						))}
					</View>
				</ScrollView>
			)}

			{viewMode === 'sections' && hasSections && (
				<View className="flex-row justify-between items-center p-6 border-t border-border bg-background">
					<Pressable
						className={`flex-row items-center ${currentSection === 0 ? 'opacity-50' : 'active:opacity-70'}`}
						onPress={() => {
							const prevSection = Math.max(0, currentSection - 1);
							setCurrentSection(prevSection);
						}}
						disabled={currentSection === 0}
					>
						<Feather name="chevron-left" size={24} color="rgb(var(--foreground))" />
						<Text className="ml-2 font-semibold text-foreground">Previous</Text>
					</Pressable>

					<View className="flex-row gap-2">
						{facilityWithTour.sections.map((_, index) => (
							<View
								key={index}
								className={`w-2 h-2 rounded-full ${index === currentSection ? '' : 'bg-muted'}`}
								style={index === currentSection ? { backgroundColor: facilityWithTour.color } : {}}
							/>
						))}
					</View>

					<Pressable
						className={`flex-row items-center ${currentSection === facilityWithTour.sections.length - 1 ? 'opacity-50' : 'active:opacity-70'}`}
						onPress={() => {
							const nextSection = Math.min(facilityWithTour.sections.length - 1, currentSection + 1);
							setCurrentSection(nextSection);
						}}
						disabled={currentSection === facilityWithTour.sections.length - 1}
					>
						<Text className="mr-2 font-semibold text-foreground">Next</Text>
						<Feather name="chevron-right" size={24} color="rgb(var(--foreground))" />
					</Pressable>
				</View>
			)}
		</View>
	);
}