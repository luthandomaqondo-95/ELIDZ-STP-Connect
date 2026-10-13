"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle } from "lucide-react";
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
        <AuthCard
            className={className}
            title="Forgot Password"
            description={isSent ? "Check your email for a reset link." : "Enter your email to receive a password reset link."}
            {...props}
        >
            {isSent ? (
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className={AUTH_STATUS_ICON_CLASS}>
                        <CheckCircle className="text-green-500" />
                    </div>
                    <p className="text-sm text-zinc-300">
                        If an account exists for <strong className="text-white">{email}</strong>, you will receive a link to reset your password.
                    </p>
                    <BackToLogin />
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    {error && <div className={`mb-3 ${AUTH_ERROR_CLASS}`}>{error}</div>}
                    <FieldGroup className="gap-3 min-[850px]:gap-5 lg:gap-5">
                        <Field>
                            <FloatingLabelInput
                                id="email"
                                type="email"
                                label="Email"
                                placeholder="admin@elidz.co.za"
                                required
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                                disabled={isLoading}
                                className={AUTH_INPUT_CLASS}
                            />
                        </Field>
                        <Field className="pt-1">
                            <AnimatedDashboardButton
                                type="submit"
                                disabled={isLoading}
                                isLoading={isLoading}
                                variant="blue"
                                label={isLoading ? "Sending..." : "Send Reset Link"}
                                className={AUTH_BUTTON_CLASS}
                            />
                            <div className="mt-3">
                                <BackToLogin />
                            </div>
                        </Field>
                    </FieldGroup>
                </form>
            )}
        </AuthCard>
    );
}
