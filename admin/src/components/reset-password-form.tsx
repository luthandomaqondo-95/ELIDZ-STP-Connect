"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const MOBILE_CHANGE_PASSWORD_URL = "elidzstp://change-password";

function getParamsFromHash(hash: string): { access_token?: string; refresh_token?: string } {
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    return {
        access_token: params.get("access_token") ?? undefined,
        refresh_token: params.get("refresh_token") ?? undefined,
    };
}

export function ResetPasswordForm() {
    const router = useRouter();
    const supabase = createClient();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSession, setHasSession] = useState<boolean | null>(null);

    useEffect(() => {
        const client = createClient();
        async function init() {
            const { data: { session } } = await client.auth.getSession();
            if (session) {
                setHasSession(true);
                return;
            }
            if (typeof window !== "undefined" && window.location.hash) {
                const { access_token, refresh_token } = getParamsFromHash(window.location.hash);
                if (access_token) {
                    const { error: err } = await client.auth.setSession({ access_token, refresh_token: refresh_token ?? "" });
                    if (!err) {
                        window.history.replaceState(null, "", window.location.pathname);
                        setHasSession(true);
                        return;
                    }
                }
            }
            setHasSession(false);
        }
        init();
    }, []);

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
            router.push("/auth/login");
            router.refresh();
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

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
                <p className="text-zinc-400">Invalid or expired reset link. Request a new one.</p>
                <a href={MOBILE_CHANGE_PASSWORD_URL} className="text-indigo-400 hover:underline">
                    Open in Mobile App
                </a>
                <Link href="/auth/forgot-password" className="text-indigo-400 hover:underline">Request reset link</Link>
                <Link href="/auth/login" className="inline-flex items-center text-indigo-400 hover:underline font-medium">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Login
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
                <a href={MOBILE_CHANGE_PASSWORD_URL} className="text-indigo-400 hover:underline text-sm">
                    Prefer mobile? Open in app
                </a>
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
