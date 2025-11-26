import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

import { Spacing } from "../constants/theme";

export function useScreenInsets() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  return {
    paddingTop: insets.top + 20,
    paddingBottom: insets.bottom + Spacing.xl,
    scrollInsetTop: insets.top,
    scrollInsetBottom: insets.bottom + 16,
  };
}

