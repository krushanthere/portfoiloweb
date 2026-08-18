import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
// Automatically detect the repository name from GitHub Actions (e.g. "krushanthere/portfolioweb" -> "portfolioweb")
const repoName = process.env.GITHUB_REPOSITORY
  ? process.env.GITHUB_REPOSITORY.split("/")[1]
  : "portfolioweb";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath: isProd ? `/${repoName}` : "",
  assetPrefix: isProd ? `/${repoName}/` : "",
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? `/${repoName}` : "",
  },
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
