import { Globe, Zap } from "lucide-react";
import Image from "next/image";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
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
                <div className="absolute top-0 left-0 z-10 flex items-center gap-3">
                    <Image
                        src="/logos/white text-idz logo.png"
                        alt="ELIDZ STP"
                        width={200}
                        height={60}
                        className="h-46 w-auto object-contain"
                        priority
                    />
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
                        Secure access for authorized administrators. Manage the park's digital infrastructure with precision and ease.
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

            {/* Right Side - Auth Content */}
            <div className="w-full lg:w-[40%] flex items-center justify-center p-8 bg-white dark:bg-slate-950 border-l border-slate-100 dark:border-slate-800">
                <div className="w-full max-w-sm space-y-8">
                    {children}
                </div>
            </div>
        </div>
    );
}

