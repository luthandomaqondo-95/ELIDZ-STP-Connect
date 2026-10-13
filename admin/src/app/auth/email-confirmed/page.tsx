"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { AnimatedDashboardButton } from "@/components/animated-dashboard-button";
import { AUTH_BUTTON_CLASS, AUTH_STATUS_ICON_CLASS, AuthCard } from "@/components/auth-card";

function getParamsFromUrl(): { access_token?: string; refresh_token?: string; code?: string; token_hash?: string; type?: string } {
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

export default function EmailConfirmedPage() {
    const router = useRouter();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

    useEffect(() => {
        const client = createClient();
        async function confirm() {
            const { data: { session } } = await client.auth.getSession();
            if (session) {
                setStatus("success");
                return;
            }
            const { access_token, refresh_token, code, token_hash, type } = getParamsFromUrl();
            if (access_token && refresh_token) {
                const { error } = await client.auth.setSession({ access_token, refresh_token });
                if (!error) {
                    window.history.replaceState(null, "", window.location.pathname);
                    setStatus("success");
                    return;
                }
            }
            if (code) {
                const { error } = await client.auth.exchangeCodeForSession(code);
                if (!error) {
                    window.history.replaceState(null, "", window.location.pathname);
                    setStatus("success");
                    return;
                }
            }
            if (token_hash && (type === "signup" || type === "email")) {
                const { error } = await client.auth.verifyOtp({ type: type as "signup" | "email", token_hash });
                if (!error) {
                    window.history.replaceState(null, "", window.location.pathname);
                    setStatus("success");
                    return;
                }
            }
            setStatus("error");
        }
        confirm();
    }, []);

    if (status === "loading") {
        return (
            <AuthCard title="Confirming Email" description="Confirming your email…">
                <div className="flex justify-center py-4">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                </div>
            </AuthCard>
        );
    }

    if (status === "error") {
        return (
            <AuthCard title="Link Expired" description="Invalid or expired confirmation link.">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className={AUTH_STATUS_ICON_CLASS}>
                        <XCircle className="text-red-400" />
                    </div>
                    <p className="text-sm text-zinc-300">Sign in again or ask for a new confirmation email.</p>
                    <AnimatedDashboardButton
                        label="Back to Login"
                        variant="blue"
                        className={AUTH_BUTTON_CLASS}
                        onClick={() => router.push("/auth/login")}
                    />
                </div>
            </AuthCard>
        );
    }

    return (
        <AuthCard title="Email Confirmed" description="Your email address has been verified.">
            <div className="flex flex-col items-center gap-4 text-center">
                <div className={AUTH_STATUS_ICON_CLASS}>
                    <CheckCircle className="text-green-500" />
                </div>
                <p className="text-sm text-zinc-300">You can now log in to the ELIDZ-STP Connect app with your account.</p>
                <AnimatedDashboardButton
                    label="Go to Login"
                    variant="green"
                    className={AUTH_BUTTON_CLASS}
                    onClick={() => router.push("/auth/login")}
                />
            </div>
        </AuthCard>
    );
}
