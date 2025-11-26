import React from "react";
import { FlatList, FlatListProps } from "react-native";

import { useTheme } from "../hooks/useTheme";
import { useScreenInsets } from "../hooks/useScreenInsets";
import { Spacing } from "../constants/theme";

export function ScreenFlatList<T>({
  contentContainerStyle,
  style,
  ...flatListProps
}: FlatListProps<T>) {
  const { colors } = useTheme();
  const { paddingTop, paddingBottom, scrollInsetTop, scrollInsetBottom } = useScreenInsets();

  return (
    <FlatList
      style={[
        { flex: 1, backgroundColor: colors.backgroundRoot },
        style,
      ]}
      contentContainerStyle={[
        { paddingHorizontal: Spacing.xl, paddingTop, paddingBottom },
        contentContainerStyle,
      ]}
      scrollIndicatorInsets={{ top: scrollInsetTop, bottom: scrollInsetBottom }}
      {...flatListProps}
    />
  );
}

