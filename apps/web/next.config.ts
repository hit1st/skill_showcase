import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@showcase/design-system",
    "@showcase/observability",
    "@showcase/delivery-routes",
  ],
  poweredByHeader: false,
};

export default nextConfig;

initOpenNextCloudflareForDev();
