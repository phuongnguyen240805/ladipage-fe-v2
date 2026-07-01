#!/usr/bin/env node
/**
 * WAVE 0 — Auth nền smoke: captcha endpoint + session stability (delegates to login-session).
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:7002/api";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function checkCaptcha() {
  const res = await fetch(`${API_URL}/auth/captcha/img?width=120&height=44`);
  const body = await res.json();
  if (!res.ok || body.code !== 200 || !body.data?.id) {
    throw new Error(`Captcha endpoint failed: HTTP ${res.status} code=${body.code}`);
  }
  console.log("✓ GET /auth/captcha/img returns captcha id");
}

function runLoginSessionSmoke() {
  return new Promise((resolve, reject) => {
    const script = path.join(__dirname, "smoke-login-session.mjs");
    const child = spawn(process.execPath, ["--env-file=.env", script], {
      cwd: path.join(__dirname, ".."),
      stdio: "inherit",
      env: process.env,
    });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`smoke-login-session exited with ${code}`));
    });
  });
}

async function main() {
  await checkCaptcha();
  await runLoginSessionSmoke();
  console.log("\nAll auth foundation checks passed");
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});