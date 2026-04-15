import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
  output: isProd ? "export" : undefined,
  basePath: isProd ? "/anomaly-grid" : "",
  assetPrefix: isProd ? "/anomaly-grid/" : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
