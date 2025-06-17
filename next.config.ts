import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, 'style')],
  },
  output: 'export',
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/happlog' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/happlog/' : '',
};

export default nextConfig;
