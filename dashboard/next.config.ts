import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/anomaly-grid",
  assetPrefix: "/anomaly-grid/",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
