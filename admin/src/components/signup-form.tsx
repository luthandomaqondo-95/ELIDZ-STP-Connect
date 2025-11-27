"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Loader2 } from "lucide-react";

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
    const router = useRouter();
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // 1. Sign up the user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.name,
                    }
                }
            });

            if (authError) {
                throw new Error(authError.message);
            }

            if (authData.user) {
                // 2. Create profile record
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: authData.user.id,
                        name: formData.name,
                        email: formData.email,
                        role: 'Student' // Default role, allows update later
                    });

                if (profileError) {
                    console.error("Profile creation error:", profileError);
                    // Continue anyway as auth succeeded, user can be fixed later or via triggers
                }

                router.push("/dashboard");
                router.refresh();
            }

        } catch (err: any) {
            setError(err.message || "An error occurred during sign up.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="text-center pb-8">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <ShieldCheck className="h-6 w-6 text-indigo-400" />
                        <CardTitle className="text-2xl font-bold text-white">Create an account</CardTitle>
                    </div>
                    <CardDescription className="text-zinc-400">
                        Enter your details to create an admin account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        {error && (
                            <div className="rounded-2xl bg-red-50 p-3 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-500/20">
                                {error}
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-zinc-300">Full Name</Label>
                            <Input 
                                id="name" 
                                type="text" 
                                placeholder="John Doe" 
                                required 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="bg-zinc-950/50 border-zinc-800 text-zinc-100 focus-visible:ring-indigo-500/50 placeholder:text-zinc-600 focus-visible:border-indigo-500/50 rounded-3xl h-12"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-zinc-300">Email</Label>
                            <Input 
                                id="email" 
                                type="email" 
                                placeholder="m@example.com" 
                                required 
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="bg-zinc-950/50 border-zinc-800 text-zinc-100 focus-visible:ring-indigo-500/50 placeholder:text-zinc-600 focus-visible:border-indigo-500/50 rounded-3xl h-12"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password" className="text-zinc-300">Password</Label>
                            <Input 
                                id="password" 
                                type="password" 
                                required 
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                className="bg-zinc-950/50 border-zinc-800 text-zinc-100 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500/50 rounded-3xl h-12"
                            />
                        </div>

                        <Button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white border-0 rounded-3xl h-12 mt-2">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign Up"}
                        </Button>

                        <div className="text-center text-sm text-muted-foreground mt-2">
                            Already have an account?{" "}
                            <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 hover:underline font-medium">
                                Log in
                            </Link>
                        </div>
                        
                        <div className="text-center text-xs text-zinc-500 mt-2">
                            By clicking continue, you agree to our <a href="#" className="underline hover:text-indigo-400">Terms of Service</a>{" "}
                            and <a href="#" className="underline hover:text-indigo-400">Privacy Policy</a>.
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
