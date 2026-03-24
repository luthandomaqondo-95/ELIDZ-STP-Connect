import { View, Pressable } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/text";
import { HeaderAvatar } from "./HeaderAvatar";
import { HeaderNotificationIcon } from "./HeaderNotificationIcon";
import { Profile } from "@/types";

/** Standard stack back control for navy headers (semi-transparent pill + white arrow). */
export function HeaderBackButton({
    onPress,
    variant = "navy",
}: {
    onPress?: () => void;
    variant?: "navy" | "onLight";
}) {
    const isNavy = variant === "navy";
    return (
        <Pressable
            onPress={onPress ?? (() => router.back())}
            className={cn("rounded-full p-2", isNavy ? "bg-white/10" : "bg-muted")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
        >
            <Feather name="arrow-left" size={20} color={isNavy ? "#FFFFFF" : "#002147"} />
        </Pressable>
    );
}

const HEADER_CONTENT_PADDING_TOP = 10;
const HEADER_PADDING_HORIZONTAL = 20;

export const TabsLayoutHeader = ({
    title = "",
    className = "",
    profile,
    variant = "default",
    notificationIconColor,
    children,
    left,
    right,
    showActions = true,
    /** When true, shows the standard back control unless `left` is passed (stack screens only; omit on tab roots). */
    showBackButton = false,
    noExtraPaddingTop = false,
    reducePaddingTop = 0,
}: {
    title: string;
    className?: string;
    profile?: Profile | null;
    variant?: 'default' | 'navy';
    /** Override color for the notification bell (e.g. on home so it matches other pages) */
    notificationIconColor?: string;
    children?: React.ReactNode;
    left?: React.ReactNode;
    right?: React.ReactNode;
    showActions?: boolean;
    showBackButton?: boolean;
    /** When true, no extra padding above the header content (only safe area). Used e.g. on Home. */
    noExtraPaddingTop?: boolean;
    /** Reduce top padding by this amount (e.g. 8 or 12). Use with noExtraPaddingTop on Home to tighten space below status bar. */
    reducePaddingTop?: number;
}) => {
    const insets = useSafeAreaInsets();
    const paddingTop = noExtraPaddingTop
        ? Math.max(0, insets.top - reducePaddingTop)
        : insets.top + HEADER_CONTENT_PADDING_TOP;

    // Show "Welcome, [name]" when logged in, otherwise show the title
    const displayTitle = profile?.name ? `Welcome, ${profile.name.split(' ')[0]}` : title;

    const resolvedLeft =
        left ??
        (showBackButton ? (
            <HeaderBackButton variant={variant === "navy" ? "navy" : "onLight"} />
        ) : null);

    if (variant === 'navy') {
        return (
            <LinearGradient
                colors={['#002147', '#003366']}
                style={{ paddingTop, paddingLeft: HEADER_PADDING_HORIZONTAL, paddingRight: HEADER_PADDING_HORIZONTAL }}
                className={cn("pb-6 rounded-b-[30px] shadow-lg", className)}
            >
                <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center flex-1 min-w-0">
                        {resolvedLeft ? <View className="mr-3">{resolvedLeft}</View> : null}
                        <View className="items-start flex-1">
                            <Text className="text-white text-3xl font-bold" numberOfLines={1}>
                                {displayTitle}
                            </Text>
                        </View>
                    </View>
                    <View className="flex-row items-center justify-end">
                        {right
                            ? right
                            : showActions
                                ? (
                                    <>
                                        <HeaderNotificationIcon color={notificationIconColor ?? "white"} />
                                        <HeaderAvatar />
                                    </>
                                )
                                : null}
                    </View>
                </View>
                {children ? <View className="mb-3">{children}</View> : null}
            </LinearGradient>
        );
    }

    return (
        <View
            style={{ paddingTop, paddingLeft: HEADER_PADDING_HORIZONTAL, paddingRight: HEADER_PADDING_HORIZONTAL }}
            className={cn("pb-4", className)}
        >
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1 min-w-0">
                    {resolvedLeft ? <View className="mr-3">{resolvedLeft}</View> : null}
                    <View className="items-start flex-1 min-w-0">
                        <Text className="text-2xl font-bold" numberOfLines={1}>
                            {displayTitle}
                        </Text>
                    </View>
                </View>
                <View className="flex-row items-center justify-end ml-2 shrink-0 mb-2">
                    {right
                        ? right
                        : showActions
                            ? (
                                <>
                                    <HeaderNotificationIcon color={notificationIconColor} />
                                    <HeaderAvatar />
                                </>
                            )
                            : null}
                </View>
            </View>
            {children}
        </View>
    );
}