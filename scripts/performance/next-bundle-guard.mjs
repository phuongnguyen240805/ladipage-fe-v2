#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

const cwd = process.cwd();
const nextDir = path.join(cwd, ".next");
const baselinePath = path.join(cwd, "performance", "bundle-baseline.json");
const command = process.argv[2] ?? "report";

const KiB = 1024;
const ROUTE_GZIP_MIN_DELTA = 20 * KiB;
const ROUTE_GZIP_PERCENT_DELTA = 10;
const CHUNK_GZIP_MIN_DELTA = 25 * KiB;
const CHUNK_GZIP_PERCENT_DELTA = 10;

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "-";
  if (bytes < KiB) return `${bytes} B`;
  return `${(bytes / KiB).toFixed(1)} KiB`;
}

function percentDelta(current, baseline) {
  if (baseline <= 0) return current > 0 ? Infinity : 0;
  return ((current - baseline) / baseline) * 100;
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

function normalizeAssetPath(asset) {
  let normalized = String(asset).replace(/^\/+/, "");
  if (normalized.startsWith("_next/")) normalized = normalized.slice("_next/".length);
  return normalized;
}

function normalizePublicRoute(manifestRoute) {
  const parts = String(manifestRoute)
    .split("/")
    .filter(Boolean)
    .filter((part) => !(part.startsWith("(") && part.endsWith(")")))
    .filter((part) => !part.startsWith("@"));

  while (parts.length && ["page", "route"].includes(parts.at(-1))) {
    parts.pop();
  }

  if (parts.length === 0) return "/";
  return `/${parts.join("/")}`;
}

async function resolveAsset(asset) {
  const relativePath = normalizeAssetPath(asset);
  const filePath = path.join(nextDir, relativePath);
  if (!(await fileExists(filePath))) return null;

  const buffer = await fs.readFile(filePath);
  return {
    path: relativePath,
    rawBytes: buffer.length,
    gzipBytes: gzipSync(buffer, { level: 9 }).length,
  };
}

async function collectRouteFiles() {
  const manifestFiles = [
    path.join(nextDir, "app-build-manifest.json"),
    path.join(nextDir, "build-manifest.json"),
  ];
  const routeMap = new Map();

  for (const manifestPath of manifestFiles) {
    if (!(await fileExists(manifestPath))) continue;
    const manifest = await readJson(manifestPath);
    const pages = manifest.pages ?? {};

    for (const [manifestRoute, assets] of Object.entries(pages)) {
      const publicRoute = normalizePublicRoute(manifestRoute);
      const current = routeMap.get(publicRoute) ?? new Set();
      for (const asset of Array.isArray(assets) ? assets : []) {
        if (/\.(?:js|css)$/.test(asset)) current.add(asset);
      }
      routeMap.set(publicRoute, current);
    }
  }

  return routeMap;
}

async function walkFiles(directory) {
  const result = [];
  const entries = await fs.readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      result.push(...(await walkFiles(fullPath)));
    } else {
      result.push(fullPath);
    }
  }
  return result;
}

async function buildSnapshot() {
  if (!(await fileExists(nextDir))) {
    throw new Error("Không tìm thấy .next. Hãy chạy `pnpm build` trước.");
  }

  const routeFiles = await collectRouteFiles();
  if (routeFiles.size === 0) {
    throw new Error("Không tìm thấy app-build-manifest.json/build-manifest.json hợp lệ trong .next.");
  }

  const assetCache = new Map();
  async function getAsset(asset) {
    const normalized = normalizeAssetPath(asset);
    if (!assetCache.has(normalized)) {
      assetCache.set(normalized, await resolveAsset(normalized));
    }
    return assetCache.get(normalized);
  }

  const routes = {};
  for (const [route, assets] of routeFiles.entries()) {
    const resolved = (await Promise.all([...assets].map(getAsset))).filter(Boolean);
    routes[route] = {
      assetCount: resolved.length,
      rawBytes: resolved.reduce((sum, asset) => sum + asset.rawBytes, 0),
      gzipBytes: resolved.reduce((sum, asset) => sum + asset.gzipBytes, 0),
      assets: resolved.map((asset) => asset.path).sort(),
    };
  }

  const staticDir = path.join(nextDir, "static");
  const staticFiles = (await fileExists(staticDir)) ? await walkFiles(staticDir) : [];
  const jsChunks = [];
  const cssChunks = [];

  for (const filePath of staticFiles) {
    if (!/\.(?:js|css)$/.test(filePath)) continue;
    const buffer = await fs.readFile(filePath);
    const info = {
      path: path.relative(nextDir, filePath).replaceAll(path.sep, "/"),
      rawBytes: buffer.length,
      gzipBytes: gzipSync(buffer, { level: 9 }).length,
    };
    if (filePath.endsWith(".js")) jsChunks.push(info);
    else cssChunks.push(info);
  }

  jsChunks.sort((a, b) => b.gzipBytes - a.gzipBytes);
  cssChunks.sort((a, b) => b.gzipBytes - a.gzipBytes);

  let nextVersion = null;
  try {
    const packageJson = await readJson(path.join(cwd, "package.json"));
    nextVersion = packageJson.dependencies?.next ?? null;
  } catch {
    // Reporting must still work if package.json cannot be read.
  }

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    nextVersion,
    routes,
    chunks: {
      js: jsChunks,
      css: cssChunks,
    },
  };
}

function printReport(snapshot) {
  const routeRows = Object.entries(snapshot.routes)
    .filter(([route]) => !route.startsWith("/_"))
    .sort(([, a], [, b]) => b.gzipBytes - a.gzipBytes)
    .slice(0, 20);

  console.log("\nTop route bundles (gzip):");
  for (const [route, metrics] of routeRows) {
    console.log(
      `${route.padEnd(42)} ${formatBytes(metrics.gzipBytes).padStart(11)}  raw ${formatBytes(metrics.rawBytes).padStart(11)}  ${metrics.assetCount} assets`,
    );
  }

  console.log("\nLargest JS chunks (gzip):");
  for (const chunk of snapshot.chunks.js.slice(0, 15)) {
    console.log(
      `${chunk.path.padEnd(72)} ${formatBytes(chunk.gzipBytes).padStart(11)}  raw ${formatBytes(chunk.rawBytes).padStart(11)}`,
    );
  }

  console.log("\nLargest CSS chunks (gzip):");
  for (const chunk of snapshot.chunks.css.slice(0, 10)) {
    console.log(
      `${chunk.path.padEnd(72)} ${formatBytes(chunk.gzipBytes).padStart(11)}  raw ${formatBytes(chunk.rawBytes).padStart(11)}`,
    );
  }
}

function findLargestJs(snapshot) {
  return snapshot.chunks?.js?.[0] ?? { path: "", rawBytes: 0, gzipBytes: 0 };
}

function shouldFail(current, baseline, absoluteLimit, percentLimit) {
  const delta = current - baseline;
  return delta > absoluteLimit && percentDelta(current, baseline) > percentLimit;
}

function compareSnapshots(current, baseline) {
  const regressions = [];

  for (const [route, oldMetrics] of Object.entries(baseline.routes ?? {})) {
    const newMetrics = current.routes?.[route];
    if (!newMetrics || route.startsWith("/_")) continue;

    if (
      shouldFail(
        newMetrics.gzipBytes,
        oldMetrics.gzipBytes,
        ROUTE_GZIP_MIN_DELTA,
        ROUTE_GZIP_PERCENT_DELTA,
      )
    ) {
      regressions.push(
        `Route ${route}: ${formatBytes(oldMetrics.gzipBytes)} -> ${formatBytes(newMetrics.gzipBytes)} (${percentDelta(newMetrics.gzipBytes, oldMetrics.gzipBytes).toFixed(1)}%)`,
      );
    }
  }

  const oldLargest = findLargestJs(baseline);
  const newLargest = findLargestJs(current);
  if (
    shouldFail(
      newLargest.gzipBytes,
      oldLargest.gzipBytes,
      CHUNK_GZIP_MIN_DELTA,
      CHUNK_GZIP_PERCENT_DELTA,
    )
  ) {
    regressions.push(
      `Largest JS chunk: ${formatBytes(oldLargest.gzipBytes)} -> ${formatBytes(newLargest.gzipBytes)} (${percentDelta(newLargest.gzipBytes, oldLargest.gzipBytes).toFixed(1)}%)`,
    );
  }

  return regressions;
}

async function main() {
  const snapshot = await buildSnapshot();

  if (command === "report") {
    printReport(snapshot);
    return;
  }

  if (command === "baseline") {
    await fs.mkdir(path.dirname(baselinePath), { recursive: true });
    await fs.writeFile(baselinePath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
    printReport(snapshot);
    console.log(`\nĐã ghi baseline: ${path.relative(cwd, baselinePath)}`);
    console.log("Commit file baseline này sau khi bạn xác nhận build hiện tại là mốc hiệu suất tốt.");
    return;
  }

  if (command === "check") {
    if (!(await fileExists(baselinePath))) {
      throw new Error("Chưa có performance/bundle-baseline.json. Chạy `pnpm perf:baseline` sau một build tốt trước.");
    }

    const baseline = await readJson(baselinePath);
    const regressions = compareSnapshots(snapshot, baseline);
    printReport(snapshot);

    if (regressions.length > 0) {
      console.error("\nBundle regression vượt ngưỡng bảo vệ:");
      for (const regression of regressions) console.error(`- ${regression}`);
      console.error(
        `\nNgưỡng route: tăng > ${formatBytes(ROUTE_GZIP_MIN_DELTA)} và > ${ROUTE_GZIP_PERCENT_DELTA}%.`,
      );
      console.error(
        `Ngưỡng largest chunk: tăng > ${formatBytes(CHUNK_GZIP_MIN_DELTA)} và > ${CHUNK_GZIP_PERCENT_DELTA}%.`,
      );
      process.exitCode = 1;
      return;
    }

    console.log("\nBundle guard: PASS - không phát hiện regression đáng kể so với baseline.");
    return;
  }

  throw new Error(`Lệnh không hợp lệ: ${command}. Dùng report | baseline | check.`);
}

main().catch((error) => {
  console.error(`[bundle-guard] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
