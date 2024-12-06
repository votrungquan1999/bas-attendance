import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	experimental: {
		dynamicIO: true,
		serverActions: {
			allowedOrigins: [
				"basketball-attendance.netlify.app",
				"proxy.proxy-production.svc.cluster.local",
			],
		},
	},
};

export default nextConfig;
