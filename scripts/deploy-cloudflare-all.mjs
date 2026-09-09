import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
} from "node:fs";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

/**
 * Cloudflare multi-worker deploy orchestrator.
 *
 * Goals:
 *  - keep application/runtime logic untouched;
 *  - bundle every custom OpenNext server function with OpenNext's own
 *    Cloudflare bundleServer() implementation (not a hand-written esbuild);
 *  - validate every split handler before the first Cloudflare deployment;
 *  - deploy split workers -> public assets -> router last;
 *  - do NOT deploy the monolithic `ladipage` worker by default.
 *
 * Supported flags:
 *  --dry-run           Print plan only, no bundling/deploy.
 *  --rebundle          Rebuild every split handler even if it is current.
 *  --include-monolith  Also deploy root wrangler.jsonc (normally unnecessary).
 */

const root = process.cwd();
const isDryRun = process.argv.includes("--dry-run");
const forceRebundle = process.argv.includes("--rebundle");
const includeMonolith = process.argv.includes("--include-monolith");

const openNextDir = path.join(root, ".open-next");
const serverFunctionsDir = path.join(openNextDir, "server-functions");
const defaultFunctionDir = path.join(serverFunctionsDir, "default");
const defaultBackupDir = path.join(serverFunctionsDir, ".default-before-split-bundle");

function relative(file) {
  return path.relative(root, file).split(path.sep).join("/");
}

function workerName(configPath) {
  const text = readFileSync(configPath, "utf8");
  const match = text.match(/"name"\s*:\s*"([^"]+)"/u);
  return match?.[1] ?? relative(configPath);
}

function discoverSplitWorkers() {
  const workersDir = path.join(root, ".cf-workers");
  if (!existsSync(workersDir)) {
    throw new Error("Missing .cf-workers directory. Run this command from the repository root.");
  }

  return readdirSync(workersDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const dir = path.join(workersDir, entry.name);
      return {
        key: entry.name,
        dir,
        config: path.join(dir, "wrangler.jsonc"),
        wrapper: path.join(dir, "worker.mjs"),
        functionDir: path.join(serverFunctionsDir, entry.name),
        index: path.join(serverFunctionsDir, entry.name, "index.mjs"),
        handler: path.join(serverFunctionsDir, entry.name, "handler.mjs"),
      };
    })
    .filter((worker) => existsSync(worker.config))
    .sort((a, b) => workerName(a.config).localeCompare(workerName(b.config)));
}

function assertRegularFile(file, label = relative(file)) {
  if (!existsSync(file) || !lstatSync(file).isFile()) {
    throw new Error(`Missing ${label}: ${relative(file)}`);
  }
}

function handlerIsCurrent(worker) {
  if (!existsSync(worker.handler)) return false;
  if (!existsSync(worker.index)) return false;
  return statSync(worker.handler).mtimeMs >= statSync(worker.index).mtimeMs;
}

function resolveCloudflareInternalModules() {
  const require = createRequire(import.meta.url);
  const apiEntry = require.resolve("@opennextjs/cloudflare");
  const packageRoot = path.resolve(path.dirname(apiEntry), "../..");
  const packageJson = path.join(packageRoot, "package.json");
  const version = JSON.parse(readFileSync(packageJson, "utf8")).version;

  const bundleServerFile = path.join(packageRoot, "dist", "cli", "build", "bundle-server.js");
  const utilsFile = path.join(packageRoot, "dist", "cli", "commands", "utils", "utils.js");

  assertRegularFile(bundleServerFile, "OpenNext Cloudflare internal bundle-server module");
  assertRegularFile(utilsFile, "OpenNext Cloudflare internal CLI utils module");

  return { version, bundleServerFile, utilsFile };
}

function recoverInterruptedBundle() {
  if (!existsSync(defaultBackupDir)) return;

  if (existsSync(defaultFunctionDir)) {
    throw new Error(
      "Found both OpenNext default function and a split-bundle backup. " +
        `Resolve manually before continuing:\n - ${relative(defaultFunctionDir)}\n - ${relative(defaultBackupDir)}`
    );
  }

  console.warn("Recovering OpenNext default function from an interrupted previous bundle...");
  renameSync(defaultBackupDir, defaultFunctionDir);
}

async function bundleSplitHandlers(splitWorkers) {
  recoverInterruptedBundle();

  assertRegularFile(
    path.join(openNextDir, ".build", "open-next.config.edge.mjs"),
    "compiled OpenNext config; run `pnpm build:cf` first"
  );

  for (const worker of splitWorkers) {
    assertRegularFile(worker.index, `OpenNext ${worker.key} index`);
    assertRegularFile(worker.wrapper, `${worker.key} worker wrapper`);
  }

  const pending = splitWorkers.filter((worker) => forceRebundle || !handlerIsCurrent(worker));
  if (pending.length === 0) {
    console.log("Split handlers are already current; bundling skipped.");
    return;
  }

  if (isDryRun) {
    console.log(`Would bundle ${pending.length} split OpenNext handler(s):`);
    for (const worker of pending) console.log(` - ${worker.key}`);
    return;
  }

  if (!existsSync(defaultFunctionDir)) {
    throw new Error(`Missing OpenNext default function: ${relative(defaultFunctionDir)}`);
  }
  if (existsSync(defaultBackupDir)) {
    throw new Error(`Stale backup already exists: ${relative(defaultBackupDir)}`);
  }

  const { version, bundleServerFile, utilsFile } = resolveCloudflareInternalModules();
  console.log(`Using @opennextjs/cloudflare ${version} native bundler for split handlers.`);

  const [{ bundleServer }, { compileConfig, getNormalizedOptions }] = await Promise.all([
    import(pathToFileURL(bundleServerFile).href),
    import(pathToFileURL(utilsFile).href),
  ]);

  if (typeof bundleServer !== "function") {
    throw new Error("OpenNext internal bundleServer() was not found. Pin/verify @opennextjs/cloudflare before deploying.");
  }
  if (typeof compileConfig !== "function" || typeof getNormalizedOptions !== "function") {
    throw new Error("OpenNext internal config helpers were not found. Pin/verify @opennextjs/cloudflare before deploying.");
  }

  const { config, buildDir } = await compileConfig(undefined);
  const options = getNormalizedOptions(config, buildDir);
  // Match OpenNext's own Cloudflare build() behavior before bundleServer().
  options.minify = false;

  const projectOpts = {
    sourceDir: root,
    skipNextBuild: true,
    skipWranglerConfigCheck: true,
    minify: true,
  };

  // bundleServer() in OpenNext Cloudflare currently targets
  // server-functions/default. Temporarily swap each already-generated custom
  // function into that slot, let the official bundler produce handler.mjs,
  // then move it back. Only .open-next build artifacts are touched.
  renameSync(defaultFunctionDir, defaultBackupDir);

  try {
    for (const worker of pending) {
      console.log(`\n==> Bundling split handler: ${worker.key}`);

      if (!existsSync(worker.functionDir)) {
        throw new Error(`Missing split function directory: ${relative(worker.functionDir)}`);
      }
      if (existsSync(defaultFunctionDir)) {
        throw new Error(`Temporary default slot is unexpectedly occupied: ${relative(defaultFunctionDir)}`);
      }

      renameSync(worker.functionDir, defaultFunctionDir);
      let movedBack = false;

      try {
        await bundleServer(options, projectOpts);

        const temporaryHandler = path.join(defaultFunctionDir, "handler.mjs");
        assertRegularFile(temporaryHandler, `${worker.key} bundled handler`);

        renameSync(defaultFunctionDir, worker.functionDir);
        movedBack = true;
      } finally {
        // Best-effort recovery if bundleServer throws midway.
        if (!movedBack && existsSync(defaultFunctionDir) && !existsSync(worker.functionDir)) {
          renameSync(defaultFunctionDir, worker.functionDir);
        }
      }

      assertRegularFile(worker.handler, `${worker.key} bundled handler`);
      console.log(`    OK ${relative(worker.handler)}`);
    }
  } finally {
    if (existsSync(defaultFunctionDir)) {
      // A failed iteration may have left an unexpected temporary directory.
      // Never delete user/source code; this is .open-next build output only.
      rmSync(defaultFunctionDir, { recursive: true, force: true });
    }
    if (existsSync(defaultBackupDir)) {
      renameSync(defaultBackupDir, defaultFunctionDir);
    }
  }
}

function preflight(splitWorkers, assetsConfig, routerConfig, monolithConfig, requireHandlers = true) {
  const missing = [];

  for (const worker of splitWorkers) {
    const requiredFiles = [
      [worker.config, `${worker.key} wrangler config`],
      [worker.wrapper, `${worker.key} worker wrapper`],
      ...(requireHandlers ? [[worker.handler, `${worker.key} handler.mjs`]] : []),
    ];

    for (const [file, label] of requiredFiles) {
      if (!existsSync(file)) missing.push(`${label}: ${relative(file)}`);
    }
  }

  if (!existsSync(assetsConfig)) missing.push(`assets wrangler config: ${relative(assetsConfig)}`);
  if (!existsSync(routerConfig)) missing.push(`router wrangler config: ${relative(routerConfig)}`);
  if (includeMonolith && !existsSync(monolithConfig)) {
    missing.push(`monolith wrangler config: ${relative(monolithConfig)}`);
  }

  if (missing.length > 0) {
    throw new Error(`Cloudflare preflight failed before deployment:\n - ${missing.join("\n - ")}`);
  }
}

function runPnpm(args) {
  const childEnv = {
    ...process.env,
    WRANGLER_SEND_METRICS: "false",
  };

  if (process.platform === "win32") {
    const quote = (arg) => (/\s|"/u.test(arg) ? `"${arg.replaceAll('"', '\\"')}"` : arg);
    const commandLine = `pnpm ${args.map(quote).join(" ")}`;
    return spawnSync("cmd.exe", ["/d", "/s", "/c", commandLine], {
      cwd: root,
      stdio: "inherit",
      env: childEnv,
      shell: false,
    });
  }

  return spawnSync("pnpm", args, {
    cwd: root,
    stdio: "inherit",
    env: childEnv,
    shell: false,
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MAX_DEPLOY_ATTEMPTS = 5;
const DEPLOY_RETRY_DELAYS_MS = [3_000, 6_000, 12_000, 20_000];

async function deploy(configPath) {
  const name = workerName(configPath);
  const config = relative(configPath);
  const args = ["exec", "wrangler", "deploy", "--config", config, "--keep-vars"];

  console.log(`\n==> Deploying ${name}`);
  console.log(`    pnpm ${args.join(" ")}`);

  if (isDryRun) return;

  for (let attempt = 1; attempt <= MAX_DEPLOY_ATTEMPTS; attempt += 1) {
    console.log(`    Attempt ${attempt}/${MAX_DEPLOY_ATTEMPTS}`);

    const result = runPnpm(args);

    if (!result.error && result.status === 0) {
      console.log(`    OK ${name}`);
      return;
    }

    if (result.error) {
      console.warn(`    ${name}: process error: ${result.error.message}`);
    } else {
      console.warn(`    ${name}: Wrangler exited with ${result.status ?? "unknown"}`);
    }

    if (attempt === MAX_DEPLOY_ATTEMPTS) {
      throw new Error(
        `Deployment failed for ${name} after ${MAX_DEPLOY_ATTEMPTS} attempts.`
      );
    }

    const delay = DEPLOY_RETRY_DELAYS_MS[
      Math.min(attempt - 1, DEPLOY_RETRY_DELAYS_MS.length - 1)
    ];

    console.warn(`    Retry ${name} in ${delay / 1000}s...`);
    await sleep(delay);
  }
}

const monolith = path.join(root, "wrangler.jsonc");
const assets = path.join(root, "cloudflare-assets", "wrangler.jsonc");
const router = path.join(root, ".cf-router", "wrangler.jsonc");
const splitWorkers = discoverSplitWorkers();

if (splitWorkers.length === 0) {
  throw new Error("No split Cloudflare workers were discovered under .cf-workers/.");
}

console.log(`Discovered ${splitWorkers.length} split Cloudflare workers.`);

if (!isDryRun) {
  await bundleSplitHandlers(splitWorkers);
}

preflight(splitWorkers, assets, router, monolith, !isDryRun);

const deploymentPlan = [
  ...(includeMonolith ? [monolith] : []),
  ...splitWorkers.map((worker) => worker.config),
  assets,
  // Router MUST be last. It owns the current .open-next static assets and
  // switches requests to the just-deployed service-bound workers.
  router,
];

console.log("\nCloudflare deployment plan:");
for (const configPath of deploymentPlan) {
  console.log(` - ${workerName(configPath)} (${relative(configPath)})`);
}

if (isDryRun) {
  console.log("\nSplit handler status:");
  for (const worker of splitWorkers) {
    console.log(` - ${worker.key}: ${handlerIsCurrent(worker) ? "ready" : "needs bundle"}`);
  }
  console.log("\nDry run only. No files were bundled and nothing was deployed.");
  process.exit(0);
}

for (const configPath of deploymentPlan) {
  await deploy(configPath);
}

console.log(`\nDone: ${deploymentPlan.length} Cloudflare Workers deployed successfully.`);
