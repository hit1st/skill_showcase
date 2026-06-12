import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@showcase/design-system",
    "@showcase/observability",
    "@showcase/delivery-routes",
  ],
  poweredByHeader: false,
};

export default nextConfig;
