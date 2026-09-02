import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const APPLY = process.argv.includes("--apply");

const EXTENSIONS = new Set([
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
]);

const CDN_IMPORT =
    'import { assetUrl } from "@/lib/cdn";';

function walk(dir) {
    if (!fs.existsSync(dir)) return [];

    return fs.readdirSync(dir, { withFileTypes: true })
        .flatMap((entry) => {
            const full = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                return walk(full);
            }

            return EXTENSIONS.has(path.extname(full))
                ? [full]
                : [];
        });
}

function addImport(source) {
    if (
        /import\s*\{[^}]*\bassetUrl\b[^}]*\}\s*from\s*["']@\/lib\/cdn["']/.test(
            source
        )
    ) {
        return source;
    }

    const existing =
        /import\s*\{([^}]*)\}\s*from\s*["']@\/lib\/cdn["'];?/;

    if (existing.test(source)) {
        return source.replace(existing, (_, names) => {
            const list = names
                .split(",")
                .map((x) => x.trim())
                .filter(Boolean);

            if (!list.includes("assetUrl")) {
                list.push("assetUrl");
            }

            return `import { ${list.join(", ")} } from "@/lib/cdn";`;
        });
    }

    const directive =
        /^(\s*["']use (?:client|server)["'];?\s*\r?\n)/;

    const match = source.match(directive);

    if (match) {
        return (
            match[1] +
            CDN_IMPORT +
            "\n" +
            source.slice(match[1].length)
        );
    }

    return CDN_IMPORT + "\n" + source;
}

function migrate(source) {
    let output = source;
    let count = 0;

    // JSX attributes:
    // src="/images/..."
    // thumbnail="/images/..."
    const jsx =
        /\b(src|poster|image|imageUrl|imageSrc|thumbnail|thumbnailUrl|avatar|avatarUrl|icon|iconUrl|logo|logoUrl)\s*=\s*(["'])(\/images\/[^"'<>]+)\2/g;

    output = output.replace(
        jsx,
        (_, prop, quote, url) => {
            count++;
            return `${prop}={assetUrl("${url}")}`;
        }
    );

    // Object properties:
    // src: "/images/..."
    const object =
        /\b(src|poster|image|imageUrl|imageSrc|thumbnail|thumbnailUrl|avatar|avatarUrl|icon|iconUrl|logo|logoUrl)\s*:\s*(["'])(\/images\/[^"'\r\n]+)\2/g;

    output = output.replace(
        object,
        (_, prop, quote, url) => {
            count++;
            return `${prop}: assetUrl("${url}")`;
        }
    );

    if (count > 0) {
        output = addImport(output);
    }

    return { output, count };
}

let total = 0;
const changed = [];

for (const file of walk(SRC)) {
    const normalized = file.replaceAll("\\", "/");

    if (
        normalized.endsWith(".test.ts") ||
        normalized.endsWith(".test.tsx") ||
        normalized.endsWith(".spec.ts") ||
        normalized.endsWith(".spec.tsx")
    ) {
        continue;
    }

    const source = fs.readFileSync(file, "utf8");

    if (!source.includes("/images/")) {
        continue;
    }

    const { output, count } = migrate(source);

    if (!count) {
        continue;
    }

    changed.push({
        file: path.relative(ROOT, file),
        count,
    });

    total += count;

    if (APPLY) {
        fs.writeFileSync(file, output, "utf8");
    }
}

console.log(APPLY ? "=== APPLY ===" : "=== DRY RUN ===");
console.log(`Files: ${changed.length}`);
console.log(`References: ${total}`);
console.log("");

for (const item of changed) {
    console.log(
        `${String(item.count).padStart(3)}  ${item.file}`
    );
}

if (!APPLY) {
    console.log("");
    console.log("No files modified.");
    console.log("Run again with --apply when ready.");
}