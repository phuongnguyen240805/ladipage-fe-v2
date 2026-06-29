import JSZip from "jszip";
import { parseHtmlToEditableBlocksSchema, parseHtmlToPreservedHtmlSchema } from "./html-to-landing-schema";
import { ImportedLandingPageSchema, ImportedAsset } from "./import-types";
import { sanitizeElement } from "./html-sanitizer";
import {
  resolveRelativePath,
  uploadAssetToSupabase,
  getBase64DataUrl,
  rewriteCssUrls,
  getMimeType,
  unwrapProxyUrl,
  findAssetInMap,
} from "./asset-rewriter";

/**
 * Tìm một tập tin trong ZIP một cách linh hoạt, hỗ trợ so khớp đường dẫn chuẩn hóa
 * và cơ chế tìm kiếm tên tệp dự phòng (filename fallback).
 */
export function findFileInZip(
  zip: JSZip,
  basePath: string,
  relativePath: string
): { file: JSZip.JSZipObject; zipPath: string } | null {
  const resolved = resolveRelativePath(basePath, relativePath);
  const normalized = resolved.replace(/\\/g, "/").replace(/^\.\//, "").replace(/^\//, "").toLowerCase();

  // 1. Tìm khớp chính xác (sau khi chuẩn hóa)
  const exactKey = Object.keys(zip.files).find((key) => {
    const normKey = key.replace(/\\/g, "/").replace(/^\.\//, "").replace(/^\//, "").toLowerCase();
    return normKey === normalized;
  });

  if (exactKey) {
    return { file: zip.files[exactKey], zipPath: exactKey };
  }

  // 2. Tìm khớp tương đối bỏ qua folder cha (nếu toàn bộ zip nằm trong 1 folder cha)
  const baseParts = basePath.split("/").slice(0, -1);
  const rootFolder = baseParts.length > 0 ? baseParts[0] + "/" : "";
  if (rootFolder) {
    const resolvedWithRoot = resolveRelativePath(rootFolder + basePath.split("/").pop(), relativePath);
    const normalizedWithRoot = resolvedWithRoot.replace(/\\/g, "/").replace(/^\.\//, "").replace(/^\//, "").toLowerCase();
    const matchWithRoot = Object.keys(zip.files).find((key) => {
      const normKey = key.replace(/\\/g, "/").replace(/^\.\//, "").replace(/^\//, "").toLowerCase();
      return normKey === normalizedWithRoot;
    });
    if (matchWithRoot) {
      return { file: zip.files[matchWithRoot], zipPath: matchWithRoot };
    }
  }

  // 3. Cơ chế dự phòng cuối cùng: tìm theo tên file ở cuối đường dẫn
  const fileName = relativePath.split("/").pop()?.split("?")[0].split("#")[0].toLowerCase();
  if (fileName) {
    const fallbackKey = Object.keys(zip.files).find((key) => {
      const normKey = key.replace(/\\/g, "/").toLowerCase();
      return normKey.endsWith("/" + fileName) || normKey === fileName;
    });
    if (fallbackKey) {
      return { file: zip.files[fallbackKey], zipPath: fallbackKey };
    }
  }

  return null;
}

/**
 * Xử lý nhập khẩu toàn bộ tài liệu từ file ZIP tải lên ở client.
 */
export async function importZipLandingPage(
  file: File,
  pageId: string,
  onProgress?: (progress: number, statusText: string) => void,
  importMode: "preserve" | "convert" = "preserve"
): Promise<ImportedLandingPageSchema> {
  const updateProgress = (progress: number, statusText: string) => {
    if (onProgress) onProgress(progress, statusText);
  };

  updateProgress(10, "Đang đọc tập tin ZIP...");
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(file);

  updateProgress(25, "Đang quét cấu trúc thư mục...");
  // 1. Tìm tệp HTML chính
  const allFiles = Object.keys(loadedZip.files);
  const htmlFiles = allFiles.filter((name) => !loadedZip.files[name].dir && name.toLowerCase().endsWith(".html"));

  if (htmlFiles.length === 0) {
    throw new Error("Không tìm thấy tệp HTML nào trong file ZIP.");
  }

  // Ưu tiên tệp index.html hoặc tệp HTML đầu tiên ở thư mục gốc
  const htmlFilePath =
    htmlFiles.find(
      (name) => name.toLowerCase() === "index.html" || name.toLowerCase().endsWith("/index.html")
    ) || htmlFiles[0];

  const htmlRawContent = await loadedZip.files[htmlFilePath].async("string");

  // Khởi tạo DOMParser để phân tích cấu trúc HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlRawContent, "text/html");

  // 1.5 Khử bọc (unwrap) các liên kết ảnh/tài nguyên proxy (ví dụ: /api/asset-cache?url=...) về đường dẫn tuyệt đối trực tiếp
  const allElementsWithProxy = Array.from(doc.querySelectorAll("[src], [srcset], [style], link[rel='stylesheet']"));
  for (const el of allElementsWithProxy) {
    const src = el.getAttribute("src");
    if (src) {
      const unwrapped = unwrapProxyUrl(src);
      if (unwrapped !== src) el.setAttribute("src", unwrapped);
    }
    const srcset = el.getAttribute("srcset");
    if (srcset) {
      const unwrapped = unwrapProxyUrl(srcset);
      if (unwrapped !== srcset) el.setAttribute("srcset", unwrapped);
    }
    const href = el.getAttribute("href");
    if (href) {
      const unwrapped = unwrapProxyUrl(href);
      if (unwrapped !== href) el.setAttribute("href", unwrapped);
    }
    const style = el.getAttribute("style");
    if (style && style.includes("url(")) {
      const newStyle = style.replace(/url\(\s*(['"]?)(.*?)\1\s*\)/g, (match, quote, urlPath) => {
        const unwrapped = unwrapProxyUrl(urlPath);
        return `url(${quote}${unwrapped}${quote})`;
      });
      if (newStyle !== style) el.setAttribute("style", newStyle);
    }
  }

  // 2. Thu thập và xử lý các liên kết CSS nội bộ tương đối
  updateProgress(40, "Đang xử lý các tệp CSS tương đối...");
  const linkTags = Array.from(doc.querySelectorAll("link[rel='stylesheet']"));
  const localCssFiles: { tag: HTMLLinkElement; zipPath: string }[] = [];

  for (const tag of linkTags) {
    const href = tag.getAttribute("href");
    // Bỏ qua link tuyệt đối
    if (!href || /^(https?:|\/\/|data:)/i.test(href)) {
      continue;
    }
    
    // Tìm file CSS tương đối trong ZIP bằng cơ chế khớp linh hoạt
    const foundCss = findFileInZip(zip, htmlFilePath, href);
    if (foundCss) {
      localCssFiles.push({ tag: tag as HTMLLinkElement, zipPath: foundCss.zipPath });
    }
  }

  // 3. Thu thập tất cả các tài nguyên liên kết tương đối trong DOM
  updateProgress(50, "Đang trích xuất hình ảnh, video và font chữ...");
  const assetMap = new Map<string, string>(); // relativePath -> URL/Base64
  const importedAssets: ImportedAsset[] = [];

  const elementsWithSrc = Array.from(doc.querySelectorAll("[src], source[srcset]"));
  const localAssetPaths = new Set<string>();

  // Thu thập các file ảnh/video từ thuộc tính src hoặc srcset tương đối
  for (const el of elementsWithSrc) {
    const src = el.getAttribute("src") || el.getAttribute("srcset");
    if (!src || /^(https?:|\/\/|data:)/i.test(src)) {
      continue;
    }
    const cleanSrc = src.split("?")[0].split("#")[0];
    const foundAsset = findFileInZip(zip, htmlFilePath, cleanSrc);
    if (foundAsset) {
      localAssetPaths.add(foundAsset.zipPath);
    }
  }

  // Thu thập ảnh nền style inline (background-image)
  const allElements = Array.from(doc.querySelectorAll("*")) as HTMLElement[];
  for (const el of allElements) {
    const style = el.getAttribute("style") || "";
    const bgMatch = style.match(/background-image:\s*url\(['"]?(.*?)['"]?\)/i);
    if (bgMatch && bgMatch[1]) {
      const bgUrl = bgMatch[1].trim();
      if (!/^(https?:|\/\/|data:)/i.test(bgUrl)) {
        const cleanBg = bgUrl.split("?")[0].split("#")[0];
        const foundAsset = findFileInZip(zip, htmlFilePath, cleanBg);
        if (foundAsset) {
          localAssetPaths.add(foundAsset.zipPath);
        }
      }
    }
  }

  // Quét thêm các tệp tin trong các file CSS tương đối để lấy font chữ, ảnh nền trong CSS
  for (const cssFile of localCssFiles) {
    const cssRaw = await loadedZip.files[cssFile.zipPath].async("string");
    const urlsInCss = cssRaw.match(/url\(\s*(['"]?)(.*?)\1\s*\)/g) || [];
    for (const match of urlsInCss) {
      const urlPath = match.replace(/url\(\s*(['"]?)(.*?)\1\s*\)/, "$2").trim();
      const unwrappedPath = unwrapProxyUrl(urlPath);
      if (unwrappedPath && !/^(https?:|\/\/|data:)/i.test(unwrappedPath)) {
        const cleanUrl = unwrappedPath.split("?")[0].split("#")[0];
        const foundAsset = findFileInZip(zip, cssFile.zipPath, cleanUrl);
        if (foundAsset) {
          localAssetPaths.add(foundAsset.zipPath);
        }
      }
    }
  }

  // 4. Xử lý tải lên hoặc inlining Base64 cho tất cả các tài nguyên đã quét
  let processedCount = 0;
  const totalAssets = localAssetPaths.size;

  for (const assetPath of localAssetPaths) {
    processedCount++;
    const percent = 50 + Math.round((processedCount / (totalAssets || 1)) * 30);
    updateProgress(percent, `Đang xử lý tài nguyên (${processedCount}/${totalAssets}): ${assetPath}...`);

    const fileZip = loadedZip.files[assetPath];
    const buffer = await fileZip.async("arraybuffer");

    // 4.1 Thử tải lên Supabase Storage
    let finalUrl = await uploadAssetToSupabase(pageId, assetPath, buffer);

    // 4.2 Cơ chế dự phòng: Convert sang Base64
    if (!finalUrl) {
      finalUrl = getBase64DataUrl(assetPath, buffer);
    }

    assetMap.set(assetPath, finalUrl);
    importedAssets.push({
      path: assetPath,
      mimeType: getMimeType(assetPath),
      url: finalUrl,
      size: buffer.byteLength,
    });
  }

  // 5. Giải quyết inlining CSS và viết lại các url(...)
  updateProgress(85, "Đang biên dịch lại các file CSS...");
  for (const cssFile of localCssFiles) {
    let cssContent = await loadedZip.files[cssFile.zipPath].async("string");
    
    // Viết lại url(...) trong CSS sử dụng assetMap
    cssContent = rewriteCssUrls(cssContent, cssFile.zipPath, assetMap);

    // Tạo thẻ <style> thay thế thẻ <link> để inlined CSS vào HTML trực tiếp
    const styleTag = doc.createElement("style");
    styleTag.innerHTML = `/* Inlined from ZIP: ${cssFile.zipPath} */\n${cssContent}`;
    cssFile.tag.parentNode?.replaceChild(styleTag, cssFile.tag);
  }

  // 6. Viết lại src / inline styles trong HTML bằng assetMap
  updateProgress(90, "Đang viết lại các đường dẫn tài nguyên trong trang...");
  for (const el of elementsWithSrc) {
    const src = el.getAttribute("src");
    if (src && !/^(https?:|\/\/|data:)/i.test(src)) {
      const mappedUrl = findAssetInMap(htmlFilePath, src, assetMap);
      if (mappedUrl) {
        el.setAttribute("src", mappedUrl);
      }
    }

    const srcset = el.getAttribute("srcset");
    if (srcset && !/^(https?:|\/\/|data:)/i.test(srcset)) {
      const mappedUrl = findAssetInMap(htmlFilePath, srcset, assetMap);
      if (mappedUrl) {
        el.setAttribute("srcset", mappedUrl);
      }
    }
  }

  // Viết lại style background-image
  for (const el of allElements) {
    const style = el.getAttribute("style") || "";
    if (style.includes("background-image")) {
      const newStyle = style.replace(/url\(\s*(['"]?)(.*?)\1\s*\)/g, (match, quote, urlPath) => {
        if (/^(https?:|\/\/|data:)/i.test(urlPath)) {
          return match;
        }
        const mappedUrl = findAssetInMap(htmlFilePath, urlPath, assetMap);
        if (mappedUrl) {
          return `url(${quote}${mappedUrl}${quote})`;
        }
        return match;
      });
      el.setAttribute("style", newStyle);
    }
  }

  // 7. Bảo mật: Khử trùng, lọc mã độc hại (Sanitize HTML)
 const shouldPreserveScripts = importMode === "preserve";

  sanitizeElement(doc.body, {
    preserveScripts: shouldPreserveScripts,
    removeOpenDesignScripts: !shouldPreserveScripts,
    allowIframes: shouldPreserveScripts,
  });

  if (doc.head) {
    sanitizeElement(doc.head, {
      preserveScripts: shouldPreserveScripts,
      removeOpenDesignScripts: !shouldPreserveScripts,
      allowIframes: shouldPreserveScripts,
    });
  }

  // 8. Chuyển đổi mã HTML sau khi inline hoàn chỉnh sang schema EditorBlock
  const fullHtmlForParser = `<!doctype html>\n${doc.documentElement.outerHTML}`;

  const importedSchema =
    importMode === "preserve"
      ? parseHtmlToPreservedHtmlSchema(fullHtmlForParser)
      : parseHtmlToEditableBlocksSchema(fullHtmlForParser);

    // Gán lại danh sách assets đã import
    importedSchema.assets = importedAssets;

    updateProgress(100, "Nhập thiết kế thành công!");
    return importedSchema;
  }
