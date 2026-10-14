"use client";

import { useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedSeparator } from "@/components/animated-separator";

export const AUTH_INPUT_CLASS =
	"h-11 min-[850px]:h-[60px] lg:h-11 rounded-3xl border-transparent bg-gray-800 text-zinc-100 shadow-[inset_0_2px_6px_rgba(0,0,0,0.75),inset_0_-1px_0_rgba(255,255,255,0.06),0_1px_2px_rgba(0,0,0,0.6)] transition-shadow duration-200 focus-visible:shadow-[inset_0_3px_10px_rgba(0,0,0,0.9),inset_0_-1px_0_rgba(255,255,255,0.08),0_8px_20px_-6px_rgba(0,0,0,0.85)] focus-visible:ring-indigo-500/50 focus-visible:border-transparent";
export const AUTH_BUTTON_CLASS = "w-full !h-11 min-[850px]:!h-[60px] lg:!h-11";
export const AUTH_LINK_CLASS = "text-indigo-400 hover:text-indigo-300 hover:underline";
export const AUTH_ERROR_CLASS =
	"rounded-2xl border border-red-500/20 bg-red-50 p-3 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400";
export const AUTH_STATUS_ICON_CLASS =
	"flex size-14 items-center justify-center rounded-full bg-gradient-to-b from-gray-700 to-gray-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_10px_24px_-6px_rgba(0,0,0,0.9),0_3px_8px_rgba(0,0,0,0.6)] [&_svg]:size-7";

const TILT_QUERY =
	"(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
const TILT_PROPS = ["--rx", "--ry", "--sx", "--sy", "--gx", "--gy"];

type AuthCardProps = Omit<React.ComponentProps<"div">, "title"> & {
	title: React.ReactNode;
	description?: React.ReactNode;
};

export function AuthCard({ title, description, className, children, ...props }: AuthCardProps) {
	const tiltRef = useRef<HTMLDivElement>(null);

	const handleTilt = (e: React.PointerEvent<HTMLDivElement>) => {
		const el = tiltRef.current;
		if (!el || !window.matchMedia(TILT_QUERY).matches) return;
		const rect = el.getBoundingClientRect();
		const x = (e.clientX - rect.left) / rect.width - 0.5;
		const y = (e.clientY - rect.top) / rect.height - 0.5;
		el.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`);
		el.style.setProperty("--ry", `${(x * 10).toFixed(2)}deg`);
		el.style.setProperty("--sx", `${(-x * 40).toFixed(1)}px`);
		el.style.setProperty("--sy", `${(-y * 30).toFixed(1)}px`);
		el.style.setProperty("--gx", `${((x + 0.5) * 100).toFixed(1)}%`);
		el.style.setProperty("--gy", `${((y + 0.5) * 100).toFixed(1)}%`);
	};

	const resetTilt = () => {
		const el = tiltRef.current;
		if (!el) return;
		for (const prop of TILT_PROPS) el.style.removeProperty(prop);
	};

	return (
		<div className={cn("flex flex-col gap-6 lg:[perspective:1400px]", className)} {...props}>
			<div
				ref={tiltRef}
				onPointerMove={handleTilt}
				onPointerLeave={resetTilt}
				className="group relative lg:[transform-style:preserve-3d] lg:[transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] lg:transition-transform lg:duration-300 lg:ease-out motion-reduce:transition-none"
			>
				<div aria-hidden className="pointer-events-none absolute inset-0 hidden rounded-3xl bg-gradient-to-b from-gray-800 to-black lg:block lg:[transform:translateZ(-18px)]" />
				<Card className="relative rounded-3xl overflow-hidden bg-gray-900 text-white shadow-[0_0_40px_rgba(251,146,60,0.55)] ring-2 ring-orange-300/45 before:pointer-events-none before:absolute before:inset-0 before:rounded-3xl before:shadow-[0_0_55px_rgba(251,146,60,0.45)] lg:border-0 lg:ring-0 lg:bg-gradient-to-b lg:from-gray-800 lg:via-gray-900 lg:to-gray-950 lg:shadow-[inset_0_1px_0_rgba(255,255,255,0.10),inset_0_-3px_8px_rgba(0,0,0,0.6),calc(var(--sx,0px))_calc(40px_+_var(--sy,0px))_90px_-12px_rgba(0,0,0,0.95),calc(var(--sx,0px)_*_0.4)_calc(14px_+_var(--sy,0px)_*_0.4)_30px_rgba(0,0,0,0.75)] lg:transition-shadow lg:duration-300 lg:before:hidden lg:min-h-[640px] lg:justify-center lg:py-12 lg:gap-8">
					<CardHeader className="text-center pb-3 md:pb-5 min-[850px]:pb-7 lg:pb-6">
						<div className="flex items-center justify-center gap-2 mb-2">
							<Image
								src="/logos/elidz-icon.png"
								alt="ELIDZ Icon"
								width={24}
								height={24}
								className="h-6 w-6 object-contain"
							/>
							<CardTitle className="text-2xl md:text-3xl font-semibold font-serif italic tracking-wide text-orange-50">
								{title}
							</CardTitle>
						</div>
						<AnimatedSeparator className="-mt-1 !mb-3" lineClassName="w-16 sm:w-20" color="#fb923c" />
						{description && <CardDescription className="text-zinc-400">{description}</CardDescription>}
					</CardHeader>
					<CardContent className="pt-0">{children}</CardContent>
					<div aria-hidden className="pointer-events-none absolute inset-0 hidden rounded-3xl bg-[radial-gradient(circle_at_var(--gx,50%)_var(--gy,0%),rgba(255,255,255,0.09),transparent_55%)] opacity-0 transition-opacity duration-300 lg:block lg:group-hover:opacity-100" />
				</Card>
			</div>
		</div>
	);
}
