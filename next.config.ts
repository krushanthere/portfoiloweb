import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "gsap",
      "three",
      "@react-three/fiber",
      "@react-three/postprocessing",
    ],
  },
};

export default nextConfig;
