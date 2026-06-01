import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  turbopack: {
    root: "./",
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://dance-school-dw6q.onrender.com/:path*',
      },
    ]
  },
};
export default nextConfig;