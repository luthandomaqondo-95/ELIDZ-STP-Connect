"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Copyright } from "lucide-react";
import { AnimatedSeparator } from "@/components/animated-separator";
import { AnimatedDashboardButton } from "@/components/animated-dashboard-button";

export default function LandingPage() {
    const rotatingDescriptions = [
        "Monitor key operations, manage locators and stakeholders, and track park performance in one secure workspace built for ELIDZ administrators.",
        "Get a real-time view of occupancy, locator profiles, and park-wide activities from a centralized ELIDZ control panel.",
        "Coordinate internal workflows, review important records, and support data-driven decisions across the ELIDZ ecosystem.",
        "Access reliable analytics and status updates that help administrators respond faster and manage the park more efficiently.",
    ];
    const [descriptionIndex, setDescriptionIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsVisible(false);

            setTimeout(() => {
                setDescriptionIndex((prev) => (prev + 1) % rotatingDescriptions.length);
                setIsVisible(true);
            }, 400);
        }, 5000);

        return () => clearInterval(interval);
    }, [rotatingDescriptions.length]);

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 bg-[url('/hero1.png')] bg-cover bg-center bg-no-repeat text-white">
                {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(99,102,241,0.22),_transparent_55%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_75%,_rgba(34,211,238,0.15),_transparent_55%)] pointer-events-none" />
            <div className="absolute -top-28 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header / Logo Area (anchored to viewport corner) */}
            <div className="fixed left-0 top-0 z-20 flex items-center p-0 m-0">
                <Image
                    src="/logos/white text-idz logo.png"
                    alt="ELIDZ STP"
                    width={460}
                    height={140}
                    className="h-24 w-auto object-contain origin-top-left scale-100 saturate-150 contrast-125 brightness-110"
                    priority
                />
            </div>
                
            <div className="relative z-10 flex min-h-screen w-full flex-col justify-between px-3 py-8 pt-64 sm:px-6 sm:py-10 sm:pt-72 md:px-8">
                {/* Main Content */}
                <div className="mx-auto w-full max-w-2xl text-center">
                    <div className="mb-6 inline-flex items-center justify-center">
                        <Image
                            src="/logos/elidz-icon.png"
                            alt="ELIDZ Icon"
                            width={56}
                            height={56}
                            className="h-14 w-14 object-contain saturate-200 contrast-125 brightness-110"
                        />
                    </div>
                    <h1 className="mb-0 text-3xl sm:text-4xl md:text-5xl font-semibold font-serif italic tracking-normal leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
                        <span className="text-orange-400">ELIDZ </span>
                        <span className="relative inline-block font-extrabold text-orange-100">
                            <span className="absolute inset-x-0 bottom-1/4 h-1/2 rounded-full bg-orange-400/35 blur-[10px] pointer-events-none" />
                            <span className="relative">Admin Dashboard</span>
                        </span>
                    </h1>
                    <AnimatedSeparator className="-mt-2 !mb-2 md:!mb-3" lineClassName="w-36 sm:w-48 md:w-56" color="#fb923c" />
                    <p
                        className={`mx-auto max-w-md text-base sm:text-lg text-orange-100/90 leading-relaxed transition-all duration-300 ${
                            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
                        }`}
                    >
                        {rotatingDescriptions[descriptionIndex]}
                    </p>
                    
                    <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link href="/auth/login" className="inline-flex">
                            <AnimatedDashboardButton label="Enter Dashboard" />
                        </Link>
                            </div>

                </div>

                {/* Footer */}
                <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                    <Copyright className="h-4 w-4" />
                    <span>{new Date().getFullYear()} ELIDZ Science & Technology Park.</span>
                </div>
            </div>
        </div>
    );
}
