/**
 * Theme constants - Uses colors from theme/colors.ts and global.css for styling
 * Additional constants for spacing, typography, etc. for component compatibility
 */

import { Platform } from 'react-native';
import { COLORS } from '../theme/colors';

// Re-export Colors from theme/colors.ts for compatibility
export const Colors = {
  light: {
    // Map COLORS.light to the expected structure
    primary: COLORS.light.primary,
    secondary: COLORS.light.blue,
    accent: COLORS.light.orange,
    text: COLORS.light.text,
    textSecondary: COLORS.light.grey,
    buttonText: '#FFFFFF',
    link: COLORS.light.blue,
    border: COLORS.light.grey5,
    backgroundRoot: COLORS.light.root,
    backgroundDefault: COLORS.light.card,
    backgroundSecondary: COLORS.light.grey6,
    backgroundTertiary: COLORS.light.grey5,
    success: COLORS.light.constructive,
    warning: COLORS.light.warning,
    error: COLORS.light.destructive,
    tabIconDefault: COLORS.light.grey,
    tabIconSelected: COLORS.light.primary,
  },
  dark: {
    // Map COLORS.dark to the expected structure
    primary: COLORS.dark.primary,
    secondary: COLORS.dark.blue,
    accent: COLORS.dark.orange,
    text: COLORS.dark.text,
    textSecondary: COLORS.dark.grey,
    buttonText: '#FFFFFF',
    link: COLORS.dark.blue,
    border: COLORS.dark.grey5,
    backgroundRoot: COLORS.dark.root,
    backgroundDefault: COLORS.dark.card,
    backgroundSecondary: COLORS.dark.grey6,
    backgroundTertiary: COLORS.dark.grey5,
    success: COLORS.dark.constructive,
    warning: COLORS.dark.warning,
    error: COLORS.dark.destructive,
    tabIconDefault: COLORS.dark.grey,
    tabIconSelected: COLORS.dark.primary,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 20,
  '2xl': 32,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  button: 8,
  card: 12,
  md: 8,
  lg: 12,
  full: 9999,
  '2xl': 16,
};

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  fab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 4,
  },
};

export const Typography = {
  h1: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  h3: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  h4: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
