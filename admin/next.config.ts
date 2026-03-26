import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
	// Pin Turbopack root to this app (avoids wrong root when ~/package-lock.json exists)
	turbopack: {
		root: path.resolve(process.cwd()),
	},
	async headers() {
		return [
			{
				source: "/.well-known/apple-app-site-association",
				headers: [{ key: "Content-Type", value: "application/json" }],
			},
			{
				source: "/.well-known/assetlinks.json",
				headers: [{ key: "Content-Type", value: "application/json" }],
			},
		];
	},
};

export default nextConfig;
