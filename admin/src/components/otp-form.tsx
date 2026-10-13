"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { AnimatedDashboardButton } from "@/components/animated-dashboard-button";
import { AUTH_BUTTON_CLASS, AUTH_LINK_CLASS, AuthCard } from "@/components/auth-card";

const OTP_SLOT_CLASS =
    "h-11 w-10 rounded-2xl border-0 bg-gray-800 dark:bg-gray-800 [&_.animate-caret-blink]:bg-zinc-100 text-base text-zinc-100 shadow-[inset_0_2px_6px_rgba(0,0,0,0.75),inset_0_-1px_0_rgba(255,255,255,0.06),0_1px_2px_rgba(0,0,0,0.6)] first:rounded-l-2xl first:border-l-0 last:rounded-r-2xl sm:h-12 sm:w-12 data-[active=true]:ring-2 data-[active=true]:ring-indigo-500/50";

export function OTPForm({ className, ...props }: React.ComponentProps<"div">) {
    const [otp, setOtp] = useState("");

    return (
        <AuthCard
            className={className}
            title="Verify OTP"
            description="Enter the one-time password sent to your email."
            {...props}
        >
            <form className="flex flex-col gap-5">
                <div className="flex flex-col items-center gap-3">
                    <Label htmlFor="otp" className="text-zinc-300">One-Time Password</Label>
                    <InputOTP
                        id="otp"
                        value={otp}
                        onChange={setOtp}
                        maxLength={6}
                        required
                        containerClassName="justify-center"
                    >
                        <InputOTPGroup className="gap-1.5 sm:gap-2">
                            {Array.from({ length: 6 }, (_, index) => (
                                <InputOTPSlot key={index} index={index} className={OTP_SLOT_CLASS} />
                            ))}
                        </InputOTPGroup>
                    </InputOTP>
                </div>

                <AnimatedDashboardButton
                    type="submit"
                    label="Verify"
                    variant="blue"
                    className={AUTH_BUTTON_CLASS}
                />

                <p className="text-center text-sm text-zinc-500">
                    Didn&apos;t receive the code?{" "}
                    <a href="#" className={`font-medium ${AUTH_LINK_CLASS}`}>
                        Resend
                    </a>
                </p>
            </form>
        </AuthCard>
    );
}
