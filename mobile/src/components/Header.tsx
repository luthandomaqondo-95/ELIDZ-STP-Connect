import { View } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/text";
import { HeaderAvatar } from "./HeaderAvatar";
import { HeaderNotificationIcon } from "./HeaderNotificationIcon";
import { Profile } from "@/types";

export const TabsLayoutHeader = ({
    title = "",
    className = "",
    profile,
    variant = "default",
    children,
    left,
    right,
    showActions = true,
}: {
    title: string;
    className?: string;
    profile?: Profile | null;
    variant?: 'default' | 'navy';
    children?: React.ReactNode;
    left?: React.ReactNode;
    right?: React.ReactNode;
    showActions?: boolean;
}) => {
    // Show "Welcome, [name]" when logged in, otherwise show the title
    const displayTitle = profile?.name ? `Welcome, ${profile.name.split(' ')[0]}` : title;

    if (variant === 'navy') {
        return (
            <LinearGradient
                colors={['#002147', '#003366']}
                className={cn("pt-12 pb-6 px-5 rounded-b-[30px] shadow-lg", className)}
            >
                <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center flex-1">
                        {left ? <View className="mr-3">{left}</View> : null}
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
                                        <HeaderNotificationIcon color="white" />
                                        <HeaderAvatar />
                                    </>
                                )
                                : null}
                    </View>
                </View>
                {children}
            </LinearGradient>
        );
    }

    return (
        <View className={cn("px-5 pb-4 flex-row items-center justify-between", className)}>
            <View className="items-start">
                <Text className="text-2xl font-bold">{displayTitle}</Text>
            </View>
            <View className="flex-row items-center justify-end mb-2">
                {right
                    ? right
                    : showActions
                        ? (
                            <>
                                <HeaderNotificationIcon />
                                <HeaderAvatar />
                            </>
                        )
                        : null}
            </View>
            {children}
        </View>
    )
}