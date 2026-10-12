import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: { cpus: 1, webpackMemoryOptimizations: true },
  outputFileTracingIncludes: {
    '/*': ['./generated/prisma/*query_engine*.node'],
  },
};

export default nextConfig;
