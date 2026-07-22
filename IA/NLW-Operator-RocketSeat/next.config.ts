import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,

  /* Turbopack configuration for Next.js 16+ */
  turbopack: {
    root: path.resolve(__dirname),
  },

  /* Webpack configuration as fallback */
  webpack: (config, { isServer }) => {
    // Resolve issues with problematic modules in browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        url: false,
        querystring: false,
      };
    }

    return config;
  },
};

export default nextConfig;
