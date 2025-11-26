import { Colors } from "../constants/theme";
import { useColorScheme } from "react-native";

export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[colorScheme ?? "light"];

  return {
    colors,
    isDark,
  };
}

