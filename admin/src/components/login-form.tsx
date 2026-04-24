"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isProfileSuspended } from "@/lib/account-status";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldGroup,
} from "@/components/ui/field";
import { FloatingLabelInput } from "@/components/floating-input";
import { AnimatedDashboardButton } from "@/components/animated-dashboard-button";
import { AnimatedSeparator } from "@/components/animated-separator";

function isLikelyNetworkFailure(err: unknown): boolean {
	const msg = err instanceof Error ? err.message : String(err)
	const m = msg.toLowerCase()
	return (
		m.includes("failed to fetch") ||
		m.includes("networkerror") ||
		m.includes("load failed") ||
		m.includes("connection closed") ||
		m.includes("err_connection") ||
		m.includes("fetch failed")
	)
}

function loginErrorMessage(err: unknown): string {
	if (isLikelyNetworkFailure(err)) {
		return (
			"Could not reach Supabase (connection was closed or blocked). Check your internet, VPN, firewall, or antivirus. " +
			"Try another network or browser, and confirm https://YOUR-PROJECT.supabase.co loads. This is not a wrong password."
		)
	}
	return "An error occurred. Please try again."
}

const SUSPENDED_MSG =
	"Your account has been suspended. If you believe this is a mistake, please contact support.";

export function LoginForm() {
	const searchParams = useSearchParams()
	const [showPassword, setShowPassword] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [isSuccess, setIsSuccess] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	})

	useEffect(() => {
		if (searchParams.get("error") === "suspended") {
			setError(SUSPENDED_MSG)
			void (async () => {
				const supabase = createClient()
				await supabase.auth.signOut()
			})()
		}
	}, [searchParams])

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setError(null)
		setIsSuccess(false)
		setIsLoading(true)

		try {
			const supabase = createClient()
			const trimmedEmail = formData.email.trim().toLowerCase()
			let signInResult
			try {
				signInResult = await supabase.auth.signInWithPassword({
					email: trimmedEmail,
					password: formData.password,
				})
			} catch (fetchErr) {
				console.error("Login fetch error:", fetchErr)
				setError(loginErrorMessage(fetchErr))
				setIsLoading(false)
				return
			}

			const { error } = signInResult
			if (error) {
				setError(error.message)
				setIsLoading(false)
				return
			}

			let session = null
			try {
				const {
					data: { session: s },
				} = await supabase.auth.getSession()
				session = s
			} catch (sessionErr) {
				console.error("getSession after login:", sessionErr)
				setError(loginErrorMessage(sessionErr))
				setIsLoading(false)
				return
			}
			if (!session) {
				setError("Session was not saved. Check browser cookies and try again.")
				setIsLoading(false)
				return
			}

			const { data: profile, error: profileError } = await supabase
				.from("profiles")
				.select("verification_status")
				.eq("id", session.user.id)
				.maybeSingle()

			if (profileError) {
				console.error("Login profile check:", profileError)
				await supabase.auth.signOut()
				setError("Could not verify your account. Please try again.")
				setIsLoading(false)
				return
			}

			if (isProfileSuspended(profile)) {
				await supabase.auth.signOut()
				setError(SUSPENDED_MSG)
				setIsLoading(false)
				return
			}

			setIsSuccess(true)
			// Full page load so middleware always receives the auth cookies. Client-side
			// router.push can race cookie sync and leave you stuck on /auth/login with "Signed in".
			window.location.assign("/dashboard")
		} catch (err) {
			console.error("Login error:", err)
			const msg = err instanceof Error ? err.message : String(err)
			if (/suspended/i.test(msg)) {
				setError(msg)
			} else {
				setError(loginErrorMessage(err))
			}
			setIsLoading(false)
		}
	}
	return (
		<div className={cn("flex flex-col gap-6", '')} >
			<Card className="relative rounded-3xl overflow-hidden bg-gray-900 text-white shadow-[0_0_40px_rgba(251,146,60,0.55)] ring-2 ring-orange-300/45 before:pointer-events-none before:absolute before:inset-0 before:rounded-3xl before:shadow-[0_0_55px_rgba(251,146,60,0.45)] lg:min-h-[560px] lg:py-10 lg:gap-8">
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
							Welcome back
						</CardTitle>
					</div>
					<AnimatedSeparator className="-mt-1 !mb-3" lineClassName="w-16 sm:w-20" color="#fb923c" />
					<CardDescription className="text-zinc-400">
						Sign in to manage ELIDZ locators, monitor park activities, and access secure administrative tools.
					</CardDescription>
				</CardHeader>
				<CardContent className="pt-0">
					<form onSubmit={handleSubmit} suppressHydrationWarning>
						{error && (
							<div className="mb-3 rounded-2xl border border-red-500/20 bg-red-50 p-3 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
								{error}
							</div>
						)}
						<FieldGroup className="gap-3 min-[850px]:gap-5 lg:gap-5">
							<Field>
								<FloatingLabelInput
									id="email"
									type="email"
									label="Email"
									placeholder="admin@elidz.co.za"
									required
									value={formData.email}
									onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setError(null); }}
									disabled={isLoading}
									className="h-11 min-[850px]:h-[60px] lg:h-11 rounded-3xl border-transparent bg-gray-800 text-zinc-100 focus-visible:ring-indigo-500/50 focus-visible:border-transparent"
								/>
							</Field>
							<Field>
								<FloatingLabelInput
									id="password"
									type={showPassword ? "text" : "password"}
									label="Password"
									required
									value={formData.password}
									onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setError(null); }}
									disabled={isLoading}
									setShowPassword={setShowPassword}
									className="h-11 min-[850px]:h-[60px] lg:h-11 rounded-3xl border-transparent bg-gray-800 text-zinc-100 focus-visible:ring-indigo-500/50 focus-visible:border-transparent pr-10"
								/>
							<div className="mt-2 text-right">
								<Link
									href="/auth/forgot-password"
									className="inline-block text-sm underline-offset-4 hover:underline text-indigo-400 hover:text-indigo-300"
								>
									Forgot your password?
								</Link>
							</div>
							<div className="mt-2 h-px w-full bg-zinc-400/40 md:hidden" />
							</Field>
							<Field className="pt-1">
								<div className="flex justify-center">
									<AnimatedDashboardButton
										type="submit"
										disabled={isLoading || isSuccess}
										isLoading={isLoading}
										variant={isSuccess ? "green" : "blue"}
										label={isLoading ? "Signing in..." : isSuccess ? "Signed in" : "Sign in"}
										className="w-full !h-11 min-[850px]:!h-[60px] lg:!h-11"
									/>
								</div>
								<p className="mt-2 text-center text-xs text-zinc-500">
									By signing in, you agree to the{" "}
									<Link href="/terms" className="text-indigo-400 hover:text-indigo-300 hover:underline">
										Terms &amp; Conditions
									</Link>{" "}
									and{" "}
									<Link href="/privacy" className="text-indigo-400 hover:text-indigo-300 hover:underline">
										Privacy Policy
									</Link>.
								</p>
								<FieldDescription className="text-center mt-3 text-zinc-500">
									Don&apos;t have an account?{" "}
									<Link href="/auth/signup" className="text-indigo-400 hover:text-indigo-300 hover:underline">
										Sign up
									</Link>
								</FieldDescription>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
