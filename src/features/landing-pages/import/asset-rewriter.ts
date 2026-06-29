import { supabase } from "@/lib/supabase";

/**
 * Phân tích phần mở rộng tệp và trả về MIME type tương ứng.
 */
export function getMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png": return "image/png";
    case "jpg":
    case "jpeg": return "image/jpeg";
    case "gif": return "image/gif";
    case "webp": return "image/webp";
    case "svg": return "image/svg+xml";
    case "mp4": return "video/mp4";
    case "webm": return "video/webm";
    case "woff": return "font/woff";
    case "woff2": return "font/woff2";
    case "ttf": return "font/ttf";
    case "css": return "text/css";
    case "html": return "text/html";
    case "js": return "application/javascript";
    default: return "application/octet-stream";
  }
}

/**
 * Chuyển đổi ArrayBuffer (dữ liệu tệp nhị phân) sang chuỗi Base64 hoạt động ở cả client và server Node.js.
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return typeof window !== "undefined" ? window.btoa(binary) : Buffer.from(buffer).toString("base64");
}

/**
 * Tạo Base64 Data URL tự chứa cho tài nguyên tương đối.
 */
export function getBase64DataUrl(filename: string, buffer: ArrayBuffer): string {
  const mime = getMimeType(filename);
  const base64 = arrayBufferToBase64(buffer);
  return `data:${mime};base64,${base64}`;
}

/**
 * Hàm giải quyết đường dẫn tương đối (Relative Path Resolution).
 * Ví dụ: basePath = "css/style.css", relativePath = "../images/bg.png"
 * Trả về: "images/bg.png"
 */
export function resolveRelativePath(basePath: string, relativePath: string): string {
  const baseParts = basePath.split("/").slice(0, -1);
  const relParts = relativePath.replace(/\\/g, "/").split("/");

  for (const part of relParts) {
    if (part === "." || part === "") {
      continue;
    } else if (part === "..") {
      baseParts.pop();
    } else {
      baseParts.push(part);
    }
  }
  return baseParts.join("/");
}

/**
 * Upload tài nguyên lên Supabase Storage bucket `landing-page-assets`.
 * Nếu có lỗi (bucket chưa tạo hoặc phân quyền thất bại), trả về null để FE dùng cơ chế dự phòng Base64.
 */
export async function uploadAssetToSupabase(
  pageId: string,
  relativePath: string,
  buffer: ArrayBuffer
): Promise<string | null> {
  if (!supabase) return null;

  try {
    const mimeType = getMimeType(relativePath);
    const cleanPath = relativePath.replace(/\\/g, "/").replace(/\.\./g, "");
    const supabasePath = `imports/${pageId}/${cleanPath}`;

    // Khởi tạo file blob để upload
    const fileBlob = new Blob([buffer], { type: mimeType });
    const { error } = await supabase.storage
      .from("landing-page-assets")
      .upload(supabasePath, fileBlob, {
        upsert: true,
        contentType: mimeType,
      });

    if (error) {
      console.warn(`Supabase Storage upload error for ${relativePath}:`, error.message);
      return null;
    }

    // Lấy URL công khai sau khi upload thành công
    const { data } = supabase.storage
      .from("landing-page-assets")
      .getPublicUrl(supabasePath);

    return data?.publicUrl || null;
  } catch (err) {
    console.warn(`Failed to upload ${relativePath} to Supabase:`, err);
    return null;
  }
}

/**
 * Trích xuất URL gốc từ proxy URL cache/CDN (ví dụ: /api/asset-cache?url=https://...)
 */
export function unwrapProxyUrl(url: string): string {
  if (!url) return url;
  if (url.includes("asset-cache") && url.includes("url=")) {
    try {
      const match = url.match(/[?&]url=([^&]+)/);
      if (match && match[1]) {
        const unwrapped = decodeURIComponent(match[1]);
        if (/^(https?:|\/\/|data:)/i.test(unwrapped)) {
          return unwrapped;
        }
      }
    } catch {
      // ignore
    }
  }
  return url;
}

/**
 * Khớp và tìm kiếm một URL tài nguyên trong assetMap một cách linh hoạt,
 * hỗ trợ so khớp chính xác, chuẩn hóa đường dẫn, hoặc so khớp theo tên tệp (filename fallback).
 */
export function findAssetInMap(
  cssFilePath: string,
  urlPath: string,
  assetMap: Map<string, string>
): string | null {
  const unwrappedUrl = unwrapProxyUrl(urlPath);
  const resolved = resolveRelativePath(cssFilePath, unwrappedUrl);
  const normalized = resolved.replace(/\\/g, "/").replace(/^\.\//, "").replace(/^\//, "").toLowerCase();

  // 1. Khớp chính xác
  if (assetMap.has(resolved)) {
    return assetMap.get(resolved) || null;
  }

  // 2. Khớp sau khi chuẩn hóa các key của assetMap
  for (const [key, value] of assetMap.entries()) {
    const normKey = key.replace(/\\/g, "/").replace(/^\.\//, "").replace(/^\//, "").toLowerCase();
    if (normKey === normalized) {
      return value;
    }
  }

  // 3. Khớp theo tên file (cơ chế dự phòng cuối cùng)
  const fileName = unwrappedUrl.split("/").pop()?.split("?")[0].split("#")[0].toLowerCase();
  if (fileName) {
    for (const [key, value] of assetMap.entries()) {
      const normKey = key.replace(/\\/g, "/").toLowerCase();
      if (normKey.endsWith("/" + fileName) || normKey === fileName) {
        return value;
      }
    }
  }

  return null;
}

/**
 * Quét toàn bộ quy tắc CSS và cập nhật đường dẫn tương đối trong các thẻ url() sử dụng assetMap.
 */
export function rewriteCssUrls(
  cssContent: string,
  cssFilePath: string,
  assetMap: Map<string, string>
): string {
  return cssContent.replace(/url\(\s*(['"]?)(.*?)\1\s*\)/g, (match, quote, urlPath) => {
    // Trước hết, unwrap nếu là proxy URL
    const unwrappedUrl = unwrapProxyUrl(urlPath);

    // Giữ nguyên các đường dẫn tuyệt đối hoặc Base64
    if (/^(https?:|data:|\/\/)/i.test(unwrappedUrl)) {
      return `url(${quote}${unwrappedUrl}${quote})`;
    }

    // So khớp linh hoạt đường dẫn tương đối trong assetMap
    const mappedUrl = findAssetInMap(cssFilePath, unwrappedUrl, assetMap);

    if (mappedUrl) {
      return `url(${quote}${mappedUrl}${quote})`;
    }

    return `url(${quote}${unwrappedUrl}${quote})`;
  });
}
