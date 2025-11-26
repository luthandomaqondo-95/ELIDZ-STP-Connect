import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
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
                    <form className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-zinc-300">Full Name</Label>
                            <Input 
                                id="name" 
                                type="text" 
                                placeholder="John Doe" 
                                required 
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
                                className="bg-zinc-950/50 border-zinc-800 text-zinc-100 focus-visible:ring-indigo-500/50 placeholder:text-zinc-600 focus-visible:border-indigo-500/50 rounded-3xl h-12"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password" className="text-zinc-300">Password</Label>
                            <Input 
                                id="password" 
                                type="password" 
                                required 
                                className="bg-zinc-950/50 border-zinc-800 text-zinc-100 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500/50 rounded-3xl h-12"
                            />
                        </div>

                        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white border-0 rounded-3xl h-12 mt-2">
                            Sign Up
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
