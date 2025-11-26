// ELIDZ-STP Theme System
// Comprehensive color system and utilities for consistent theming

export { COLORS, NAV_THEME } from './colors';
export { withOpacity } from './with-opacity';

// Re-export theme constants for convenience
export {
  Colors,
  Spacing,
  BorderRadius,
  Shadow,
  Typography,
  Fonts
} from '../constants/theme';

// Theme utilities
export { useTheme } from '../hooks/useTheme';
export { useColorScheme } from '../hooks/use-theme-color';

// Type definitions for theme system
export interface ThemeColors {
  // Base colors
  background: string;
  backgroundRoot: string;
  backgroundDefault: string;
  backgroundSecondary: string;

  // Text colors
  text: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  buttonText: string;

  // Brand colors
  primary: string;
  secondary: string;
  accent: string;

  // Semantic colors
  success: string;
  warning: string;
  error: string;
  info: string;
  destructive: string;
  constructive: string;
  notification: string;

  // Extended palette
  blue: string;
  green: string;
  orange: string;
  purple: string;
  pink: string;
  teal: string;
  indigo: string;
  cyan: string;

  // User role colors
  roleEntrepreneur: string;
  roleResearcher: string;
  roleSME: string;
  roleStudent: string;
  roleInvestor: string;
  roleTenant: string;

  // Status colors
  online: string;
  offline: string;
  pending: string;
  unread: string;

  // UI elements
  border: string;
  borderLight: string;
  card: string;
  input: string;
  shadow: string;
}

export interface Theme {
  colors: ThemeColors;
  isDark: boolean;
}
