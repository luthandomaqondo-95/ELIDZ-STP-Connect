import { Platform } from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewProps,
} from "react-native-keyboard-controller";

import { useScreenInsets } from "../hooks/useScreenInsets";
import { ScreenScrollView } from "./ScreenScrollView";

export function ScreenKeyboardAwareScrollView({
  children,
  contentContainerStyle,
  style,
  keyboardShouldPersistTaps = "handled",
  ...scrollViewProps
}: KeyboardAwareScrollViewProps) {
  const { paddingTop, paddingBottom, scrollInsetBottom } = useScreenInsets();

  if (Platform.OS === "web") {
    return (
      <ScreenScrollView
        style={style}
        contentContainerStyle={contentContainerStyle}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        {...scrollViewProps}
      >
        {children}
      </ScreenScrollView>
    );
  }

  return (
    <KeyboardAwareScrollView
      className="flex-1"
      style={style}
      contentContainerStyle={[
        { paddingTop, paddingBottom },
        contentContainerStyle,
      ]}
      scrollIndicatorInsets={{ bottom: scrollInsetBottom }}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      {...scrollViewProps}
    >
      {children}
    </KeyboardAwareScrollView>
  );
}

