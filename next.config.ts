import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, 'style')],
  },
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
