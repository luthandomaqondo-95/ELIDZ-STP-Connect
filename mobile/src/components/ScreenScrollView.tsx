import { ScrollView, ScrollViewProps } from "react-native";

import { useScreenInsets } from "../hooks/useScreenInsets";

type ScreenScrollViewProps = ScrollViewProps & {
	insetTop?: boolean;
	insetBottom?: boolean;
};

export function ScreenScrollView({
	children,
	contentContainerStyle,
	style,
	insetTop = true,
	insetBottom = true,
	...scrollViewProps
}: ScreenScrollViewProps) {
	const { paddingTop, paddingBottom, scrollInsetTop, scrollInsetBottom } = useScreenInsets();

	return (
		<ScrollView
			className="flex-1 bg-background"
			style={style}
			contentContainerStyle={[
				{ paddingTop: insetTop ? paddingTop : 0, paddingBottom: insetBottom ? paddingBottom : 0 },
				contentContainerStyle,
			]}
			scrollIndicatorInsets={{
				top: insetTop ? scrollInsetTop : 0,
				bottom: insetBottom ? scrollInsetBottom : 0,
			}}
			{...scrollViewProps}
		>
			{children}
		</ScrollView>
	);
}

