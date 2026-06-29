import { EditorBlock } from "@/components/landing-pages/editor/types";

/**
 * Kiểu dữ liệu mô tả một tài nguyên (ảnh, font, video...) được trích xuất từ file ZIP/HTML.
 */
export interface ImportedAsset {
  path: string;       // Đường dẫn tương đối ban đầu trong file ZIP (vd: "images/hero.png")
  mimeType: string;   // Loại định dạng tệp (vd: "image/png")
  url: string;        // URL cuối cùng (public Supabase Storage URL hoặc Base64 Data URL)
  size: number;       // Dung lượng tệp tính bằng byte
}

/**
 * Schema kết quả của quá trình nhập khẩu Landing Page.
 */
export interface ImportedLandingPageSchema {
  globalCss: string;
  assets: ImportedAsset[];
  sections: EditorBlock[];
}

/**
 * Trạng thái và metadata theo dõi tiến trình của tác vụ nhập khẩu (Import Job).
 */
export interface ImportJobMetadata {
  importId: string;
  sourceType: "html" | "zip";
  status: "pending" | "processing" | "success" | "failed";
  originalFileName: string;
  error?: string;
  warnings: string[];
  assetCount: number;
  blockCount: number;
  createdAt: string;
}
