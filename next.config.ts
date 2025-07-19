import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker用のスタンドアロン出力を有効化
  output: 'standalone',
  eslint: {
    // 警告は無視しない
    ignoreDuringBuilds: false,
  },
  typescript: {
    // TypeScript型チェックエラーは無視しない
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      // Supabaseストレージ（設定されている場合）
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/**',
      },
    ],
  },
};

export default nextConfig;
