import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
	// Pin Turbopack root to this app (avoids wrong root when ~/package-lock.json exists)
	turbopack: {
		root: path.resolve(process.cwd()),
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "www.elidzstp.co.za",
			},
			{
				// Supabase storage (facility videos/images uploaded by admins)
				protocol: "https",
				hostname: "*.supabase.co",
			},
			{
				// S3 bucket used for existing seed/test videos
				protocol: "https",
				hostname: "s3b-assets-bucket.s3.amazonaws.com",
			},
		],
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
