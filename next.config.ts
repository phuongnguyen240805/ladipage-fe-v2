import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Nest API: browser gọi trực tiếp NEXT_PUBLIC_API_URL (7002) qua api-client.
  // Không proxy /api/* → Nest: sẽ chặn BFF routes (builder, landing-pages, ai-seo, …).
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "graph.facebook.com",
      },
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  async redirects() {
    return [
      {
        source: "/seo-automation-v3",
        destination: "/ai-seo",
        permanent: true,
      },
      {
        source: "/settings",
        destination: "/facebook-ads/cai-dat",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
