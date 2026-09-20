import { spawnSync } from "node:child_process";
import process from "node:process";

function run(command, args) {
    const result = spawnSync(command, args, {
        stdio: "inherit",
        env: process.env,
        shell: process.platform === "win32",
    });

    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status ?? 1);
}

const required = [
    "NEST_INTERNAL_URL",
];

for (const key of required) {
    if (!process.env[key]?.trim()) {
        throw new Error(
            `Missing ${key} in .env.cf.production`,
        );
    }
}

console.log("[cf] Using .env.cf.production");
console.log(
    "[cf] NEST_INTERNAL_URL:",
    new URL(process.env.NEST_INTERNAL_URL).origin,
);

run("pnpm", ["build:cf"]);

run("node", [
    "scripts/deploy-cloudflare-all.mjs",
]);