import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();

const MAIN_IMAGES = path.join(ROOT, "public", "images");
const EDUCATION_IMAGES = path.join(
    ROOT,
    "public",
    "education",
    "images",
);

const APPLY = process.argv.includes("--apply");

const TEXT_EXTENSIONS = new Set([
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
    ".json",
    ".css",
    ".scss",
]);

function walk(dir) {
    if (!fs.existsSync(dir)) return [];

    const result = [];

    for (const entry of fs.readdirSync(dir, {
        withFileTypes: true,
    })) {
        const full = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            result.push(...walk(full));
        } else {
            result.push(full);
        }
    }

    return result;
}

function sha256(file) {
    return crypto
        .createHash("sha256")
        .update(fs.readFileSync(file))
        .digest("hex");
}

function normalizeWebPath(value) {
    return value.replaceAll("\\", "/");
}

const mainByHash = new Map();

for (const file of walk(MAIN_IMAGES)) {
    const hash = sha256(file);

    if (!mainByHash.has(hash)) {
        mainByHash.set(hash, []);
    }

    mainByHash.get(hash).push(file);
}

const mappings = [];
let reclaimBytes = 0;

for (const educationFile of walk(EDUCATION_IMAGES)) {
    const hash = sha256(educationFile);
    const candidates = mainByHash.get(hash);

    if (!candidates?.length) {
        continue;
    }

    const educationRelative = normalizeWebPath(
        path.relative(EDUCATION_IMAGES, educationFile),
    );

    const preferred = candidates.find((candidate) => {
        const mainRelative = normalizeWebPath(
            path.relative(MAIN_IMAGES, candidate),
        );

        return mainRelative === educationRelative;
    });

    const canonical = preferred || candidates[0];

    const canonicalRelative = normalizeWebPath(
        path.relative(MAIN_IMAGES, canonical),
    );

    mappings.push({
        from:
            "/education/images/" +
            educationRelative,
        to:
            "/images/" +
            canonicalRelative,
        physicalFile: educationFile,
        bytes: fs.statSync(educationFile).size,
    });

    reclaimBytes += fs.statSync(educationFile).size;
}

console.log("");
console.log("Duplicate education assets:", mappings.length);
console.log(
    "Potential reclaim:",
    (reclaimBytes / 1024 / 1024).toFixed(2),
    "MiB",
);

for (const mapping of mappings.slice(0, 30)) {
    console.log(
        mapping.from,
        "=>",
        mapping.to,
    );
}

fs.writeFileSync(
    path.join(ROOT, "media-dedupe-map.json"),
    JSON.stringify(
        mappings.map(({ physicalFile, ...rest }) => rest),
        null,
        2,
    ),
);

if (!APPLY) {
    console.log("");
    console.log(
        "DRY RUN only. Run with --apply to modify.",
    );
    process.exit(0);
}

const sourceRoots = [
    path.join(ROOT, "src"),
    path.join(ROOT, "scripts"),
];

let changedFiles = 0;

for (const sourceRoot of sourceRoots) {
    for (const file of walk(sourceRoot)) {
        if (!TEXT_EXTENSIONS.has(path.extname(file))) {
            continue;
        }

        let content = fs.readFileSync(file, "utf8");
        const original = content;

        for (const mapping of mappings) {
            content = content.replaceAll(
                mapping.from,
                mapping.to,
            );
        }

        if (content !== original) {
            fs.writeFileSync(file, content);
            changedFiles++;
        }
    }
}

for (const mapping of mappings) {
    if (fs.existsSync(mapping.physicalFile)) {
        fs.unlinkSync(mapping.physicalFile);
    }
}

console.log("");
console.log("Updated source files:", changedFiles);
console.log(
    "Removed duplicate data:",
    (reclaimBytes / 1024 / 1024).toFixed(2),
    "MiB",
);