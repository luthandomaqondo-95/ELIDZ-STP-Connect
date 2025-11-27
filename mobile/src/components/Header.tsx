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
    children
}: {
    title: string;
    className?: string;
    profile?: Profile | null;
    variant?: 'default' | 'navy';
    children?: React.ReactNode;
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
                    <View className="items-start flex-1">
                        <Text className="text-white text-3xl font-bold">{displayTitle}</Text>
                    </View>
                    <View className="flex-row items-center justify-end">
                        <HeaderNotificationIcon color="white" />
                        <HeaderAvatar />
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
                <HeaderNotificationIcon />
                <HeaderAvatar />
            </View>
            {children}
        </View>
    )
}