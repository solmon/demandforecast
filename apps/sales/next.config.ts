import type { NextConfig } from 'next';
const { LANDER_URL } = process.env;

const nextConfig: NextConfig = {
  assetPrefix: "/sales-static",
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: "/login",
        destination: `${LANDER_URL}/login`,
      },
      {
        source: "/login/:path+",
        destination: `${LANDER_URL}/login/:path+`,
      }
    ];
  },
};

export default nextConfig;
