import React, { useCallback, useRef, useState } from 'react';
import {
	Dimensions,
	Image,
	ImageSourcePropType,
	Pressable,
	ScrollView,
	View,
} from 'react-native';
import { Text } from '@/components/ui/text';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface PanoramaHotspot {
	id: string;
	text?: string;
	position: { x: number; y: number; z: number };
	targetSceneId?: string;
}

export interface PanoramaRegion {
	id: string;
	name: string;
	angle: number;
	width: number;
}

interface PanoramaViewerProps {
	imageUrl: string | number | ImageSourcePropType;
	title?: string;
	hotspots?: PanoramaHotspot[];
	regions?: PanoramaRegion[];
	onHotspotClick?: (hotspotId: string) => void;
}

/**
 * Displays a 360° equirectangular panorama image with pan-to-explore.
 * Hotspots overlay for navigation between scenes.
 */
export function PanoramaViewer({
	imageUrl,
	title,
	hotspots = [],
	regions = [],
	onHotspotClick,
}: PanoramaViewerProps) {
	const scrollRef = useRef<ScrollView>(null);
	const [containerHeight, setContainerHeight] = useState(SCREEN_HEIGHT * 0.5);

	// Equirectangular 360 images are typically 2:1 aspect (width = 2 * height)
	const imageHeight = containerHeight;
	const imageWidth = imageHeight * 2;

	const imageSource =
		typeof imageUrl === 'number'
			? (imageUrl as ImageSourcePropType)
			: typeof imageUrl === 'string'
				? { uri: imageUrl }
				: imageUrl;

	// Convert spherical position (x,y,z) to approximate 2D overlay position
	// x: azimuth (0-360), y: elevation (-90 to 90)
	const sphericalToScreen = useCallback(
		(pos: { x: number; y: number; z: number }) => {
			const azimuth = ((pos.x * 180) / Math.PI + 360) % 360;
			const elevation = (pos.y * 180) / Math.PI;
			// Map to overlay: azimuth -> left %, elevation -> top %
			const leftPct = (azimuth / 360) * 100;
			const topPct = 50 - (elevation / 90) * 50;
			return { left: Math.max(0, Math.min(100, leftPct)), top: Math.max(0, Math.min(100, topPct)) };
		},
		[]
	);

	return (
		<View
			className="flex-1 bg-black"
			onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
		>
			{title && (
				<View className="absolute top-2 left-0 right-0 z-10 items-center px-4">
					<Text className="text-white text-sm font-semibold text-center" numberOfLines={1}>
						{title}
					</Text>
					<Text className="text-white/70 text-xs mt-0.5">Drag to look around</Text>
				</View>
			)}

			<ScrollView
				ref={scrollRef}
				horizontal
				pagingEnabled={false}
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={{ width: imageWidth }}
				style={{ flex: 1 }}
				decelerationRate="fast"
			>
				<Image
					source={imageSource}
					style={{ width: imageWidth, height: imageHeight }}
					resizeMode="cover"
				/>
			</ScrollView>

			{/* Hotspot overlays - positioned by spherical coords */}
			{hotspots.length > 0 && onHotspotClick && (
				<View
					className="absolute inset-0"
					pointerEvents="box-none"
					style={{ width: SCREEN_WIDTH, height: containerHeight }}
				>
					{hotspots.map((hotspot) => {
						const { left, top } = sphericalToScreen(hotspot.position);
						return (
							<Pressable
								key={hotspot.id}
								className="absolute w-10 h-10 -ml-5 -mt-5 items-center justify-center rounded-full bg-white/30 border-2 border-white"
								style={{
									left: `${left}%`,
									top: `${top}%`,
									marginLeft: -20,
									marginTop: -20,
								}}
								onPress={() => onHotspotClick(hotspot.id)}
							>
								<View className="w-3 h-3 rounded-full bg-accent" />
							</Pressable>
						);
					})}
				</View>
			)}
		</View>
	);
}
