"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const MOBILE_APP_LOGIN_URL = "elidzstp://";

function getParamsFromUrl(): {
    access_token?: string;
    refresh_token?: string;
    code?: string;
    token_hash?: string;
    type?: string;
} {
    if (typeof window === "undefined") return {};
    const hash = window.location.hash?.replace(/^#/, "") || "";
    const search = window.location.search?.replace(/^\?/, "") || "";
    const params = new URLSearchParams(hash || search);
    return {
        access_token: params.get("access_token") ?? undefined,
        refresh_token: params.get("refresh_token") ?? undefined,
        code: params.get("code") ?? undefined,
        token_hash: params.get("token_hash") ?? undefined,
        type: params.get("type") ?? undefined,
    };
}

export function ResetPasswordForm() {
    const supabase = createClient();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSession, setHasSession] = useState<boolean | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const client = createClient();
        async function init() {
            const { data: { session } } = await client.auth.getSession();
            if (session) {
                setHasSession(true);
                return;
            }
            const { access_token, refresh_token, code, token_hash, type } = getParamsFromUrl();

            if (access_token && refresh_token) {
                const { error: err } = await client.auth.setSession({ access_token, refresh_token });
                if (!err) {
                    window.history.replaceState(null, "", window.location.pathname);
                    setHasSession(true);
                    return;
                }
            }

            if (code) {
                const { error: err } = await client.auth.exchangeCodeForSession(code);
                if (!err) {
                    window.history.replaceState(null, "", window.location.pathname);
                    setHasSession(true);
                    return;
                }
            }

            if (token_hash && type === "recovery") {
                const { error: err } = await client.auth.verifyOtp({ type: "recovery", token_hash });
                if (!err) {
                    window.history.replaceState(null, "", window.location.pathname);
                    const { data: { session: verifiedSession } } = await client.auth.getSession();
                    setHasSession(!!verifiedSession);
                    return;
                }
            }

            // Final fallback: sometimes auth params are consumed by middleware and a session already exists.
            const { data: { session: fallbackSession } } = await client.auth.getSession();
            if (fallbackSession) {
                setHasSession(true);
                return;
            }

            setHasSession(false);
        }
        init();
    }, []);

    useEffect(() => {
        if (!isSuccess || typeof window === "undefined") return;
        const timeoutId = window.setTimeout(() => {
            window.location.href = MOBILE_APP_LOGIN_URL;
        }, 1200);
        return () => window.clearTimeout(timeoutId);
    }, [isSuccess]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setIsLoading(true);
        try {
            const { error: err } = await supabase.auth.updateUser({ password });
            if (err) {
                setError(err.message);
                return;
            }
            await supabase.auth.signOut();
            setIsSuccess(true);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className={cn("flex flex-col items-center gap-6 text-center", "")}>
                <div className="inline-flex justify-center w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Password updated</h1>
                    <p className="text-zinc-400 mt-2">
                        Your password was reset successfully. Opening the mobile app for sign in...
                    </p>
                </div>
                <a
                    href={MOBILE_APP_LOGIN_URL}
                    className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                >
                    Open Mobile App
                </a>
            </div>
        );
    }

    if (hasSession === null) {
        return (
            <div className={cn("flex flex-col gap-6", '')}>
                <p className="text-zinc-400">Loading…</p>
            </div>
        );
    }

    if (!hasSession) {
        return (
            <div className={cn("flex flex-col gap-6", '')}>
                <p className="text-zinc-400">
                    This reset link is invalid or has expired. Request a new link to continue.
                </p>
                <Link
                    href="/auth/forgot-password"
                    className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                >
                    Request new reset link
                </Link>
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col gap-6", '')}>
            <div className="flex flex-col items-center gap-2 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 mb-2">
                    <ShieldCheck className="h-6 w-6" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Reset Password</h1>
                <p className="text-muted-foreground text-sm text-balance">
                    Enter your new password below.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                        id="password"
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(null); }}
                        disabled={isLoading}
                        className="bg-zinc-950/50 border-zinc-800 text-zinc-100 rounded-3xl h-12"
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                        id="confirm-password"
                        type="password"
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                        disabled={isLoading}
                        className="bg-zinc-950/50 border-zinc-800 text-zinc-100 rounded-3xl h-12"
                    />
                    {error && (
                        <div className="mt-2 rounded-2xl bg-red-50 dark:bg-red-900/20 p-3 text-xs text-red-600 dark:text-red-400 border border-red-500/20">
                            {error}
                        </div>
                    )}
                </div>

                <Button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-3xl h-12">
                    {isLoading ? "Updating…" : "Reset Password"}
                </Button>
            </form>

            <div className="text-center text-sm">
                <Link href="/auth/login" className="inline-flex items-center text-indigo-600 hover:text-indigo-500 hover:underline font-medium">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Login
                </Link>
            </div>
        </div>
    );
}
