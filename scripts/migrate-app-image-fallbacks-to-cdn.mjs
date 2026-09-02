import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const APPLY = process.argv.includes("--apply");

const FILES = [
    "src/app/(admin)/landing-pages/page.tsx",
    "src/app/(full-width-pages)/(auth)/layout.tsx",
    "src/app/education/dashboard/branch-management/(auth)/layout.tsx",
    "src/app/education/profile/page.tsx",
    "src/components/customer-care/conversations/MessagePanel.tsx",
    "src/components/header/UserDropdown.tsx",
    "src/components/tables/BasicTableOne.tsx",
    "src/components/user-profile/UserMetaCard.tsx",
    "src/features/education/components/header/UserDropdown.tsx",
    "src/layout/AppHeader.tsx",
];

const CDN_IMPORT =
    'import { assetUrl } from "@/lib/cdn";';

function normalizeAsset(value) {
    if (value.startsWith("./images/")) {
        return value.slice(1);
    }

    return value;
}

function ensureImport(source) {
    if (
        /import\s*\{[^}]*\bassetUrl\b[^}]*\}\s*from\s*["']@\/lib\/cdn["']/.test(
            source,
        )
    ) {
        return source;
    }

    const existing =
        /import\s*\{([^}]*)\}\s*from\s*["']@\/lib\/cdn["'];?/;

    if (existing.test(source)) {
        return source.replace(existing, (_, names) => {
            const items = names
                .split(",")
                .map((x) => x.trim())
                .filter(Boolean);

            if (!items.includes("assetUrl")) {
                items.push("assetUrl");
            }

            return `import { ${items.join(", ")} } from "@/lib/cdn";`;
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

function transform(source) {
    let output = source;
    let count = 0;

    // JSX attributes:
    // src="/images/..."
    // src="./images/..."
    output = output.replace(
        /\b(src|poster)\s*=\s*(["'])(\.?\/images\/[^"'<>]+)\2/g,
        (_, prop, quote, value) => {
            count++;

            return `${prop}={assetUrl("${normalizeAsset(value)}")}`;
        },
    );

    // Remaining literals:
    // foo: "/images/..."
    // || "/images/..."
    // ["/images/a.jpg", "/images/b.jpg"]
    output = output.replace(
        /(["'])(\.?\/images\/[^"'\r\n]+)\1/g,
        (match, quote, value, offset, whole) => {
            const prefix = whole.slice(
                Math.max(0, offset - 40),
                offset,
            );

            // Already migrated by pass 1 or JSX pass above.
            if (/assetUrl\s*\(\s*$/.test(prefix)) {
                return match;
            }

            const lineStart =
                whole.lastIndexOf("\n", offset) + 1;

            const nextNewline =
                whole.indexOf("\n", offset);

            const lineEnd =
                nextNewline === -1
                    ? whole.length
                    : nextNewline;

            const line =
                whole.slice(lineStart, lineEnd);

            // Documentation/UI hints are not actual assets.
            if (
                /\bplaceholder\s*=/.test(line) ||
                /\bhint\s*=/.test(line)
            ) {
                return match;
            }

            count++;

            return `assetUrl("${normalizeAsset(value)}")`;
        },
    );

    if (count > 0) {
        output = ensureImport(output);
    }

    return {
        output,
        count,
    };
}

let total = 0;

console.log(
    APPLY
        ? "=== PASS 2 APPLY ==="
        : "=== PASS 2 DRY RUN ===",
);

for (const relativePath of FILES) {
    const file = path.join(ROOT, relativePath);

    if (!fs.existsSync(file)) {
        console.log(`MISSING  ${relativePath}`);
        continue;
    }

    const source =
        fs.readFileSync(file, "utf8");

    const result =
        transform(source);

    if (!result.count) {
        continue;
    }

    total += result.count;

    console.log(
        `${String(result.count).padStart(3)}  ${relativePath}`,
    );

    if (APPLY) {
        fs.writeFileSync(
            file,
            result.output,
            "utf8",
        );
    }
}

console.log("");
console.log(`References: ${total}`);

if (!APPLY) {
    console.log("No files modified.");
}