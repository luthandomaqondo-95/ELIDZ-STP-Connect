"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Field, FieldGroup } from "@/components/ui/field";
import { FloatingLabelInput } from "@/components/floating-input";
import { AnimatedDashboardButton } from "@/components/animated-dashboard-button";
import {
    AUTH_BUTTON_CLASS,
    AUTH_ERROR_CLASS,
    AUTH_INPUT_CLASS,
    AUTH_LINK_CLASS,
    AUTH_STATUS_ICON_CLASS,
    AuthCard,
} from "@/components/auth-card";

function getParamsFromHash(hash: string): { access_token?: string; refresh_token?: string } {
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    return {
        access_token: params.get("access_token") ?? undefined,
        refresh_token: params.get("refresh_token") ?? undefined,
    };
}

function BackToLogin() {
    return (
        <div className="text-center text-sm">
            <Link href="/auth/login" className={`inline-flex items-center font-medium ${AUTH_LINK_CLASS}`}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Login
            </Link>
        </div>
    );
}

export function ResetPasswordForm({ className, ...props }: React.ComponentProps<"div">) {
    const router = useRouter();
    const supabase = createClient();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
            <AuthCard className={className} title="Reset Password" description="Checking your reset link…" {...props}>
                <div className="flex justify-center py-4">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                </div>
            </AuthCard>
        );
    }

    if (!hasSession) {
        return (
            <AuthCard className={className} title="Reset Password" description="This reset link is invalid or has expired." {...props}>
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className={AUTH_STATUS_ICON_CLASS}>
                        <ShieldAlert className="text-orange-400" />
                    </div>
                    <p className="text-sm text-zinc-300">Request a new link to reset your password.</p>
                    <AnimatedDashboardButton
                        label="Request reset link"
                        variant="blue"
                        className={AUTH_BUTTON_CLASS}
                        onClick={() => router.push("/auth/forgot-password")}
                    />
                    <BackToLogin />
                </div>
            </AuthCard>
        );
    }

    return (
        <AuthCard className={className} title="Reset Password" description="Enter your new password below." {...props}>
            <form onSubmit={handleSubmit}>
                {error && <div className={`mb-3 ${AUTH_ERROR_CLASS}`}>{error}</div>}
                <FieldGroup className="gap-3 min-[850px]:gap-5 lg:gap-5">
                    <Field>
                        <FloatingLabelInput
                            id="password"
                            type={showPassword ? "text" : "password"}
                            label="New Password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(null); }}
                            disabled={isLoading}
                            setShowPassword={setShowPassword}
                            className={`${AUTH_INPUT_CLASS} pr-10`}
                        />
                    </Field>
                    <Field>
                        <FloatingLabelInput
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            label="Confirm Password"
                            required
                            minLength={6}
                            value={confirmPassword}
                            onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                            disabled={isLoading}
                            setShowPassword={setShowConfirmPassword}
                            className={`${AUTH_INPUT_CLASS} pr-10`}
                        />
                    </Field>
                    <Field className="pt-1">
                        <AnimatedDashboardButton
                            type="submit"
                            disabled={isLoading}
                            isLoading={isLoading}
                            variant="blue"
                            label={isLoading ? "Updating…" : "Reset Password"}
                            className={AUTH_BUTTON_CLASS}
                        />
                        <div className="mt-3">
                            <BackToLogin />
                        </div>
                    </Field>
                </FieldGroup>
            </form>
        </AuthCard>
    );
}
