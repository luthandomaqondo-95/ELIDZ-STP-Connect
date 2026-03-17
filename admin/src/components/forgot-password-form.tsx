"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm({ className, ...props }: React.ComponentProps<"div">) {
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
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="text-center pb-8">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <ShieldCheck className="h-6 w-6 text-indigo-400" />
                        <CardTitle className="text-2xl font-bold text-white">Forgot Password</CardTitle>
                    </div>
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
                            <Link href="/auth/login" className="inline-flex items-center justify-center text-indigo-400 hover:text-indigo-300 hover:underline font-medium text-sm">
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Back to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-zinc-300">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(null); }}
                                    disabled={isLoading}
                                    className="bg-zinc-950/50 border-zinc-800 text-zinc-100 focus-visible:ring-indigo-500/50 placeholder:text-zinc-600 focus-visible:border-indigo-500/50 rounded-3xl h-12"
                                />
                                {error && (
                                    <div className="mt-2 rounded-2xl bg-red-50 dark:bg-red-900/20 p-3 text-xs text-red-600 dark:text-red-400 border border-red-500/20">
                                        {error}
                                    </div>
                                )}
                            </div>

                            <Button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white border-0 rounded-3xl h-12 mt-2">
                                {isLoading ? "Sending…" : "Send Reset Link"}
                            </Button>

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
