"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { FloatingLabelInput } from "@/components/floating-input";
import { AnimatedDashboardButton } from "@/components/animated-dashboard-button";
import { AnimatedSeparator } from "@/components/animated-separator";

export function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const trimmed = email.trim().toLowerCase();
        if (!trimmed) return;
        setIsLoading(true);
        try {
            const { error: err } = await supabase.auth.resetPasswordForEmail(trimmed, {
                redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/reset-password` : undefined,
            });
            if (err) {
                setError(err.message);
                return;
            }
            setIsSent(true);
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", '')}>
            <Card className="relative rounded-3xl overflow-hidden bg-gray-900 text-white shadow-[0_0_40px_rgba(251,146,60,0.55)] ring-2 ring-orange-300/45 before:pointer-events-none before:absolute before:inset-0 before:rounded-3xl before:shadow-[0_0_55px_rgba(251,146,60,0.45)]">
                <CardHeader className="text-center pb-8">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Image
                            src="/logos/elidz-icon.png"
                            alt="ELIDZ Icon"
                            width={24}
                            height={24}
                            className="h-6 w-6 object-contain"
                        />
                        <CardTitle className="text-2xl md:text-3xl font-semibold font-serif italic tracking-wide text-orange-50">
                            Forgot Password
                        </CardTitle>
                    </div>
                    <AnimatedSeparator className="-mt-1 !mb-3" lineClassName="w-16 sm:w-20" color="#fb923c" />
                    <CardDescription className="text-zinc-400">
                        {isSent ? "Check your email for a reset link." : "Enter your email to receive a password reset link."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                    {isSent ? (
                        <div className="grid gap-4">
                            <div className="flex justify-center">
                                <CheckCircle className="h-12 w-12 text-green-500" />
                            </div>
                            <p className="text-center text-zinc-300 text-sm">
                                If an account exists for <strong className="text-white">{email}</strong>, you will receive a link to reset your password.
                            </p>
                            <div className="text-center text-sm mt-2">
                                <Link href="/auth/login" className="inline-flex items-center text-indigo-400 hover:text-indigo-300 hover:underline font-medium">
                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                    Back to Login
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="grid gap-4">
                            <div className="grid gap-2">
                                <FloatingLabelInput
                                    id="email"
                                    type="email"
                                    label="Email"
                                    placeholder="admin@elidz.co.za"
                                    required
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(null); }}
                                    disabled={isLoading}
                                    className="h-12 rounded-3xl border-transparent bg-gray-800 text-zinc-100 focus-visible:ring-indigo-500/50 focus-visible:border-transparent"
                                />
                                {error && (
                                    <div className="mt-2 rounded-2xl bg-red-50 dark:bg-red-900/20 p-3 text-xs text-red-600 dark:text-red-400 border border-red-500/20">
                                        {error}
                                    </div>
                                )}
                            </div>

                                <div className="flex justify-center pt-2">
                                <AnimatedDashboardButton
                                    type="submit"
                                    disabled={isLoading}
                                    label={isLoading ? "Sending..." : "Send Reset Link"}
                                        className="w-full"
                                />
                            </div>

                            <div className="text-center text-sm mt-2">
                                <Link href="/auth/login" className="inline-flex items-center text-indigo-400 hover:text-indigo-300 hover:underline font-medium">
                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                    Back to Login
                                </Link>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
