import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@quizelo/auth", "@quizelo/db", "@quizelo/protocol"],
  serverExternalPackages: ["postgres"],
  experimental: {
    serverActions: { bodySizeLimit: "1mb" },
  },
};

export default nextConfig;
