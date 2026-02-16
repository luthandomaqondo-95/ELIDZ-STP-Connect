import React from "react";
import { FlatList, FlatListProps } from "react-native";

import { useScreenInsets } from "../hooks/useScreenInsets";

export function ScreenFlatList<T>({
  contentContainerStyle,
  style,
  ...flatListProps
}: FlatListProps<T>) {
  const { paddingTop, paddingBottom, scrollInsetTop, scrollInsetBottom } = useScreenInsets();

  return (
    <FlatList
      className="flex-1 bg-background"
      style={style}
      contentContainerStyle={[{ paddingHorizontal: 20, paddingTop, paddingBottom }, contentContainerStyle]}
      scrollIndicatorInsets={{ top: scrollInsetTop, bottom: scrollInsetBottom }}
      {...flatListProps}
    />
  );
}

