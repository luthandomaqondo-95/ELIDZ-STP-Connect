import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { Platform } from 'react-native';

// ELIDZ-STP Brand Colors - EXACT Logo Colors
// These colors are extracted directly from the official East London IDZ logo
// Blue: Used for "east london" text in logo - RGB(0, 33, 71)
// Orange: Used for "idz" text and "SCIENCE & TECHNOLOGY PARK" text - RGB(255, 102, 0)
const ELIDZ_BRAND_COLORS = {
    // Primary Brand Colors - EXACT Blue from logo
    primary: '#002147',          // ELIDZ Navy Blue - EXACT logo blue (RGB: 0, 33, 71)
    primaryDark: '#001A36',      // Darker navy for dark mode
    secondary: '#FF6600',        // ELIDZ Orange - EXACT logo orange (RGB: 255, 102, 0)
    secondaryDark: '#CC5200',    // Darker orange for dark mode
    accent: '#FF6600',           // ELIDZ Orange - EXACT logo orange (RGB: 255, 102, 0)
    accentDark: '#CC5200',       // Darker orange for dark mode

    // Extended Brand Palette
    blue: '#002147',             // ELIDZ Navy Blue - EXACT logo blue (RGB: 0, 33, 71)
    green: '#28A745',
    orange: '#FF6600',           // ELIDZ Orange - EXACT logo orange (RGB: 255, 102, 0)
    purple: '#6F42C1',
    pink: '#E83E8C',
    teal: '#17A2B8',
    indigo: '#6610F2',
    cyan: '#20C997',

    // Semantic Colors
    success: '#28A745',
    warning: '#FFC107',
    error: '#DC3545',
    info: '#17A2B8',
    destructive: '#DC3545',
    constructive: '#28A745',
    notification: '#FF6B6B',

    // User Role Colors (for networking)
    role: {
        entrepreneur: '#28A745',    // Green
        researcher: '#002147',      // ELIDZ Navy Blue
        sme: '#FF6600',             // ELIDZ Orange
        student: '#6F42C1',         // Purple
        investor: '#E83E8C',        // Pink
        tenant: '#17A2B8',          // Teal
    },

    // Status Colors
    online: '#28A745',
    offline: '#6C757D',
    pending: '#FFC107',
    unread: '#DC3545',

    // Gradient Colors (for auth screens)
    gradientStart: '#0a1628',      // Dark navy gradient start
    gradientMid: '#122a4d',         // Medium navy gradient middle
    gradientEnd: '#1a3a5c',         // Lighter navy gradient end
    gradientMessageEnd: '#003366',  // Message header gradient end (lighter blue)

    // Gray Scale Colors
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',             // Light gray for placeholders
    gray400: '#9CA3AF',             // Medium gray for placeholders
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',             // Dark gray
    gray900: '#111827',
    grayMuted: 'rgb(153, 153, 158)', // Muted gray

    // UI Utility Colors
    googleBlue: '#4285F4',          // Google brand blue
    white: '#FFFFFF',
    black: '#000000',
    red: '#DC3545',
    redLight: '#EF4444',            // Light red variant
    redDark: '#FE4336',             // Dark red variant
    redDarker: '#FF382B',           // Darker red variant
    iconGray: '#CBD5E0',            // Light gray for icons
    iconGrayDark: '#6C757D',        // Dark gray for icons

    // Opacity variants (for overlays and backgrounds)
    whiteOpacity10: 'rgba(255, 255, 255, 0.1)',
    whiteOpacity15: 'rgba(255, 255, 255, 0.15)',
    whiteOpacity20: 'rgba(255, 255, 255, 0.2)',
    whiteOpacity50: 'rgba(255, 255, 255, 0.5)',
    whiteOpacity70: 'rgba(255, 255, 255, 0.7)',
    whiteOpacity80: 'rgba(255, 255, 255, 0.8)',
    blackOpacity50: 'rgba(0, 0, 0, 0.5)',
    blackOpacity30: 'rgba(0, 0, 0, 0.3)',
} as const;

// System Colors with ELIDZ Branding
const SYSTEM_COLORS = {
    white: '#FFFFFF',
    black: '#000000',

    light: {
        // Base colors
        background: '#FFFFFF',
        backgroundRoot: '#F2F2F7',
        backgroundDefault: '#FFFFFF',
        backgroundSecondary: '#F8F9FA',

        // Text colors
        text: '#212529',
        textPrimary: '#212529',
        textSecondary: '#6C757D',
        textTertiary: '#ADB5BD',
        buttonText: '#FFFFFF',

        // Brand colors
        primary: ELIDZ_BRAND_COLORS.primary,
        secondary: ELIDZ_BRAND_COLORS.secondary,
        accent: ELIDZ_BRAND_COLORS.accent,

        // Semantic colors
        success: ELIDZ_BRAND_COLORS.success,
        warning: ELIDZ_BRAND_COLORS.warning,
        error: ELIDZ_BRAND_COLORS.error,
        info: ELIDZ_BRAND_COLORS.info,
        destructive: ELIDZ_BRAND_COLORS.destructive,
        constructive: ELIDZ_BRAND_COLORS.constructive,
        notification: ELIDZ_BRAND_COLORS.notification,

        // UI elements
        border: '#E9ECEF',
        borderLight: '#F8F9FA',
        card: '#FFFFFF',
        input: '#FFFFFF',
        shadow: 'rgba(0, 0, 0, 0.1)',

        // Gradient colors
        gradientStart: ELIDZ_BRAND_COLORS.gradientStart,
        gradientMid: ELIDZ_BRAND_COLORS.gradientMid,
        gradientEnd: ELIDZ_BRAND_COLORS.gradientEnd,
        gradientMessageEnd: ELIDZ_BRAND_COLORS.gradientMessageEnd,

        // Gray scale
        gray50: ELIDZ_BRAND_COLORS.gray50,
        gray100: ELIDZ_BRAND_COLORS.gray100,
        gray200: ELIDZ_BRAND_COLORS.gray200,
        gray300: ELIDZ_BRAND_COLORS.gray300,
        gray400: ELIDZ_BRAND_COLORS.gray400,
        gray500: ELIDZ_BRAND_COLORS.gray500,
        gray600: ELIDZ_BRAND_COLORS.gray600,
        gray700: ELIDZ_BRAND_COLORS.gray700,
        gray800: ELIDZ_BRAND_COLORS.gray800,
        gray900: ELIDZ_BRAND_COLORS.gray900,
        grayMuted: ELIDZ_BRAND_COLORS.grayMuted,

        // Utility colors
        googleBlue: ELIDZ_BRAND_COLORS.googleBlue,
        white: ELIDZ_BRAND_COLORS.white,
        black: ELIDZ_BRAND_COLORS.black,
        red: ELIDZ_BRAND_COLORS.red,
        redLight: ELIDZ_BRAND_COLORS.redLight,
        redDark: ELIDZ_BRAND_COLORS.redDark,
        redDarker: ELIDZ_BRAND_COLORS.redDarker,
        iconGray: ELIDZ_BRAND_COLORS.iconGray,
        iconGrayDark: ELIDZ_BRAND_COLORS.iconGrayDark,

        // Opacity variants
        whiteOpacity10: ELIDZ_BRAND_COLORS.whiteOpacity10,
        whiteOpacity15: ELIDZ_BRAND_COLORS.whiteOpacity15,
        whiteOpacity20: ELIDZ_BRAND_COLORS.whiteOpacity20,
        whiteOpacity50: ELIDZ_BRAND_COLORS.whiteOpacity50,
        whiteOpacity70: ELIDZ_BRAND_COLORS.whiteOpacity70,
        whiteOpacity80: ELIDZ_BRAND_COLORS.whiteOpacity80,
        blackOpacity50: ELIDZ_BRAND_COLORS.blackOpacity50,
        blackOpacity30: ELIDZ_BRAND_COLORS.blackOpacity30,

        // Placeholder colors (commonly used)
        placeholder: ELIDZ_BRAND_COLORS.gray400,
        placeholderLight: ELIDZ_BRAND_COLORS.gray300,

        // Extended palette
        blue: ELIDZ_BRAND_COLORS.blue,
        green: ELIDZ_BRAND_COLORS.green,
        orange: ELIDZ_BRAND_COLORS.orange,
        purple: ELIDZ_BRAND_COLORS.purple,
        pink: ELIDZ_BRAND_COLORS.pink,
        teal: ELIDZ_BRAND_COLORS.teal,
        indigo: ELIDZ_BRAND_COLORS.indigo,
        cyan: ELIDZ_BRAND_COLORS.cyan,

        // User role colors
        roleEntrepreneur: ELIDZ_BRAND_COLORS.role.entrepreneur,
        roleResearcher: ELIDZ_BRAND_COLORS.role.researcher,
        roleSME: ELIDZ_BRAND_COLORS.role.sme,
        roleStudent: ELIDZ_BRAND_COLORS.role.student,
        roleInvestor: ELIDZ_BRAND_COLORS.role.investor,
        roleTenant: ELIDZ_BRAND_COLORS.role.tenant,

        // Status colors
        online: ELIDZ_BRAND_COLORS.online,
        offline: ELIDZ_BRAND_COLORS.offline,
        pending: ELIDZ_BRAND_COLORS.pending,
        unread: ELIDZ_BRAND_COLORS.unread,
    },

    dark: {
        // Base colors
        background: '#121212',
        backgroundRoot: '#000000',
        backgroundDefault: '#1E1E1E',
        backgroundSecondary: '#2A2A2A',

        // Text colors
        text: '#FFFFFF',
        textPrimary: '#FFFFFF',
        textSecondary: '#B0B0B0',
        textTertiary: '#808080',
        buttonText: '#FFFFFF',

        // Brand colors - Use lighter variants for better visibility on dark backgrounds
        primary: '#2E4A6F',  // Lighter navy blue for dark mode (better contrast on dark backgrounds)
        secondary: ELIDZ_BRAND_COLORS.secondary,  // Keep original orange for visibility
        accent: ELIDZ_BRAND_COLORS.accent,  // Keep original orange for visibility

        // Semantic colors
        success: ELIDZ_BRAND_COLORS.success,
        warning: ELIDZ_BRAND_COLORS.warning,
        error: ELIDZ_BRAND_COLORS.error,
        info: ELIDZ_BRAND_COLORS.info,
        destructive: ELIDZ_BRAND_COLORS.destructive,
        constructive: ELIDZ_BRAND_COLORS.constructive,
        notification: ELIDZ_BRAND_COLORS.notification,

        // UI elements (improved contrast for dark mode)
        border: '#404040',
        borderLight: '#3A3A3A',  // Slightly lighter for better visibility
        card: '#1E1E1E',  // Slightly darker for better contrast with background
        input: '#2A2A2A',  // Lighter than card for better input visibility
        shadow: 'rgba(0, 0, 0, 0.5)',  // Stronger shadow for dark mode

        // Gradient colors (slightly lighter for dark mode to maintain visibility)
        gradientStart: '#0d1f3a',
        gradientMid: '#1a3a5c',
        gradientEnd: '#244a6f',
        gradientMessageEnd: '#004477',  // Slightly lighter for dark mode

        // Gray scale (lighter for dark mode)
        gray50: '#1F2937',
        gray100: '#374151',
        gray200: '#4B5563',
        gray300: '#6B7280',
        gray400: '#9CA3AF',
        gray500: '#D1D5DB',
        gray600: '#E5E7EB',
        gray700: '#F3F4F6',
        gray800: '#F9FAFB',
        gray900: '#FFFFFF',
        grayMuted: 'rgba(255, 255, 255, 0.6)',

        // Utility colors
        googleBlue: ELIDZ_BRAND_COLORS.googleBlue,
        white: ELIDZ_BRAND_COLORS.white,
        black: ELIDZ_BRAND_COLORS.black,
        red: ELIDZ_BRAND_COLORS.red,
        redLight: '#FF6B6B',  // Slightly brighter red for dark mode visibility
        redDark: ELIDZ_BRAND_COLORS.redDark,
        redDarker: ELIDZ_BRAND_COLORS.redDarker,
        iconGray: '#B0B0B0',  // Lighter gray for better visibility on dark backgrounds
        iconGrayDark: '#808080',  // Lighter for dark mode

        // Opacity variants
        whiteOpacity10: ELIDZ_BRAND_COLORS.whiteOpacity10,
        whiteOpacity15: ELIDZ_BRAND_COLORS.whiteOpacity15,
        whiteOpacity20: ELIDZ_BRAND_COLORS.whiteOpacity20,
        whiteOpacity50: ELIDZ_BRAND_COLORS.whiteOpacity50,
        whiteOpacity70: ELIDZ_BRAND_COLORS.whiteOpacity70,
        whiteOpacity80: ELIDZ_BRAND_COLORS.whiteOpacity80,
        blackOpacity50: ELIDZ_BRAND_COLORS.blackOpacity50,
        blackOpacity30: ELIDZ_BRAND_COLORS.blackOpacity30,

        // Placeholder colors
        placeholder: '#9CA3AF',
        placeholderLight: '#6B7280',

        // Extended palette
        blue: ELIDZ_BRAND_COLORS.blue,
        green: ELIDZ_BRAND_COLORS.green,
        orange: ELIDZ_BRAND_COLORS.orange,
        purple: ELIDZ_BRAND_COLORS.purple,
        pink: ELIDZ_BRAND_COLORS.pink,
        teal: ELIDZ_BRAND_COLORS.teal,
        indigo: ELIDZ_BRAND_COLORS.indigo,
        cyan: ELIDZ_BRAND_COLORS.cyan,

        // User role colors (same as light for consistency)
        roleEntrepreneur: ELIDZ_BRAND_COLORS.role.entrepreneur,
        roleResearcher: ELIDZ_BRAND_COLORS.role.researcher,
        roleSME: ELIDZ_BRAND_COLORS.role.sme,
        roleStudent: ELIDZ_BRAND_COLORS.role.student,
        roleInvestor: ELIDZ_BRAND_COLORS.role.investor,
        roleTenant: ELIDZ_BRAND_COLORS.role.tenant,

        // Status colors (slightly brighter for dark mode visibility)
        online: '#34D399',  // Brighter green for dark mode
        offline: '#9CA3AF',  // Lighter gray for visibility
        pending: '#FBBF24',  // Brighter yellow for dark mode
        unread: '#FF6B6B',  // Brighter red for dark mode
    },
} as const;

const IOS_SYSTEM_COLORS = SYSTEM_COLORS;
const ANDROID_COLORS = SYSTEM_COLORS;
const WEB_COLORS = SYSTEM_COLORS;

const COLORS =
    Platform.OS === 'ios'
        ? IOS_SYSTEM_COLORS
        : Platform.OS === 'android'
            ? ANDROID_COLORS
            : WEB_COLORS;
const NAV_THEME = {
    light: {
        ...DefaultTheme,
        colors: {
            ...COLORS.light,
            border: COLORS.light.border,
            notification: COLORS.light.destructive,
        },
    },
    dark: {
        ...DarkTheme,
        colors: {
            ...COLORS.dark,
            border: COLORS.dark.border,
            notification: COLORS.dark.destructive,
        },
    },
};
export { COLORS, NAV_THEME };