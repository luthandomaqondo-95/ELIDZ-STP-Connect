import { Platform } from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewProps,
} from "react-native-keyboard-controller";

import { useScreenInsets } from "../hooks/useScreenInsets";
import { ScreenScrollView } from "./ScreenScrollView";

type ScreenKeyboardAwareScrollViewExtraProps = {
	insetTop?: boolean;
	insetBottom?: boolean;
};

export function ScreenKeyboardAwareScrollView({
  children,
  contentContainerStyle,
  style,
  keyboardShouldPersistTaps = "handled",
  insetTop = true,
  insetBottom = true,
  ...scrollViewProps
}: KeyboardAwareScrollViewProps & ScreenKeyboardAwareScrollViewExtraProps) {
  const { paddingTop, paddingBottom, scrollInsetBottom } = useScreenInsets();

  if (Platform.OS === "web") {
    return (
      <ScreenScrollView
        style={style}
        contentContainerStyle={contentContainerStyle}
        insetTop={insetTop}
        insetBottom={insetBottom}
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
        {
          paddingTop: insetTop ? paddingTop : 0,
          paddingBottom: insetBottom ? paddingBottom : 0,
        },
        contentContainerStyle,
      ]}
      scrollIndicatorInsets={{ bottom: insetBottom ? scrollInsetBottom : 0 }}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      {...scrollViewProps}
    >
      {children}
    </KeyboardAwareScrollView>
  );
}

