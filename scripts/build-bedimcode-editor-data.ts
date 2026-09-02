/**
 * Compile template Bedimcode thành artifact tĩnh, không nhét full HTML vào bundle Next.js.
 *
 * Chạy:  pnpm build:bedimcode           → dựng cho repo có sẵn trong public/
 *        pnpm build:bedimcode <repo>...  → dựng cho repo chỉ định
 *
 * Output:
 *   public/template-artifacts/bedimcode/<repo>/editor-data.json
 *   public/template-artifacts/bedimcode/<repo>/manifest.json
 *   src/components/landing-pages/templates/bedimcode-manifest.generated.json
 *
 * `bedimcode-manifest.generated.json` chỉ chứa metadata + URL artifact nên đủ nhỏ để
 * import tĩnh. Full editor_data chỉ được tải khi user preview / sử dụng template.
 */
import * as fs from "fs";
import * as path from "path";
import { createHash } from "crypto";
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
  GITHUB_OWNER,
  bedimcodeTemplateKey,
  type BedimcodeRepoMeta,
} from "./bedimcode-repos";

const PUBLIC_ROOT = path.resolve(process.cwd(), "public/templates/bedimcode");
const ARTIFACT_ROOT = path.resolve(
  process.cwd(),
  "public/template-artifacts/bedimcode",
);
const MANIFEST_OUTPUT_FILE = path.resolve(
  process.cwd(),
  "src/components/landing-pages/templates/bedimcode-manifest.generated.json",
);
const LEGACY_OUTPUT_FILE = path.resolve(
  process.cwd(),
  "src/components/landing-pages/templates/bedimcode-seed-data.generated.json",
);
const CANVAS_WIDTH = 1280;
const VIEWPORT_HEIGHT = 900;
const THUMBNAIL_HINTS = ["preview.png", "preview.jpg", "preview.jpeg", "preview.webp"];
const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]);
const FALLBACK_THUMB = "/images/grid-image/image-01.png";

interface BedimcodeManifestItem {
  template_key: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  thumbnail_url: string;
  preview_image_url: string;
  editor_data_url: string;
  manifest_url: string;
  render_url: string;
  source_type: "github";
  source_repo: string;
  source_ref: string;
  artifact_version: 1;
  content_hash: string;
  is_published: boolean;
  is_featured: boolean;
  price_type: "free" | "pro";
  views_count: number;
  downloads_count: number;
}

interface BedimcodeArtifactManifest extends BedimcodeManifestItem {
  schema_version: number;
}

/** Đường dẫn public phục vụ ảnh/asset của repo. */
function publicAssetUrl(repo: string, relPath: string): string {
  const clean = relPath.replace(/\\/g, "/").replace(/^\.\//, "").replace(/^\//, "");
  return `/templates/bedimcode/${repo}/${clean}`;
}

function artifactUrl(repo: string, fileName: string): string {
  return `/template-artifacts/bedimcode/${repo}/${fileName}`;
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
    // URL bắt đầu bằng "/" là đường dẫn từ gốc của template, không phải từ thư mục CSS.
    const resolved = urlPath.startsWith("/")
      ? urlPath.replace(/^\/+/, "")
      : resolveRelative(cssRelDir, urlPath);
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
function inlineScripts(doc: Document, destDir: string): void {
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

/**
 * Trung hòa ScrollReveal.
 *
 * Nhiều template bedimcode dùng ScrollReveal đặt content `opacity:0` rồi mới hiện khi
 * người dùng cuộn tới. Trong iframe preview auto-height KHÔNG có cuộn thật, nên content
 * dưới fold sẽ ẩn vĩnh viễn → trang trông như trống/đen.
 *
 * Cách xử lý: gỡ script CDN scrollreveal + inject stub định nghĩa window.ScrollReveal
 * TRƯỚC khi main.js chạy, khiến mọi .reveal() thành no-op → content giữ nguyên hiển thị.
 * Không đụng GSAP/Swiper.
 *
 * Hàm này phải chạy trước inlineScripts(); nếu không, script ScrollReveal local sẽ
 * mất thuộc tính src sau khi được inline và không còn cách nhận diện an toàn.
 */
function neutralizeScrollReveal(doc: Document): void {
  // 1. Gỡ mọi <script src> trỏ tới scrollreveal (CDN hoặc local).
  const srScripts = Array.from(doc.querySelectorAll("script[src]")).filter((s) =>
    (s.getAttribute("src") || "").toLowerCase().includes("scrollreveal"),
  );
  const hadScrollReveal = srScripts.length > 0;
  for (const s of srScripts) s.remove();

  if (!hadScrollReveal) return;

  // 2. Inject stub vào đầu <head> để định nghĩa global trước khi main.js gọi.
  const stub = doc.createElement("script");
  stub.setAttribute("data-bedimcode-scrollreveal-stub", "true");
  stub.textContent =
    "window.ScrollReveal=function(){var n=function(){return a;},a={reveal:n,clean:n,sync:n,destroy:n};return a;};";
  const head = doc.head;
  if (head) head.insertBefore(stub, head.firstChild);
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
function buildSections(fullHtml: string, templateKey: string): EditorBlock[] {
  const safeKey = templateKey.replace(/[^a-z0-9_-]+/gi, "-");
  const sectionId = `template_${safeKey}_section`;

  const htmlBlock = createDefaultBlock("html_code");
  htmlBlock.id = `template_${safeKey}_html`;
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

function buildOne(meta: BedimcodeRepoMeta): BedimcodeManifestItem | null {
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
  neutralizeScrollReveal(doc);
  inlineScripts(doc, destDir);
  rewriteDomAssetUrls(doc, meta.repo);

  const fullHtml = buildFullHtmlDocument(doc);
  const templateKey = bedimcodeTemplateKey(meta.repo);
  const sections = buildSections(fullHtml, templateKey);
  const thumbnail = pickThumbnail(destDir, meta.repo);

  const editor_data = {
    pageId: "",
    pageName: meta.name,
    sections,
    pageSettings: createDefaultPageSettings(meta.name),
    schemaVersion: CURRENT_EDITOR_SCHEMA_VERSION,
    templateId: templateKey,
  };
  const contentHash = createHash("sha256")
    .update(JSON.stringify(editor_data))
    .digest("hex");

  const artifactDir = path.join(ARTIFACT_ROOT, meta.repo);
  fs.mkdirSync(artifactDir, { recursive: true });

  const editorDataUrl = artifactUrl(meta.repo, "editor-data.json");
  const manifestUrl = artifactUrl(meta.repo, "manifest.json");
  const renderUrl = artifactUrl(meta.repo, "render.html");

  const item: BedimcodeManifestItem = {
    template_key: templateKey,
    name: meta.name,
    description: meta.name,
    category: meta.category,
    tags: meta.tags,
    thumbnail_url: thumbnail,
    preview_image_url: thumbnail,
    editor_data_url: editorDataUrl,
    manifest_url: manifestUrl,
    render_url: renderUrl,
    source_type: "github",
    source_repo: `${GITHUB_OWNER}/${meta.repo}`,
    source_ref: "main",
    artifact_version: 1,
    content_hash: contentHash,
    is_published: true,
    is_featured: meta.featured === true,
    price_type: meta.isPro ? "pro" : "free",
    views_count: 0,
    downloads_count: 0,
  };

  const artifactManifest: BedimcodeArtifactManifest = {
    ...item,
    schema_version: CURRENT_EDITOR_SCHEMA_VERSION,
  };

  fs.writeFileSync(
    path.join(artifactDir, "editor-data.json"),
    JSON.stringify(editor_data),
    "utf8",
  );
  fs.writeFileSync(
    path.join(artifactDir, "render.html"),
    fullHtml,
    "utf8",
  );
  fs.writeFileSync(
    path.join(artifactDir, "manifest.json"),
    JSON.stringify(artifactManifest, null, 2),
    "utf8",
  );

  console.log(
    `[build] ✅ ${meta.repo}: html=${(fullHtml.length / 1024).toFixed(0)}KB, artifact=${editorDataUrl}`,
  );

  return item;
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

  const explicitRepos = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
  if (explicitRepos.length === 0 && fs.existsSync(ARTIFACT_ROOT)) {
    fs.rmSync(ARTIFACT_ROOT, { recursive: true, force: true });
  }

  console.log(`[build] Dựng template artifacts cho ${list.length} repo...`);
  const items: BedimcodeManifestItem[] = [];
  for (const meta of list) {
    try {
      const item = buildOne(meta);
      if (item) items.push(item);
    } catch (err) {
      console.error(`[build] ❌ ${meta.repo}:`, err instanceof Error ? err.message : err);
    }
  }

  fs.mkdirSync(path.dirname(MANIFEST_OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(MANIFEST_OUTPUT_FILE, JSON.stringify(items, null, 2), "utf8");
  if (fs.existsSync(LEGACY_OUTPUT_FILE)) {
    fs.rmSync(LEGACY_OUTPUT_FILE);
  }
  console.log(
    `[build] Hoàn tất: ${items.length} manifest → ${MANIFEST_OUTPUT_FILE}`,
  );
}

main();
