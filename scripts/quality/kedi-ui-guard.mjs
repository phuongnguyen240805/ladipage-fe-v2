import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd(), "src");
const TEXT_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".css"]);
const STANDARD_SHADES = new Set(["25", "50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"]);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return TEXT_EXTENSIONS.has(path.extname(entry.name)) ? [fullPath] : [];
  });
}

const violations = [];

for (const file of walk(ROOT)) {
  if (path.basename(file) === "globals-1.css") continue;
  const source = fs.readFileSync(file, "utf8");
  const relative = path.relative(process.cwd(), file);
  const lines = source.split(/\r?\n/);

  lines.forEach((line, index) => {
    for (const match of line.matchAll(/\b(gray|slate)-(\d{2,3})\b/g)) {
      if (!STANDARD_SHADES.has(match[2])) {
        violations.push(`${relative}:${index + 1} non-standard ${match[1]} shade: ${match[0]}`);
      }
    }

    if (/\blime-(?:50|100|200|300|400|500|600|700|800|900|950)\b/.test(line)) {
      violations.push(`${relative}:${index + 1} generic lime token is reserved; use brand-* or a semantic color`);
    }

    const yellowBackground = /(?<!:)\b(?:bg-kedi-yellow|bg-brand-500|bg-\[#(?:FFC629|ffc629)\])\b/.test(line);
    const baseWhiteText = /(^|\s)text-white(?=\s|["'`}\]])/.test(line);
    if (yellowBackground && baseWhiteText) {
      violations.push(`${relative}:${index + 1} Kedi Yellow must not use white foreground text`);
    }
  });
}

const globalsPath = path.join(ROOT, "app", "globals.css");
const globals = fs.readFileSync(globalsPath, "utf8");
if (/--color-lime-\d+\s*:/.test(globals)) {
  violations.push("src/app/globals.css must not redefine Tailwind lime as a Kedi brand color");
}
if (/--color-black\s*:\s*#0B2D5B/i.test(globals)) {
  violations.push("src/app/globals.css must not redefine generic black as Kedi Navy");
}

if (violations.length) {
  console.error("Kedi UI quality guard failed:\n");
  violations.slice(0, 100).forEach((violation) => console.error(`- ${violation}`));
  if (violations.length > 100) console.error(`- ...and ${violations.length - 100} more`);
  process.exit(1);
}

console.log("Kedi UI quality guard passed.");
