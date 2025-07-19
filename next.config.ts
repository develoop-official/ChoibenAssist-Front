import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // 警告は無視しない
    ignoreDuringBuilds: false,
  },
  typescript: {
    // TypeScript型チェックエラーは無視しない
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
