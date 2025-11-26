import { ScrollView, ScrollViewProps } from "react-native";

import { useTheme } from "../hooks/useTheme";
import { useScreenInsets } from "../hooks/useScreenInsets";
import { Spacing } from "@/constants/theme";

export function ScreenScrollView({
	children,
	contentContainerStyle,
	style,
	...scrollViewProps
}: ScrollViewProps) {
	const { colors } = useTheme();
	const { paddingTop, paddingBottom, scrollInsetTop, scrollInsetBottom } = useScreenInsets();

	return (
		<ScrollView
			style={[
				{ flex: 1, backgroundColor: colors.backgroundRoot },
				style,
			]}
			contentContainerStyle={[
				{
					// paddingHorizontal: Spacing.sm, 
					paddingTop, paddingBottom
				},
				contentContainerStyle,
			]}
			scrollIndicatorInsets={{ top: scrollInsetTop, bottom: scrollInsetBottom }}
			{...scrollViewProps}
		>
			{children}
		</ScrollView>
	);
}

