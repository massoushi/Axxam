import type { NextConfig } from "next";

const apiProxyTarget = process.env.API_PROXY_TARGET || "http://127.0.0.1:5000";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.33", "192.168.1.33:3000"],
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    // En local : le navigateur appelle /api/* (même origine), Next relaie vers Express.
    // Évite les erreurs quand on ouvre le site via IP LAN (ex. 192.168.x.x:3000).
    return [
      {
        source: "/api/:path*",
        destination: `${apiProxyTarget}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },
};

export default nextConfig;
