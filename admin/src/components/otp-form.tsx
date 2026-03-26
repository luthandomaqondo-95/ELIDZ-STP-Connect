"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { AnimatedDashboardButton } from "@/components/animated-dashboard-button";
import { AnimatedSeparator } from "@/components/animated-separator";
import Image from "next/image";

export function OTPForm() {
    const [otp, setOtp] = useState("");

    return (
        <div className={cn("flex flex-col gap-6", '')}>
            <Card className="relative rounded-3xl overflow-hidden bg-gray-900 text-white shadow-[0_0_40px_rgba(251,146,60,0.55)] ring-2 ring-orange-300/45 before:pointer-events-none before:absolute before:inset-0 before:rounded-3xl before:shadow-[0_0_55px_rgba(251,146,60,0.45)]">
                <CardHeader className="pb-8 text-center">
                    <div className="mb-2 flex items-center justify-center gap-2">
                        <Image
                            src="/logos/elidz-icon.png"
                            alt="ELIDZ Icon"
                            width={24}
                            height={24}
                            className="h-6 w-6 object-contain"
                        />
                        <CardTitle className="text-2xl md:text-3xl font-semibold font-serif italic tracking-wide text-orange-50">
                            Verify OTP
                        </CardTitle>
                    </div>
                    <AnimatedSeparator className="-mt-1 !mb-3" lineClassName="w-16 sm:w-20" color="#fb923c" />
                    <CardDescription className="text-zinc-400">
                        Enter the one-time password sent to your email.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                    <form className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="otp" className="text-center text-zinc-300">One-Time Password</Label>
                            <div className="flex justify-center">
                                <InputOTP
                                    id="otp"
                                    value={otp}
                                    onChange={setOtp}
                                    maxLength={6}
                                    required
                                    containerClassName="justify-center gap-1.5 sm:gap-2"
                                >
                                    <InputOTPGroup className="gap-1.5 sm:gap-2">
                                        <InputOTPSlot index={0} className="h-10 w-10 rounded-lg border border-zinc-700 bg-zinc-900/80 text-sm text-zinc-100 shadow-sm ring-offset-background transition-all sm:h-12 sm:w-12 sm:rounded-xl sm:text-base data-[active=true]:border-indigo-400 data-[active=true]:ring-2 data-[active=true]:ring-indigo-400/40" />
                                        <InputOTPSlot index={1} className="h-10 w-10 rounded-lg border border-zinc-700 bg-zinc-900/80 text-sm text-zinc-100 shadow-sm ring-offset-background transition-all sm:h-12 sm:w-12 sm:rounded-xl sm:text-base data-[active=true]:border-indigo-400 data-[active=true]:ring-2 data-[active=true]:ring-indigo-400/40" />
                                        <InputOTPSlot index={2} className="h-10 w-10 rounded-lg border border-zinc-700 bg-zinc-900/80 text-sm text-zinc-100 shadow-sm ring-offset-background transition-all sm:h-12 sm:w-12 sm:rounded-xl sm:text-base data-[active=true]:border-indigo-400 data-[active=true]:ring-2 data-[active=true]:ring-indigo-400/40" />
                                        <InputOTPSlot index={3} className="h-10 w-10 rounded-lg border border-zinc-700 bg-zinc-900/80 text-sm text-zinc-100 shadow-sm ring-offset-background transition-all sm:h-12 sm:w-12 sm:rounded-xl sm:text-base data-[active=true]:border-indigo-400 data-[active=true]:ring-2 data-[active=true]:ring-indigo-400/40" />
                                        <InputOTPSlot index={4} className="h-10 w-10 rounded-lg border border-zinc-700 bg-zinc-900/80 text-sm text-zinc-100 shadow-sm ring-offset-background transition-all sm:h-12 sm:w-12 sm:rounded-xl sm:text-base data-[active=true]:border-indigo-400 data-[active=true]:ring-2 data-[active=true]:ring-indigo-400/40" />
                                        <InputOTPSlot index={5} className="h-10 w-10 rounded-lg border border-zinc-700 bg-zinc-900/80 text-sm text-zinc-100 shadow-sm ring-offset-background transition-all sm:h-12 sm:w-12 sm:rounded-xl sm:text-base data-[active=true]:border-indigo-400 data-[active=true]:ring-2 data-[active=true]:ring-indigo-400/40" />
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>
                        </div>

                        <AnimatedDashboardButton
                            type="submit"
                            label="Verify"
                            variant="blue"
                            className="mt-2 w-full !h-12 rounded-3xl"
                        />

                        <div className="text-center text-sm text-zinc-500 mt-2">
                            Didn&apos;t receive the code?{" "}
                            <a href="#" className="text-indigo-400 hover:text-indigo-300 hover:underline font-medium">
                                Resend
                            </a>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
