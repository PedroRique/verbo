import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/ler/**": ["./data/nt/**/*"],
  },
};

export default nextConfig;
