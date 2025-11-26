import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenScrollView } from '@/components/ScreenScrollView';
import { PanoramaViewer } from '@/components/mixed-experiences/PanoramaViewer';
import { getFacilityById, getTenantsByLocation, getVRTourDataById } from '@/data/vrToursData';

type ViewMode = 'panorama' | 'sections';

export default function VRTourScreen() {
	const params = useLocalSearchParams<{ id?: string }>();
	const facilityId = params.id as string | undefined;

	const tourData = useMemo(() => (facilityId ? getVRTourDataById(facilityId) : undefined), [facilityId]);
	const facilityMeta = useMemo(() => (facilityId ? getFacilityById(facilityId) : undefined), [facilityId]);
	const tenants = useMemo(
		() => (facilityMeta ? getTenantsByLocation(facilityMeta.location) : []),
		[facilityMeta]
	);

	const [viewMode, setViewMode] = useState<ViewMode>('panorama');
	const [currentSection, setCurrentSection] = useState(0);
	const [currentSceneId, setCurrentSceneId] = useState<string | null>(null);

	useEffect(() => {
		setCurrentSection(0);
		setCurrentSceneId(null);
		setViewMode('panorama');
	}, [facilityId]);

	if (!facilityId || !tourData || !facilityMeta) {
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

	const activeSceneId = currentSceneId ?? tourData.initialSceneId;
	const activeScene = tourData.scenes[activeSceneId];
	const hasSections = tourData.sections.length > 0;
	const section = hasSections ? tourData.sections[currentSection] : undefined;

	const handleHotspotClick = (hotspotId: string) => {
		if (!activeScene) return;
		const hotspot = activeScene.hotspots.find(h => h.id === hotspotId);
		if (hotspot?.targetSceneId) {
			setCurrentSceneId(hotspot.targetSceneId);
		}
	};

	return (
		<View className="flex-1 bg-background">
			<View className="px-6 pt-12 pb-6 flex-row items-center justify-between" style={{ backgroundColor: tourData.color }}>
				<Pressable onPress={() => router.back()} className="p-2 bg-white/20 rounded-full">
					<Feather name="arrow-left" size={24} color="#FFFFFF" />
				</Pressable>
				<View className="items-center">
					<Text className="text-white text-lg font-bold">{tourData.name}</Text>
					<Text className="text-white/80 text-xs">
						{viewMode === 'panorama' && activeScene ? activeScene.title : 'Virtual Tour Details'}
					</Text>
				</View>
				<View className="flex-row gap-2">
					<Pressable
						className={`p-2 rounded-full ${viewMode === 'panorama' ? 'bg-white text-primary' : 'bg-white/20'}`}
						onPress={() => setViewMode('panorama')}
					>
						<Feather name="globe" size={20} color={viewMode === 'panorama' ? tourData.color : '#FFFFFF'} />
					</Pressable>
					<Pressable
						className={`p-2 rounded-full ${viewMode === 'sections' ? 'bg-white text-primary' : 'bg-white/20'}`}
						onPress={() => hasSections && setViewMode('sections')}
						disabled={!hasSections}
					>
						<Feather name="list" size={20} color={viewMode === 'sections' ? tourData.color : '#FFFFFF'} />
					</Pressable>
				</View>
			</View>

			{viewMode === 'panorama' && activeScene ? (
				<PanoramaViewer
					imageUrl={activeScene.image}
					title={activeScene.title}
					hotspots={activeScene.hotspots}
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
										{currentSection + 1}/{tourData.sections.length}
									</Text>
								</View>
							</View>

							<Text className="text-base text-muted-foreground leading-6 mb-6">
								{section.description}
							</Text>

							<Text className="text-lg font-semibold text-foreground mb-4">Key Features</Text>
							{section.details.map((detail, index) => (
								<View key={index} className="flex-row items-center mb-3">
									<View className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: tourData.color }} />
									<Text className="text-base text-foreground flex-1">{detail}</Text>
								</View>
							))}
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

			{viewMode === 'sections' && hasSections && (
				<View className="flex-row justify-between items-center p-6 border-t border-border bg-background">
					<Pressable
						className={`flex-row items-center ${currentSection === 0 ? 'opacity-50' : 'active:opacity-70'}`}
						onPress={() => setCurrentSection(Math.max(0, currentSection - 1))}
						disabled={currentSection === 0}
					>
						<Feather name="chevron-left" size={24} color="rgb(var(--foreground))" />
						<Text className="ml-2 font-semibold text-foreground">Previous</Text>
					</Pressable>

					<View className="flex-row gap-2">
						{tourData.sections.map((_, index) => (
							<View
								key={index}
								className={`w-2 h-2 rounded-full ${index === currentSection ? '' : 'bg-muted'}`}
								style={index === currentSection ? { backgroundColor: tourData.color } : {}}
							/>
						))}
					</View>

					<Pressable
						className={`flex-row items-center ${currentSection === tourData.sections.length - 1 ? 'opacity-50' : 'active:opacity-70'}`}
						onPress={() => setCurrentSection(Math.min(tourData.sections.length - 1, currentSection + 1))}
						disabled={currentSection === tourData.sections.length - 1}
					>
						<Text className="mr-2 font-semibold text-foreground">Next</Text>
						<Feather name="chevron-right" size={24} color="rgb(var(--foreground))" />
					</Pressable>
				</View>
			)}
		</View>
	);
}