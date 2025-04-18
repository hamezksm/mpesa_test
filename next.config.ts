import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    images: {
        domains: ["your-image-domain.com"],
    },
    env: {
        MPESA_API_KEY: process.env.MPESA_API_KEY,
        MPESA_SECRET: process.env.MPESA_SECRET,
    },
    allowedDevOrigins: ["http://localhost:3000", "*.ngrok-free.app"],
};

export default nextConfig;
