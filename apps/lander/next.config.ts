import type { NextConfig } from 'next';

const { SALES_URL } = process.env;

const nextConfig: NextConfig = {
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
        source: "/dashboard",
        destination: `${SALES_URL}/`,
      },
      {
        source: "/dashboard/:path+",
        destination: `${SALES_URL}/:path+`,
      },
      {
        source: "/sales-static/_next/:path+",
        destination: `${SALES_URL}/sales-static/_next/:path+`,
      },
    ];
  },
};

export default nextConfig;
