"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, ArrowRight } from "lucide-react";

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
            <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
                <p className="text-zinc-400">Confirming your email…</p>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="flex flex-col items-center gap-6 text-center">
                <p className="text-zinc-400">Invalid or expired confirmation link.</p>
                <Link href="/auth/login" className="text-indigo-400 hover:underline">Back to Login</Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-6 text-center">
            <div className="inline-flex justify-center w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                <CheckCircle className="w-8 h-8" />
            </div>
            <div>
                <h1 className="text-2xl font-bold">Email confirmed</h1>
                <p className="text-zinc-400 mt-2">You can now log in to the ELIDZ-STP Connect app with your account.</p>
            </div>
            <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-indigo-400 hover:underline font-medium"
            >
                Go to Login
                <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
    );
}
