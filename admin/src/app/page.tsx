import { ArrowRight, ShieldCheck, Globe, Zap, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background">
            {/* Left Side - Hero/Brand Section */}
            <div className="relative w-full lg:w-[60%] bg-slate-900 overflow-hidden flex flex-col justify-between p-10 lg:p-16 text-white">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(99,102,241,0.2),_transparent_60%)] pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,_rgba(236,72,153,0.15),_transparent_60%)] pointer-events-none" />
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                
                {/* Header / Logo Area */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/10">
                        <LayoutGrid className="w-6 h-6 text-indigo-300" />
                    </div>
                    <span className="text-lg font-medium tracking-wide text-indigo-100/90">ELIDZ STP</span>
                </div>

                {/* Main Content */}
                <div className="relative z-10 my-auto max-w-2xl">
                    <h1 className="text-4xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
                        Orchestrating the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                            Digital Ecosystem
                        </span>
                    </h1>
                    <p className="text-lg lg:text-xl text-slate-400 leading-relaxed max-w-lg">
                        Welcome to the command center for the Science and Technology Park. Manage tenants, track opportunities, and drive innovation from a single powerful interface.
                    </p>
                    
                    <div className="flex gap-6 mt-12">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-indigo-300">
                                <Globe className="w-5 h-5" />
                                <span className="font-semibold">Global Reach</span>
                            </div>
                            <p className="text-sm text-slate-500">Connecting local innovation to the world.</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-cyan-300">
                                <Zap className="w-5 h-5" />
                                <span className="font-semibold">Real-time Data</span>
                            </div>
                            <p className="text-sm text-slate-500">Live insights into park operations.</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 text-sm text-slate-500">
                    &copy; {new Date().getFullYear()} ELIDZ Science & Technology Park.
                </div>
            </div>

            {/* Right Side - Login Action */}
            <div className="w-full lg:w-[40%] flex items-center justify-center p-8 bg-white dark:bg-slate-950 border-l border-slate-100 dark:border-slate-800">
                <div className="w-full max-w-sm space-y-8">
                    <div className="space-y-2 text-center lg:text-left">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 mb-4 lg:mx-0 mx-auto">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Access</h2>
                        <p className="text-slate-500 dark:text-slate-400">
                            Please authenticate to access the dashboard securely.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Button asChild className="w-full h-12 text-base font-medium shadow-indigo-200 dark:shadow-none shadow-lg hover:shadow-xl transition-all duration-200 bg-indigo-600 hover:bg-indigo-700">
                            <Link href="/auth/login">
                                <span>Enter Dashboard</span>
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                        
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200 dark:border-slate-800" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white dark:bg-slate-950 px-2 text-slate-500">
                                    Protected Area
                                </span>
                            </div>
                        </div>

                        <p className="text-center text-xs text-slate-400 dark:text-slate-600">
                            By accessing this portal, you agree to the internal security protocols and data usage policies.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
