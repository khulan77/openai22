import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    PRISMA_DATABASA_URL: process.env.PRISMA_DATABASA_URL,
  },
};

export default nextConfig;
