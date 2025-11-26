import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";

export function OTPForm({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="text-center pb-8">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <ShieldCheck className="h-6 w-6 text-indigo-400" />
                        <CardTitle className="text-2xl font-bold text-white">Verify OTP</CardTitle>
                    </div>
                    <CardDescription className="text-zinc-400">
                        Enter the one-time password sent to your email.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                    <form className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="otp" className="text-zinc-300">One-Time Password</Label>
                            <div className="flex gap-2 justify-center">
                                <Input 
                                    id="otp" 
                                    type="text" 
                                    placeholder="123456" 
                                    className="bg-zinc-950/50 border-zinc-800 text-zinc-100 text-center tracking-widest text-lg focus-visible:ring-indigo-500/50 placeholder:text-zinc-600 focus-visible:border-indigo-500/50 rounded-3xl h-14" 
                                    required 
                                    maxLength={6} 
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white border-0 rounded-3xl h-12 mt-2">
                            Verify
                        </Button>

                        <div className="text-center text-sm text-zinc-500 mt-2">
                            Didn&apos;t receive the code?{" "}
                            <a href="#" className="text-indigo-400 hover:text-indigo-300 hover:underline font-medium">
                                Resend
                            </a>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
