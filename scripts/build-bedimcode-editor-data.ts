/**
 * Dựng editor_data tĩnh cho các template bedimcode đã tải về public/templates/bedimcode/.
 *
 * Chạy:  pnpm build:bedimcode           → dựng cho repo có sẵn trong public/
 *        pnpm build:bedimcode <repo>...  → dựng cho repo chỉ định
 *
 * Output: src/components/landing-pages/templates/bedimcode-seed-data.generated.json
 * File JSON này được template-seed-data.ts import tĩnh (KHÔNG chạy jsdom lúc runtime).
 *
 * Cấu trúc output mô phỏng đúng parseHtmlToPreservedHtmlSchema:
 *   1 custom_section (kind section) chứa 1 html_code block (preserveHtml, iframe).
 */
import * as fs from "fs";
import * as path from "path";
import { JSDOM } from "jsdom";
import {
  createDefaultBlock,
  ensureOnlookBlockMeta,
  createDefaultPageSettings,
  type EditorBlock,
} from "../src/components/landing-pages/editor/types";
import { CURRENT_EDITOR_SCHEMA_VERSION } from "../src/components/landing-pages/editor/core/editor-migration";
import {
  BEDIMCODE_REPOS,
  bedimcodeTemplateKey,
  type BedimcodeRepoMeta,
} from "./bedimcode-repos";

const PUBLIC_ROOT = path.resolve(process.cwd(), "public/templates/bedimcode");
const OUTPUT_FILE = path.resolve(
  process.cwd(),
  "src/components/landing-pages/templates/bedimcode-seed-data.generated.json",
);
const CANVAS_WIDTH = 1280;
const VIEWPORT_HEIGHT = 900;
const THUMBNAIL_HINTS = ["preview.png", "preview.jpg", "preview.jpeg", "preview.webp"];
const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]);
const FALLBACK_THUMB = "/images/grid-image/image-01.png";

interface SeedTemplateItem {
  template_key: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  thumbnail_url: string;
  preview_image_url: string;
  editor_data: unknown;
  is_published: boolean;
  is_featured: boolean;
  price_type: "free" | "pro";
  views_count: number;
  downloads_count: number;
}

/** Đường dẫn public phục vụ ảnh/asset của repo. */
function publicAssetUrl(repo: string, relPath: string): string {
  const clean = relPath.replace(/\\/g, "/").replace(/^\.\//, "").replace(/^\//, "");
  return `/templates/bedimcode/${repo}/${clean}`;
}

/** Giải quyết đường dẫn tương đối so với file gốc (vd css nằm trong assets/css/). */
function resolveRelative(baseDir: string, relPath: string): string {
  const baseParts = baseDir.split("/").filter(Boolean);
  const relParts = relPath.replace(/\\/g, "/").split("/");
  for (const part of relParts) {
    if (part === "." || part === "") continue;
    else if (part === "..") baseParts.pop();
    else baseParts.push(part);
  }
  return baseParts.join("/");
}

/** Bỏ qua URL tuyệt đối / data / protocol-relative. */
function isExternalUrl(url: string): boolean {
  return /^(https?:|data:|\/\/|#|mailto:|tel:)/i.test(url);
}

/** Rewrite url() trong nội dung CSS về đường dẫn public tuyệt đối. */
function rewriteCssUrls(cssContent: string, cssRelDir: string, repo: string): string {
  return cssContent.replace(/url\(\s*(['"]?)(.*?)\1\s*\)/g, (_m, quote, urlPath) => {
    if (!urlPath || isExternalUrl(urlPath)) return `url(${quote}${urlPath}${quote})`;
    const resolved = resolveRelative(cssRelDir, urlPath);
    return `url(${quote}${publicAssetUrl(repo, resolved)}${quote})`;
  });
}

/** Đọc file text an toàn từ thư mục repo. */
function readRepoFile(destDir: string, relPath: string): string | null {
  const abs = path.join(destDir, relPath);
  if (!fs.existsSync(abs)) return null;
  try {
    return fs.readFileSync(abs, "utf8");
  } catch {
    return null;
  }
}

/**
 * Inline stylesheet <link> nội bộ thành <style>, giữ nguyên CDN.
 * Rewrite ảnh nền trong CSS về public.
 */
function inlineStylesheets(doc: Document, destDir: string, repo: string): void {
  const links = Array.from(doc.querySelectorAll("link[rel~='stylesheet']"));
  for (const link of links) {
    const href = link.getAttribute("href");
    if (!href) continue;
    if (isExternalUrl(href)) continue; // giữ CDN (Swiper, Google Fonts...)
    const css = readRepoFile(destDir, href);
    if (css == null) continue;
    const cssRelDir = path.posix.dirname(href.replace(/\\/g, "/"));
    const style = doc.createElement("style");
    style.setAttribute("data-inlined-from", href);
    style.textContent = rewriteCssUrls(css, cssRelDir, repo);
    link.replaceWith(style);
  }
}

/** Inline <script src> nội bộ thành nội dung; giữ nguyên CDN. */
function inlineScripts(doc: Document, destDir: string, repo: string): void {
  const scripts = Array.from(doc.querySelectorAll("script[src]"));
  for (const script of scripts) {
    const src = script.getAttribute("src");
    if (!src) continue;
    if (isExternalUrl(src)) continue; // giữ CDN (GSAP, Swiper...)
    const js = readRepoFile(destDir, src);
    if (js == null) continue;
    const inline = doc.createElement("script");
    // giữ type=module nếu có để import map/ESM chạy đúng
    const type = script.getAttribute("type");
    if (type) inline.setAttribute("type", type);
    inline.setAttribute("data-inlined-from", src);
    inline.textContent = js;
    script.replaceWith(inline);
  }
}

/** Rewrite src/href/srcset tương đối trong DOM về public tuyệt đối. */
function rewriteDomAssetUrls(doc: Document, repo: string): void {
  const els = Array.from(doc.querySelectorAll("[src], [href], [srcset], [style]"));
  for (const el of els) {
    const tag = el.tagName.toLowerCase();

    const src = el.getAttribute("src");
    if (src && !isExternalUrl(src)) {
      el.setAttribute("src", publicAssetUrl(repo, src));
    }

    // chỉ rewrite href của ảnh/asset, KHÔNG đụng <a href> điều hướng nội bộ (#, trang khác)
    const href = el.getAttribute("href");
    if (href && !isExternalUrl(href) && tag !== "a") {
      // link stylesheet đã inline ở bước trước; còn lại (icon, preload) rewrite
      el.setAttribute("href", publicAssetUrl(repo, href));
    }

    const srcset = el.getAttribute("srcset");
    if (srcset) {
      const rewritten = srcset
        .split(",")
        .map((item) => {
          const parts = item.trim().split(/\s+/);
          const url = parts[0];
          if (!url || isExternalUrl(url)) return item.trim();
          return [publicAssetUrl(repo, url), ...parts.slice(1)].join(" ");
        })
        .join(", ");
      el.setAttribute("srcset", rewritten);
    }

    const style = el.getAttribute("style");
    if (style && style.includes("url(")) {
      el.setAttribute("style", rewriteCssUrls(style, "", repo));
    }
  }
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Dựng full HTML document tự chứa (mô phỏng buildFullHtmlDocument bản import). */
function buildFullHtmlDocument(doc: Document): string {
  const htmlEl = doc.documentElement;
  const body = doc.body;
  const originalHtmlStyle = htmlEl?.getAttribute("style") || "";
  const originalBodyStyle = body?.getAttribute("style") || "";

  const forcedHtmlStyle = [
    originalHtmlStyle,
    "width:100% !important",
    "min-height:auto !important",
    "height:auto !important",
    "overflow:visible !important",
  ]
    .filter(Boolean)
    .join("; ");

  const forcedBodyStyle = [
    originalBodyStyle,
    "width:100% !important",
    "min-height:auto !important",
    "height:auto !important",
    "overflow:visible !important",
  ]
    .filter(Boolean)
    .join("; ");

  const bodyClass = body?.className || "";
  const headHtml = doc.head?.innerHTML || "";
  const bodyHtml = body?.innerHTML || "";

  const runtimeCss = `
html, body { width:100% !important; min-height:100% !important; height:auto !important; overflow:visible !important; }
body { margin:0 !important; position:relative; }
img, video, canvas, svg, picture { max-width:100%; }
* { box-sizing: border-box; }
`.trim();

  return `<!DOCTYPE html>
<html style="${escapeAttr(forcedHtmlStyle)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${headHtml}
  <style id="bedimcode-import-runtime-css">
${runtimeCss}
  </style>
</head>
<body class="${escapeAttr(bodyClass)}" style="${escapeAttr(forcedBodyStyle)}">
${bodyHtml}
</body>
</html>`;
}

/** Tạo 1 custom_section chứa 1 html_code preserve — khớp parseHtmlToPreservedHtmlSchema. */
function buildSections(fullHtml: string): EditorBlock[] {
  const sectionId = `block_section_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const htmlBlock = createDefaultBlock("html_code");
  htmlBlock.parentId = sectionId;
  htmlBlock.label = "Mã HTML Bảo toàn Bố cục";
  htmlBlock.props = {
    ...(htmlBlock.props ?? {}),
    code: fullHtml,
    height: VIEWPORT_HEIGHT,
    editorViewportHeight: VIEWPORT_HEIGHT,
    preserveHtml: true,
    mode: "iframe",
    autoResize: false,
  };
  htmlBlock.frame = {
    ...(htmlBlock.frame ?? {}),
    x: 0,
    y: 0,
    width: CANVAS_WIDTH,
    height: VIEWPORT_HEIGHT,
    zIndex: 10,
    rotate: 0,
  };

  const section = createDefaultBlock("custom_section");
  section.id = sectionId;
  section.label = "Preserved Section";
  section.children = [ensureOnlookBlockMeta(htmlBlock)];
  section.props = {
    ...section.props,
    title: "Preserved Section",
    description: "Khối chứa toàn bộ trang HTML gốc",
    minHeight: VIEWPORT_HEIGHT,
    bgColor: "#ffffff",
  };
  section.frame = {
    ...(section.frame ?? {}),
    x: 0,
    y: 0,
    width: CANVAS_WIDTH,
    height: VIEWPORT_HEIGHT,
    zIndex: 1,
    rotate: 0,
  };

  return [ensureOnlookBlockMeta(section)];
}

function pickThumbnail(destDir: string, repo: string): string {
  for (const hint of THUMBNAIL_HINTS) {
    if (fs.existsSync(path.join(destDir, hint))) return publicAssetUrl(repo, hint);
  }
  for (const imgDir of ["assets/img", "assets/images", "assets/imgs"]) {
    const abs = path.join(destDir, imgDir);
    if (!fs.existsSync(abs)) continue;
    const files = fs
      .readdirSync(abs)
      .filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()))
      .sort();
    if (files.length > 0) return publicAssetUrl(repo, `${imgDir}/${files[0]}`);
  }
  return FALLBACK_THUMB;
}

function buildOne(meta: BedimcodeRepoMeta): SeedTemplateItem | null {
  const destDir = path.join(PUBLIC_ROOT, meta.repo);
  const indexPath = path.join(destDir, "index.html");
  if (!fs.existsSync(indexPath)) {
    console.warn(`[build] ${meta.repo}: chưa có index.html (chạy fetch trước), bỏ qua.`);
    return null;
  }

  const rawHtml = fs.readFileSync(indexPath, "utf8");
  const dom = new JSDOM(rawHtml);
  const doc = dom.window.document;

  inlineStylesheets(doc, destDir, meta.repo);
  inlineScripts(doc, destDir, meta.repo);
  rewriteDomAssetUrls(doc, meta.repo);

  const fullHtml = buildFullHtmlDocument(doc);
  const sections = buildSections(fullHtml);
  const thumbnail = pickThumbnail(destDir, meta.repo);

  const editor_data = {
    pageId: "",
    pageName: meta.name,
    sections,
    pageSettings: createDefaultPageSettings(meta.name),
    schemaVersion: CURRENT_EDITOR_SCHEMA_VERSION,
    templateId: bedimcodeTemplateKey(meta.repo),
  };

  console.log(
    `[build] ✅ ${meta.repo}: html=${(fullHtml.length / 1024).toFixed(0)}KB, thumbnail=${thumbnail}`,
  );

  return {
    template_key: bedimcodeTemplateKey(meta.repo),
    name: meta.name,
    description: meta.name,
    category: meta.category,
    tags: meta.tags,
    thumbnail_url: thumbnail,
    preview_image_url: thumbnail,
    editor_data,
    is_published: true,
    is_featured: meta.featured === true,
    price_type: meta.isPro ? "pro" : "free",
    views_count: 0,
    downloads_count: 0,
  };
}

function selectRepos(): BedimcodeRepoMeta[] {
  const explicit = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  if (explicit.length > 0) {
    return BEDIMCODE_REPOS.filter((r) => explicit.includes(r.repo));
  }
  // mặc định: dựng cho mọi repo đã tải về public/
  return BEDIMCODE_REPOS.filter((r) =>
    fs.existsSync(path.join(PUBLIC_ROOT, r.repo, "index.html")),
  );
}

function main() {
  const list = selectRepos();
  if (list.length === 0) {
    console.error("[build] Không có repo nào để dựng (chạy pnpm fetch:bedimcode trước).");
    process.exit(1);
  }

  console.log(`[build] Dựng editor_data cho ${list.length} repo...`);
  const items: SeedTemplateItem[] = [];
  for (const meta of list) {
    try {
      const item = buildOne(meta);
      if (item) items.push(item);
    } catch (err) {
      console.error(`[build] ❌ ${meta.repo}:`, err instanceof Error ? err.message : err);
    }
  }

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(items, null, 2), "utf8");
  console.log(`[build] Hoàn tất: ghi ${items.length} template → ${OUTPUT_FILE}`);
}

main();
