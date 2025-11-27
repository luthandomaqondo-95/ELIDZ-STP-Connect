import { View } from "react-native";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/text";
import { HeaderAvatar } from "./HeaderAvatar";
import { HeaderNotificationIcon } from "./HeaderNotificationIcon";
import { Profile } from "@/types";

export const TabsLayoutHeader = ({
    title = "",
    className = "",
    profile
}: {
    title: string;
    className?: string;
    profile?: Profile | null;
}) => {
    // Show "Welcome, [name]" when logged in, otherwise show the title
    const displayTitle = profile?.name ? `Welcome, ${profile.name.split(' ')[0]}` : title;

    return (
        <View className={cn("px-5 pb-4 flex-row items-center justify-between", className)}>
            <View className="items-start">
                <Text className="text-2xl font-bold">{displayTitle}</Text>
            </View>
            <View className="flex-row items-center justify-end mb-2">
                <HeaderNotificationIcon />
                <HeaderAvatar />
            </View>
        </View>
    )
}