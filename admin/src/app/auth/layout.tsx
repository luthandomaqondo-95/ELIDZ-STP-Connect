 "use client";
import { usePathname } from "next/navigation";
import { ArrowLeft, Copyright } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import NextTopLoader from "nextjs-toploader";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isLoginRoute = pathname === "/auth/login";
    const isForgotPasswordRoute = pathname === "/auth/forgot-password";
    const isOtpRoute = pathname === "/auth/otp";

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-gray-900 bg-[url('/planet2.png')] bg-cover bg-center bg-no-repeat text-white">
            <NextTopLoader color="#1e3a8a" showSpinner={false} />
            <div className="absolute inset-0 bg-orange-200/30 mix-blend-soft-light pointer-events-none" />
            <div
                className={`relative z-10 flex min-h-screen w-full flex-col px-4 py-6 md:justify-between md:px-6 md:py-8 lg:px-10 lg:py-10 ${
                    isLoginRoute || isForgotPasswordRoute ? "auth-login-shell" : ""
                }`}
            >
                <Link
                    href="/"
                    className="absolute top-6 left-6 z-20 inline-flex h-10 w-10 items-center justify-center rounded-3xl border border-white/20 bg-gray-900/70 text-white shadow-sm transition-colors hover:bg-gray-800/80"
                    aria-label="Go back to home"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Link>

                {/* Main Content */}
                <div
                    className={`relative z-10 flex w-full flex-1 items-center justify-center md:mt-0 md:items-center md:justify-center lg:mt-0 lg:items-center lg:justify-center xl:mt-16 xl:items-start xl:justify-start ${
                        isLoginRoute || isForgotPasswordRoute
                            ? "lg:justify-start xl:mt-0 xl:items-center xl:justify-start"
                            : ""
                    } ${isLoginRoute || isForgotPasswordRoute ? "auth-login-main" : ""} ${isOtpRoute ? "auth-otp-main" : ""}`}
                >
                    <div
                    className={`mx-auto w-full max-w-sm md:mx-auto min-[850px]:max-w-md lg:max-w-md xl:mx-0 xl:ml-16 xl:max-w-sm ${
                            isLoginRoute
                                ? "lg:mx-0 lg:ml-32 lg:mt-0 lg:translate-y-32 lg:max-w-lg xl:ml-32 xl:mt-0 xl:translate-y-32 xl:max-w-lg"
                                : ""
                        } ${
                            isForgotPasswordRoute
                                ? "lg:mx-0 lg:ml-32 lg:mt-0 lg:translate-y-32 xl:ml-32 xl:mt-0 xl:translate-y-32"
                                : ""
                        } ${isLoginRoute || isForgotPasswordRoute ? "auth-login-panel" : ""} ${isOtpRoute ? "auth-otp-panel" : ""}`}
                    >
                        <div className="mb-4 flex justify-center">
                    <Image
                                src="/logos/blue text-idz logo.png"
                        alt="ELIDZ STP"
                                width={190}
                                height={56}
                                className="h-14 w-auto object-contain"
                        priority
                    />
                </div>
                        {children}
                    </div>
                </div>

                {/* Footer */}
                <div
                    className={`mt-6 flex items-center justify-center gap-2 text-sm text-slate-400 md:mt-0 md:absolute md:bottom-4 md:left-0 md:right-0 ${
                        isLoginRoute || isForgotPasswordRoute ? "auth-login-footer" : ""
                    }`}
                >
                    <Copyright className="h-4 w-4" />
                    <span>{new Date().getFullYear()} ELIDZ Science & Technology Park.</span>
                </div>
            </div>
        </div>
    );
}

