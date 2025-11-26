import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { Platform } from 'react-native';

// ELIDZ-STP Brand Colors - Matching Logo Colors
const ELIDZ_BRAND_COLORS = {
    // Primary Brand Colors - Medium Blue from logo
    primary: '#002147',          // ELIDZ Navy Blue
    primaryDark: '#001A36',      // Darker navy for dark mode
    secondary: '#FF6600',        // ELIDZ Orange
    secondaryDark: '#CC5200',    // Darker orange for dark mode
    accent: '#FF6600',           // ELIDZ Orange
    accentDark: '#CC5200',       // Darker orange for dark mode

    // Extended Brand Palette
    blue: '#002147',             // ELIDZ Navy Blue
    green: '#28A745',
    orange: '#FF6600',           // ELIDZ Orange (matching logo)
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

        // Brand colors
        primary: ELIDZ_BRAND_COLORS.primaryDark,
        secondary: ELIDZ_BRAND_COLORS.secondaryDark,
        accent: ELIDZ_BRAND_COLORS.accentDark,

        // Semantic colors
        success: ELIDZ_BRAND_COLORS.success,
        warning: ELIDZ_BRAND_COLORS.warning,
        error: ELIDZ_BRAND_COLORS.error,
        info: ELIDZ_BRAND_COLORS.info,
        destructive: ELIDZ_BRAND_COLORS.destructive,
        constructive: ELIDZ_BRAND_COLORS.constructive,
        notification: ELIDZ_BRAND_COLORS.notification,

        // UI elements
        border: '#404040',
        borderLight: '#333333',
        card: '#2A2A2A',
        input: '#333333',
        shadow: 'rgba(0, 0, 0, 0.3)',

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

        // Status colors
        online: ELIDZ_BRAND_COLORS.online,
        offline: ELIDZ_BRAND_COLORS.offline,
        pending: ELIDZ_BRAND_COLORS.pending,
        unread: ELIDZ_BRAND_COLORS.unread,
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