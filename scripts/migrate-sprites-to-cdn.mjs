import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const APPLY = process.argv.includes("--apply");

const FILES = [
    "src/components/agent-detail/AgentDetailTabContent.tsx",
    "src/components/agent-manager/AgentFormModal.tsx",
    "src/components/agent-manager/EmojiPicker.tsx",
    "src/components/office-view/useOfficePixiRuntime.ts",
    "src/components/AgentAvatar.tsx",
    "src/components/Sidebar.tsx",
];

const IMPORT_LINE =
    'import { assetUrl } from "@/lib/cdn";';

function ensureImport(source) {
    if (
        /import\s*\{[^}]*\bassetUrl\b[^}]*\}\s*from\s*["']@\/lib\/cdn["']/.test(
            source,
        )
    ) {
        return source;
    }

    const directive =
        /^(\s*["']use (?:client|server)["'];?\s*\r?\n)/;

    const match = source.match(directive);

    if (match) {
        return (
            match[1] +
            IMPORT_LINE +
            "\n" +
            source.slice(match[1].length)
        );
    }

    return IMPORT_LINE + "\n" + source;
}

function transform(source) {
    let out = source;
    let count = 0;

    // JSX dynamic:
    // src={`/sprites/${x}.png`}
    out = out.replace(
        /src=\{(`\/sprites\/[^`]+`)\}/g,
        (_, expression) => {
            count++;
            return `src={assetUrl(${expression})}`;
        },
    );

    // JSX literal:
    // src="/sprites/ceo-lobster.png"
    out = out.replace(
        /src=(["'])(\/sprites\/[^"']+)\1/g,
        (_, quote, value) => {
            count++;
            return `src={assetUrl("${value}")}`;
        },
    );

    // Generic static property:
    // sprite: "/sprites/3-D-1.png"
    out = out.replace(
        /(\bsprite\s*:\s*)(["'])(\/sprites\/[^"']+)\2/g,
        (_, prefix, quote, value) => {
            count++;
            return `${prefix}assetUrl("${value}")`;
        },
    );

    // Pixi dynamic:
    // Assets.load<Texture>(`/sprites/${key}.png`)
    out = out.replace(
        /Assets\.load<Texture>\((`\/sprites\/[^`]+`)\)/g,
        (_, expression) => {
            count++;
            return `Assets.load<Texture>(assetUrl(${expression}))`;
        },
    );

    // Pixi literal
    out = out.replace(
        /Assets\.load<Texture>\((["'])(\/sprites\/[^"']+)\1\)/g,
        (_, quote, value) => {
            count++;
            return `Assets.load<Texture>(assetUrl("${value}"))`;
        },
    );

    if (count > 0) {
        out = ensureImport(out);
    }

    return { out, count };
}

let total = 0;

console.log(
    APPLY
        ? "=== SPRITES APPLY ==="
        : "=== SPRITES DRY RUN ===",
);

for (const relative of FILES) {
    const file = path.join(ROOT, relative);

    if (!fs.existsSync(file)) {
        console.log(`MISSING ${relative}`);
        continue;
    }

    const source = fs.readFileSync(file, "utf8");
    const { out, count } = transform(source);

    if (!count) continue;

    total += count;

    console.log(
        `${String(count).padStart(3)}  ${relative}`,
    );

    if (APPLY) {
        fs.writeFileSync(file, out, "utf8");
    }
}

console.log("");
console.log(`References: ${total}`);

if (!APPLY) {
    console.log("No files modified.");
}