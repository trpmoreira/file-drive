import { hostname } from "os";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "compassionate-flamingo-168.convex.cloud",
      },
    ],
  },
};

export default nextConfig;
