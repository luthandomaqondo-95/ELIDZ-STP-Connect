"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const router = useRouter()
    const supabase = createClient()
	const [showPassword, setShowPassword] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	})

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setError(null)
		setIsLoading(true)

		try {
            const { error } = await supabase.auth.signInWithPassword({
					email: formData.email,
                password: formData.password
			})

            if (error) {
                setError(error.message)
				setIsLoading(false)
				return
			}

            router.push("/dashboard")
            router.refresh()

		} catch (err) {
			console.error("Login error:", err)
			setError("An error occurred. Please try again.")
			setIsLoading(false)
		}
	}

    // TODO: Implement Google Sign In with Supabase
	const handleGoogleSignIn = async () => {
		setError(null)
        // Logic for OAuth would go here
	}

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card className="shadow-2xl rounded-3xl overflow-hidden">
				<CardHeader className="text-center pb-8">
					<div className="flex items-center justify-center gap-2 mb-2">
						<ShieldCheck className="h-6 w-6 text-indigo-400" />
						<CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
					</div>
					<CardDescription className="text-zinc-400">
						Enter your credentials to access the admin portal
					</CardDescription>
				</CardHeader>
				<CardContent className="pt-0">
					<form onSubmit={handleSubmit}>
						<FieldGroup className="gap-4">
							{error && (
								<div className="rounded-2xl bg-red-50 p-3 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-500/20">
									{error}
								</div>
							)}
							<Field>
								<FieldLabel htmlFor="email" className="text-zinc-300">Email</FieldLabel>
								<Input
									id="email"
									type="email"
									placeholder="admin@elidz.co.za"
									required
									value={formData.email}
									onChange={(e) => setFormData({ ...formData, email: e.target.value })}
									disabled={isLoading}
									className="bg-zinc-950/50 border-zinc-800 text-zinc-100 focus-visible:ring-indigo-500/50 placeholder:text-zinc-600 focus-visible:border-indigo-500/50 rounded-3xl h-12"
								/>
							</Field>
							<Field>
								<div className="flex items-center">
									<FieldLabel htmlFor="password" className="text-zinc-300">Password</FieldLabel>
									<Link
										href="/auth/forgot-password"
										className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-indigo-400 hover:text-indigo-300"
									>
										Forgot your password?
									</Link>
								</div>
								<div className="relative">
									<Input
										id="password"
										type={showPassword ? "text" : "password"}
										required
										value={formData.password}
										onChange={(e) => setFormData({ ...formData, password: e.target.value })}
										disabled={isLoading}
										className="bg-zinc-950/50 border-zinc-800 text-zinc-100 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500/50 rounded-3xl h-10 pr-12"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										disabled={isLoading}
										className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300 transition-colors disabled:opacity-50"
										aria-label={showPassword ? "Hide password" : "Show password"}
									>
										{showPassword ? (
											<EyeOff className="h-5 w-5" />
										) : (
											<Eye className="h-5 w-5" />
										)}
									</button>
								</div>
							</Field>
							<Field className="pt-2">
								<Button
									type="submit"
									disabled={isLoading}
									className="w-full bg-indigo-600 hover:bg-indigo-700 text-white border-0 rounded-3xl h-12 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isLoading ? (
										<>
											<Loader2 className="h-5 w-5 mr-2 animate-spin" />
											Logging in...
										</>
									) : (
										"Sign in"
									)}
								</Button>
								<FieldDescription className="text-center mt-4 text-zinc-500">
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
