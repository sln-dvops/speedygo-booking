import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false, // hide the Nextjs Icon 
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  experimental: {
    mdxRs: {
      // Enable GitHub Flavored Markdown
      mdxType: 'gfm',
      // Configure JSX runtime
      jsxRuntime: 'automatic',
      // Optional: Configure JSX import source if needed
      jsxImportSource: 'react'
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'integratedai.sg',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
