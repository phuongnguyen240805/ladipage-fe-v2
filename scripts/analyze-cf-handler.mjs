import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const root = process.cwd();

const handlerPath = path.resolve(
  root,
  ".open-next/server-functions/default/handler.mjs",
);

const metaPath = path.resolve(
  root,
  ".open-next/server-functions/default/handler.mjs.meta.json",
);

function mb(bytes) {
  return (bytes / 1024 / 1024).toFixed(2);
}

function normalize(file) {
  return file.replaceAll("\\", "/");
}

function packageName(file) {
  const normalized = normalize(file);
  const marker = "/node_modules/";

  const index = normalized.lastIndexOf(marker);

  if (index === -1) {
    return null;
  }

  const rest = normalized.slice(index + marker.length);
  const parts = rest.split("/");

  if (parts[0]?.startsWith("@")) {
    return `${parts[0]}/${parts[1] || ""}`;
  }

  return parts[0] || null;
}

if (!fs.existsSync(handlerPath)) {
  console.error(`Missing handler: ${handlerPath}`);
  process.exit(1);
}

if (!fs.existsSync(metaPath)) {
  console.error(`Missing metafile: ${metaPath}`);
  process.exit(1);
}

const rawHandler = fs.readFileSync(handlerPath);
const gzipHandler = zlib.gzipSync(rawHandler, {
  level: zlib.constants.Z_BEST_COMPRESSION,
});

console.log("");
console.log("========================================");
console.log(" OPENNEXT HANDLER SIZE");
console.log("========================================");
console.log(`Raw : ${mb(rawHandler.length)} MiB`);
console.log(`Gzip: ${mb(gzipHandler.length)} MiB`);
console.log("");

const metafile = JSON.parse(
  fs.readFileSync(metaPath, "utf8"),
);

const outputs = Object.entries(metafile.outputs || {});

if (outputs.length === 0) {
  console.error("No outputs found in metafile.");
  process.exit(1);
}

let target = outputs.find(([name]) =>
  normalize(name).endsWith("/handler.mjs"),
);

if (!target) {
  target = outputs
    .slice()
    .sort(
      (a, b) =>
        (b[1]?.bytes || 0) -
        (a[1]?.bytes || 0),
    )[0];
}

const [outputName, outputInfo] = target;

console.log("Analyzed output:");
console.log(outputName);
console.log("");

const inputs = Object.entries(
  outputInfo.inputs || {},
)
  .map(([name, info]) => ({
    name: normalize(name),
    bytes: info.bytesInOutput || 0,
  }))
  .sort((a, b) => b.bytes - a.bytes);

console.log("========================================");
console.log(" TOP 60 INPUTS");
console.log("========================================");

for (const item of inputs.slice(0, 60)) {
  console.log(
    `${mb(item.bytes).padStart(8)} MiB  ${item.name}`,
  );
}

/*
 * Aggregate npm dependencies
 */
const packageTotals = new Map();

for (const item of inputs) {
  const pkg = packageName(item.name);

  if (!pkg) {
    continue;
  }

  packageTotals.set(
    pkg,
    (packageTotals.get(pkg) || 0) + item.bytes,
  );
}

const packages = [...packageTotals.entries()]
  .map(([name, bytes]) => ({ name, bytes }))
  .sort((a, b) => b.bytes - a.bytes);

console.log("");
console.log("========================================");
console.log(" TOP 40 NPM PACKAGES");
console.log("========================================");

for (const item of packages.slice(0, 40)) {
  console.log(
    `${mb(item.bytes).padStart(8)} MiB  ${item.name}`,
  );
}

/*
 * Project / Next generated inputs
 */
const projectInputs = inputs.filter(
  (item) => !packageName(item.name),
);

console.log("");
console.log("========================================");
console.log(" TOP 60 PROJECT / GENERATED INPUTS");
console.log("========================================");

for (const item of projectInputs.slice(0, 60)) {
  console.log(
    `${mb(item.bytes).padStart(8)} MiB  ${item.name}`,
  );
}