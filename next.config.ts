import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: { cpus: 1, webpackMemoryOptimizations: true },
  serverExternalPackages: ['@prisma/client'],
  outputFileTracingIncludes: {
    '/*': ['./node_modules/.prisma/client/**'],
  },
};

export default nextConfig;
