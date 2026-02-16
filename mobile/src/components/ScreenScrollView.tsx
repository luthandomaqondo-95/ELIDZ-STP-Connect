import { ScrollView, ScrollViewProps } from "react-native";

import { useScreenInsets } from "../hooks/useScreenInsets";

export function ScreenScrollView({
	children,
	contentContainerStyle,
	style,
	...scrollViewProps
}: ScrollViewProps) {
	const { paddingTop, paddingBottom, scrollInsetTop, scrollInsetBottom } = useScreenInsets();

	return (
		<ScrollView
			className="flex-1 bg-background"
			style={style}
			contentContainerStyle={[{ paddingTop, paddingBottom }, contentContainerStyle]}
			scrollIndicatorInsets={{ top: scrollInsetTop, bottom: scrollInsetBottom }}
			{...scrollViewProps}
		>
			{children}
		</ScrollView>
	);
}

