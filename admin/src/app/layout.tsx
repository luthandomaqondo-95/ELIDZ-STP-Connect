import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers"
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
	title: "ELIDZ-STP Admin Portal",
	description: "Admin portal for ELIDZ-STP Connect",
	icons: {
		icon: "/logos/elidz-icon.png",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className="antialiased bg-background text-foreground"
			>
				<Providers>
					<NextTopLoader color="#1e3a8a" showSpinner={false} />
					<Toaster position="top-center" richColors />
					{children}
				</Providers>
			</body>
		</html>
	);
}
