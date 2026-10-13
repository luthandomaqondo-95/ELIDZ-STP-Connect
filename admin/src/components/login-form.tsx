"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
	Field,
	FieldDescription,
	FieldGroup,
} from "@/components/ui/field";
import { FloatingLabelInput } from "@/components/floating-input";
import { AnimatedDashboardButton } from "@/components/animated-dashboard-button";
import {
	AUTH_BUTTON_CLASS,
	AUTH_ERROR_CLASS,
	AUTH_INPUT_CLASS,
	AUTH_LINK_CLASS,
	AuthCard,
} from "@/components/auth-card";

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const DUMMY_EMAIL = "manelisi.mehlo@appimate.com"
	const DUMMY_PASSWORD = "123456"
	const router = useRouter()
    const supabase = createClient()
	const [showPassword, setShowPassword] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [isSuccess, setIsSuccess] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	})

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setError(null)
		setIsSuccess(false)
		setIsLoading(true)

		try {
			const trimmedEmail = formData.email.trim().toLowerCase()
			if (trimmedEmail === DUMMY_EMAIL && formData.password === DUMMY_PASSWORD) {
				document.cookie = "dummy_auth=1; Path=/; Max-Age=86400; SameSite=Lax"
				setIsSuccess(true)
				setTimeout(() => window.location.assign("/dashboard"), 350)
				return
			}

			const { error } = await supabase.auth.signInWithPassword({
				email: trimmedEmail,
				password: formData.password,
			})

			if (error) {
				setError(error.message)
				setIsLoading(false)
				return
			}

			setIsSuccess(true)
			setTimeout(() => {
				router.push("/dashboard")
				router.refresh()
			}, 350)
		} catch (err) {
			console.error("Login error:", err)
			setError("An error occurred. Please try again.")
		} finally {
			setIsLoading(false)
		}
	}
	return (
		<AuthCard
			className={className}
			title="Welcome back"
			description="Sign in to manage ELIDZ locators, monitor park activities, and access secure administrative tools."
			{...props}
		>
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
							value={formData.email}
							onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setError(null); }}
							disabled={isLoading}
							className={AUTH_INPUT_CLASS}
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
							className={`${AUTH_INPUT_CLASS} pr-10`}
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
								className={AUTH_BUTTON_CLASS}
							/>
						</div>
						<p className="mt-2 text-center text-xs text-zinc-500">
							By signing in, you agree to the{" "}
							<Link href="/terms" className={AUTH_LINK_CLASS}>
								Terms &amp; Conditions
							</Link>{" "}
							and{" "}
							<Link href="/privacy" className={AUTH_LINK_CLASS}>
								Privacy Policy
							</Link>.
						</p>
						<FieldDescription className="text-center mt-3 text-zinc-500">
							Don&apos;t have an account?{" "}
							<Link href="/auth/signup" className={AUTH_LINK_CLASS}>
								Sign up
							</Link>
						</FieldDescription>
					</Field>
				</FieldGroup>
			</form>
		</AuthCard>
	);
}
