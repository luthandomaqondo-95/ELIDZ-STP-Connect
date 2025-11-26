import React, { useState, useRef } from 'react';
import { View, ScrollView, Dimensions, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Button } from '@/components/ui/button';

const { width } = Dimensions.get('window');

const slides = [
	{
		id: 1,
		title: 'Discover labs, incubators & opportunities in one place',
		description: 'Access world-class facilities including food & water testing labs, design centres, digital hubs, automotive incubators, and renewable energy resources.',
		icon: 'grid',
	},
	{
		id: 2,
		title: 'Connect with tenants, funders & SMMEs',
		description: 'Build meaningful partnerships with fellow innovators, secure funding opportunities, and collaborate with small and medium enterprises across various sectors.',
		icon: 'users',
	},
	{
		id: 3,
		title: 'Free to join – upgrade for premium benefits',
		description: 'Start exploring immediately with our free tier, or unlock premium features like priority listings, direct messaging, and advanced analytics.',
		icon: 'star',
	},
];

export default function WelcomeScreen() {
	const [currentSlide, setCurrentSlide] = useState(0);
	const scrollViewRef = useRef<ScrollView>(null);

	const handleScroll = (event: any) => {
		const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
		setCurrentSlide(slideIndex);
	};

	const handleNext = () => {
		if (currentSlide < slides.length - 1) {
			const nextSlide = currentSlide + 1;
			setCurrentSlide(nextSlide);
			scrollViewRef.current?.scrollTo({
				x: nextSlide * width,
				animated: true,
			});
		} else {
			router.replace('/(auth)/auth-choice');
		}
	};

	const handleSkip = () => {
		router.replace('/(auth)/auth-choice');
	};

	return (
		<View className="flex-1 bg-background">
			{/* Skip button */}
			<View className="flex-row justify-end px-6 pt-12">
				<Pressable
					onPress={handleSkip}
					className="px-4 py-2 active:opacity-70"
				>
					<Text className="text-muted-foreground text-sm">
						Skip
					</Text>
				</Pressable>
			</View>

			{/* Carousel */}
			<ScrollView
				ref={scrollViewRef}
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				onScroll={handleScroll}
				scrollEventThrottle={16}
				className="flex-1"
			>
				{slides.map((slide) => (
					<View
						key={slide.id}
						className="flex-1 justify-center items-center px-6"
						style={{ width }}
					>
						{/* Icon */}
						<View className="w-30 h-30 rounded-full bg-primary justify-center items-center mb-8">
							<Feather name={slide.icon as any} size={48} color="#FFFFFF" />
						</View>

						{/* Title */}
						<Text className="text-foreground text-center mb-4 text-2xl font-semibold leading-8">
							{slide.title}
						</Text>

						{/* Description */}
						<Text className="text-muted-foreground text-center leading-6 px-4 text-base">
							{slide.description}
						</Text>
					</View>
				))}
			</ScrollView>

			{/* Bottom section */}
			<View className="px-6 pb-12">
				{/* Pagination dots */}
				<View className="flex-row justify-center mb-6">
					{slides.map((_, index) => (
						<View
							key={index}
							className={`w-2 h-2 rounded-full mx-1 ${index === currentSlide ? 'bg-primary opacity-100' : 'bg-muted-foreground opacity-30'
								}`}
						/>
					))}
				</View>

				{/* Continue button */}
				<Button
					onPress={handleNext}
					className="bg-primary py-4 mb-4 rounded-xl items-center active:opacity-90"
				>
					<Text className="text-primary-foreground font-semibold text-base">
						{currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
					</Text>
				</Button>
			</View>
		</View>
	);
}
