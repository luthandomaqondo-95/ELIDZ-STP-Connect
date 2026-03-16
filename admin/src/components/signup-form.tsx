"use client"

import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Lock } from "lucide-react";

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="text-center pb-8">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <ShieldCheck className="h-6 w-6 text-indigo-400" />
                        <CardTitle className="text-2xl font-bold">Access Restricted</CardTitle>
                    </div>
                    <CardDescription className="text-zinc-400">
                        Admin account creation is currently invitation-only.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="flex flex-col items-center gap-4 py-4 text-center">
                        <div className="h-12 w-12 rounded-full bg-zinc-800/50 flex items-center justify-center">
                            <Lock className="h-6 w-6 text-zinc-400" />
                        </div>
                        <p className="text-sm text-zinc-300">
                            Please contact the system administrator or IT department to request access to the ELIDZ-STP Admin Portal.
                        </p>
                        
                        <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 text-white border-0 rounded-3xl h-12 mt-4">
                            <Link href="/auth/login">Return to Login</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
