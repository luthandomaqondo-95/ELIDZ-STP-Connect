import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
	// Pin Turbopack root to this app (avoids wrong root when ~/package-lock.json exists)
	turbopack: {
		root: path.resolve(process.cwd()),
	},
};

export default nextConfig;
