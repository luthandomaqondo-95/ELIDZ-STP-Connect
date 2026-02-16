import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

export function useScreenInsets() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  return {
    paddingTop: insets.top + 20,
    paddingBottom: insets.bottom + 20,
    scrollInsetTop: insets.top,
    scrollInsetBottom: insets.bottom + 16,
  };
}

