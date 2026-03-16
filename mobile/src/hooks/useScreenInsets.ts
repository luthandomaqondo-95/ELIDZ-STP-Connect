import { useSafeAreaInsets } from "react-native-safe-area-context";

export function useScreenInsets() {
  const insets = useSafeAreaInsets();

  return {
    paddingTop: insets.top + 20,
    paddingBottom: insets.bottom + 20,
    scrollInsetTop: insets.top,
    scrollInsetBottom: insets.bottom + 16,
  };
}

