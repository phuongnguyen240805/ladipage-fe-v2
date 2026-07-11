import type { NextConfig } from "next";

/**
 * Same-origin Instatic editor (customer stays on Ladipage host:port).
 *
 * Browser only talks to Next (e.g. :3000). Paths under /admin/* are rewritten:
 *   /admin/api/*  → Instatic CMS Bun (SSO + API + Set-Cookie Path=/admin)
 *   /admin/*      → Instatic Vite SPA (dev) or same CMS in prod
 *
 * Dev also needs the full Vite module graph proxied (dynamic import() chunks):
 *   /src/*, /@vite/*, /node_modules/*, /runtime/* (public importmap shims), …
 *
 * Cookie Path=/admin works because URL stays https?://ladipage-host/admin/...
 * Do NOT open :5174 in the browser for product UX.
 */
function buildInstaticRewrites(): { source: string; destination: string }[] {
  // Defaults match Instatic `bun run dev` with PORT=8787 VITE_PORT=5174.
  // Do NOT default VITE to NEXT_PUBLIC_INSTATIC_EDITOR_ORIGIN (that is Ladipage :3000).
  const cms = (
    process.env.INSTATIC_REWRITE_TARGET_CMS ||
    process.env.INSTATIC_CMS_URL ||
    process.env.INSTATIC_REWRITE_TARGET ||
    "http://127.0.0.1:8787"
  ).replace(/\/$/, "");

  const vite = (
    process.env.INSTATIC_REWRITE_TARGET_VITE ||
    process.env.INSTATIC_VITE_URL ||
    "http://127.0.0.1:5174"
  ).replace(/\/$/, "");

  // Single-process mode (bun run start): one target for both API + admin assets
  const single = (process.env.INSTATIC_REWRITE_TARGET_SINGLE || "").replace(/\/$/, "");

  if (single) {
    return [
      { source: "/admin/api/:path*", destination: `${single}/admin/api/:path*` },
      { source: "/admin", destination: `${single}/admin` },
      { source: "/admin/:path*", destination: `${single}/admin/:path*` },
      // Published runtime / uploads still live on CMS
      { source: "/_instatic/:path*", destination: `${single}/_instatic/:path*` },
      { source: "/uploads/:path*", destination: `${single}/uploads/:path*` },
      { source: "/runtime/:path*", destination: `${single}/runtime/:path*` },
    ];
  }

  if (!cms && !vite) return [];

  const apiBase = cms || vite;
  const spaBase = vite || cms;
  const rules: { source: string; destination: string }[] = [];

  // API + SSO must hit CMS (Set-Cookie issued by Bun)
  if (apiBase) {
    rules.push({
      source: "/admin/api/:path*",
      destination: `${apiBase}/admin/api/:path*`,
    });
    rules.push({
      source: "/_instatic/:path*",
      destination: `${apiBase}/_instatic/:path*`,
    });
    rules.push({
      source: "/uploads/:path*",
      destination: `${apiBase}/uploads/:path*`,
    });
  }

  // Vite HMR / module graph / public importmap shims (dev)
  // Missing any of these → "Failed to fetch dynamically imported module"
  // (browser receives Next HTML 404 instead of JS).
  if (spaBase) {
    rules.push(
      { source: "/@vite/:path*", destination: `${spaBase}/@vite/:path*` },
      { source: "/@fs/:path*", destination: `${spaBase}/@fs/:path*` },
      { source: "/@id/:path*", destination: `${spaBase}/@id/:path*` },
      { source: "/@react-refresh", destination: `${spaBase}/@react-refresh` },
      { source: "/__vite_ping", destination: `${spaBase}/__vite_ping` },
      { source: "/src/:path*", destination: `${spaBase}/src/:path*` },
      { source: "/node_modules/:path*", destination: `${spaBase}/node_modules/:path*` },
      { source: "/assets/:path*", destination: `${spaBase}/assets/:path*` },
      // public/runtime/*.js — importmap targets in index.html
      { source: "/runtime/:path*", destination: `${spaBase}/runtime/:path*` },
      { source: "/favicon.svg", destination: `${spaBase}/favicon.svg` },
      { source: "/admin", destination: `${spaBase}/admin` },
      { source: "/admin/:path*", destination: `${spaBase}/admin/:path*` },
    );
  }

  // Legacy /_cms prefix → same targets (compat)
  if (apiBase) {
    rules.push({
      source: "/_cms/admin/api/:path*",
      destination: `${apiBase}/admin/api/:path*`,
    });
  }
  if (spaBase) {
    rules.push(
      { source: "/_cms/admin", destination: `${spaBase}/admin` },
      { source: "/_cms/admin/:path*", destination: `${spaBase}/admin/:path*` },
      { source: "/_cms/:path*", destination: `${spaBase}/:path*` },
    );
  }

  return rules;
}

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
  async rewrites() {
    // beforeFiles: run before Next pages/filesystem so /src/*, /runtime/*
    // never fall through to the App Router 404 HTML shell.
    return {
      beforeFiles: buildInstaticRewrites(),
      afterFiles: [],
      fallback: [],
    };
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
