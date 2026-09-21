import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/": ["./data/reels.json.gz"],
    "/ler/**": ["./data/nt/**/*"],
  },
};

export default nextConfig;
