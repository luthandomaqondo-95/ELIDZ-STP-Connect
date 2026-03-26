"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle } from "lucide-react";

const MOBILE_EMAIL_CONFIRMED_URL = "elidzstp://email-confirmed";

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
    const [status, setStatus] = useState<"loading" | "success">("loading");
    const [message, setMessage] = useState(
        "You can now log in to the ELIDZ-STP Connect mobile app with your account."
    );

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
                setMessage(
                    "Your link was opened successfully. Go back to the mobile app and sign in with your new account."
                );
            }
            if (code) {
                const { error } = await client.auth.exchangeCodeForSession(code);
                if (!error) {
                    window.history.replaceState(null, "", window.location.pathname);
                    setStatus("success");
                    return;
                }
                setMessage(
                    "Your email may already be confirmed. Go back to the mobile app and try signing in."
                );
            }
            if (token_hash && (type === "signup" || type === "email")) {
                const { error } = await client.auth.verifyOtp({ type: type as "signup" | "email", token_hash });
                if (!error) {
                    window.history.replaceState(null, "", window.location.pathname);
                    setStatus("success");
                    return;
                }
                setMessage(
                    "Your email may already be confirmed. Go back to the mobile app and try signing in."
                );
            }
            // Some providers redirect after completing confirmation server-side, without leaving
            // a session in this browser context. Show success guidance instead of false error.
            setMessage(
                "Your confirmation link was processed. Please return to the mobile app and sign in."
            );
            setStatus("success");
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

    return (
        <div className="flex flex-col items-center gap-6 text-center">
            <div className="inline-flex justify-center w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                <CheckCircle className="w-8 h-8" />
            </div>
            <div>
                <h1 className="text-2xl font-bold">Email confirmed</h1>
                <p className="text-zinc-400 mt-2">{message}</p>
            </div>
            <a
                href={MOBILE_EMAIL_CONFIRMED_URL}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
            >
                Open Mobile App
            </a>
        </div>
    );
}
