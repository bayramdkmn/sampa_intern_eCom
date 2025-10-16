import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Monorepo/çoklu lockfile durumunda Next.js'in root'u yanlış seçmesini engelle
  // Bu projede app kökü `web` olduğundan, tracing root'u monorepo köküne sabitliyoruz
  outputFileTracingRoot: path.resolve(__dirname, ".."),
};

export default nextConfig;
