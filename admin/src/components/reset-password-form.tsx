"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";


function getParamsFromUrl(): {
    access_token?: string;
    refresh_token?: string;
    code?: string;
    token_hash?: string;
    type?: string;
    source?: string;
} {
    if (typeof window === "undefined") return {};
    const hash = window.location.hash?.replace(/^#/, "") || "";
    const search = window.location.search?.replace(/^\?/, "") || "";
    const hashParams = new URLSearchParams(hash);
    const searchParams = new URLSearchParams(search);
    const get = (key: string) => hashParams.get(key) ?? searchParams.get(key) ?? undefined;
    return {
        access_token: get("access_token"),
        refresh_token: get("refresh_token"),
        code: get("code"),
        token_hash: get("token_hash"),
        type: get("type"),
        source: get("source"),
    };
}

function buildMobileDeepLink(params: ReturnType<typeof getParamsFromUrl>): string {
    const base = "elidzstp://change-password";
    if (params.access_token && params.refresh_token) {
        return `${base}#access_token=${params.access_token}&refresh_token=${params.refresh_token}&type=recovery`;
    }
    if (params.code) {
        return `${base}?code=${params.code}&type=recovery`;
    }
    if (params.token_hash) {
        return `${base}?token_hash=${params.token_hash}&type=recovery`;
    }
    return base;
}

export function ResetPasswordForm() {
    const supabase = createClient();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSession, setHasSession] = useState<boolean | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [redirectingToApp, setRedirectingToApp] = useState(false);

    useEffect(() => {
        const client = createClient();
        async function init() {
            const urlParams = getParamsFromUrl();
            const { access_token, refresh_token, code, token_hash, type, source } = urlParams;

            // Mobile-originated reset: forward tokens back into the app deep link.
            const isMobileReset = source === "mobile";
            const hasRecoveryParams = !!(access_token || refresh_token || code || token_hash);
            if (isMobileReset && hasRecoveryParams) {
                setRedirectingToApp(true);

                // PKCE code flow: code is one-time use and tied to the browser's PKCE verifier.
                // Exchange it here in the browser first, then forward the real tokens to the app.
                if (code) {
                    const { data, error: exchangeError } = await client.auth.exchangeCodeForSession(code);
                    if (!exchangeError && data.session) {
                        const deepLink = buildMobileDeepLink({
                            access_token: data.session.access_token,
                            refresh_token: data.session.refresh_token,
                        });
                        window.location.href = deepLink;
                        return;
                    }
                }

                // Implicit flow (tokens already in URL hash) or token_hash: forward directly.
                const deepLink = buildMobileDeepLink(urlParams);
                window.location.href = deepLink;
                return;
            }

            const { data: { session } } = await client.auth.getSession();
            if (session) {
                setHasSession(true);
                return;
            }

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

            if (token_hash && (type === "recovery" || type === "invite")) {
                const otpType = type === "invite" ? "invite" : "recovery";
                const { error: err } = await client.auth.verifyOtp({ type: otpType, token_hash });
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
            window.location.href = "/auth/login";
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
                        Your password was set successfully. Redirecting to sign in…
                    </p>
                </div>
                <Link
                    href="/auth/login"
                    className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                >
                    Go to sign in
                </Link>
            </div>
        );
    }

    if (redirectingToApp) {
        return (
            <div className={cn("flex flex-col items-center gap-4 text-center", "")}>
                <p className="text-zinc-400">Opening the app…</p>
                <p className="text-zinc-500 text-sm">
                    If the app does not open automatically,{" "}
                    <a
                        href={buildMobileDeepLink(getParamsFromUrl())}
                        className="text-indigo-400 underline"
                    >
                        tap here
                    </a>
                    .
                </p>
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
                <div className="rounded-2xl border border-amber-500/30 bg-amber-950/40 p-4 text-left text-sm text-amber-100/90">
                    <p className="font-medium text-amber-100">Invite opened on supabase.co?</p>
                    <p className="mt-2 text-amber-100/80">
                        If the address bar shows{" "}
                        <code className="rounded bg-black/30 px-1 text-xs">*.supabase.co</code> and a JSON error,
                        Supabase could not redirect to this app (wrong Site URL or redirect allow list).
                        Copy everything from <code className="rounded bg-black/30 px-1 text-xs">#</code> to the end of the URL,
                        then open{" "}
                        <code className="break-all rounded bg-black/30 px-1 text-xs">
                            {typeof window !== "undefined" ? window.location.origin : ""}/auth/reset-password
                        </code>
                        {" "}and paste that fragment at the end, or ask an admin to re-send the invite after fixing{" "}
                        <strong>Authentication → URL Configuration</strong> in Supabase (Site URL = this app, Redirect URLs includes this page).
                    </p>
                </div>
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
