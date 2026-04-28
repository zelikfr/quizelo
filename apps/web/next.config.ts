import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Allow shared workspace packages to be transpiled by Next.
  transpilePackages: ["@quizelo/auth", "@quizelo/db", "@quizelo/protocol"],

  // Native modules: don't try to bundle them — let Node resolve at runtime.
  serverExternalPackages: ["postgres"],

  experimental: {
    serverActions: { bodySizeLimit: "1mb" },
  },

  // Forward future REST calls to the Fastify API. Auth.js routes
  // (/api/auth/*) match a Next route file first, so they stay local.
  async rewrites() {
    return [
      {
        source: "/api/match/:path*",
        destination: `${process.env.API_URL ?? "http://localhost:4000"}/match/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
