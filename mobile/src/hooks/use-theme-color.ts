import { useColorScheme as useNativeColorScheme } from "react-native";

import { NAV_THEME } from "../theme/colors";

type Scheme = "light" | "dark";

export function useColorScheme() {
  const native = useNativeColorScheme();
  const colorScheme: Scheme = native === "dark" ? "dark" : "light";
  return {
    colorScheme,
    isDarkColorScheme: colorScheme === "dark",
  };
}

type ThemeProps = {
  light?: string;
  dark?: string;
};

export function useThemeColor(props: ThemeProps, colorName: keyof typeof NAV_THEME.light.colors) {
  const { colorScheme } = useColorScheme();
  const colorFromProps = props[colorScheme];
  if (colorFromProps) {
    return colorFromProps;
  }

  return NAV_THEME[colorScheme].colors[colorName];
}

