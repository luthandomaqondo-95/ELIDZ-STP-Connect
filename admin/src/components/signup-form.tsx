"use client"

import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { AnimatedDashboardButton } from "@/components/animated-dashboard-button";
import { AUTH_BUTTON_CLASS, AUTH_STATUS_ICON_CLASS, AuthCard } from "@/components/auth-card";

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
    const router = useRouter();

    return (
        <AuthCard
            className={className}
            title="Access Restricted"
            description="Admin account creation is currently invitation-only."
            {...props}
        >
            <div className="flex flex-col items-center gap-4 text-center">
                <div className={AUTH_STATUS_ICON_CLASS}>
                    <Lock className="text-orange-300" />
                </div>
                <p className="text-sm text-zinc-300">
                    Please contact the system administrator or IT department to request access to the ELIDZ-STP Admin Portal.
                </p>
                <AnimatedDashboardButton
                    label="Return to Login"
                    variant="blue"
                    className={AUTH_BUTTON_CLASS}
                    onClick={() => router.push("/auth/login")}
                />
            </div>
        </AuthCard>
    );
}
