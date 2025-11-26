import { View } from "react-native";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/text";
import { HeaderAvatar } from "./HeaderAvatar";

export const TabsLayoutHeader = ({
    title = "",
    className = ""
}: {
    title: string;
    className?: string;
}) => {
    return (
        <View className={cn("flex-row items-center justify-between px-5 pb-4", className)}>
            <Text className="text-3xl font-bold mb-2">{title}</Text>
            <HeaderAvatar />
        </View>
    )
}