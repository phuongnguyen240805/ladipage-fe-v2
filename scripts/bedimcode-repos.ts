/**
 * Manifest nguồn chân lý cho template import từ tài khoản GitHub "bedimcode".
 *
 * - `scripts/fetch-bedimcode-templates.ts` đọc file này để tải source về public/.
 * - `scripts/build-bedimcode-editor-data.ts` đọc file này để dựng editor_data.
 *
 * Category map về đúng 3 enum mà TemplatesLibrary đang lọc:
 *   "ecommerce" | "service" | "others"
 *
 * ⚠️ QUAN TRỌNG — vì sao chỉ còn 12 repo:
 * Đa số repo bedimcode trên branch `main` chỉ là "starter scaffold" rỗng
 * (section trống, href="", src="", 0 ảnh) — trang hoàn chỉnh chỉ có trong video tutorial,
 * KHÔNG commit lên repo. Đã scan cả 65 repo và chỉ giữ lại các repo thực sự có nội dung.
 * 53 repo scaffold rỗng (coffee, steakhouse, sushi, medical, gym, car, pizza, nft, space,
 * shoe, sneakers, cactus, temple, pirate, book, yoga, barbershop, cake, bakery, burger...)
 * đã bị loại vì render ra trang trắng/đen.
 *
 * Giấy phép: repo bedimcode phát hành theo MIT.
 */

export type BedimcodeCategory = "ecommerce" | "service" | "others";

export interface BedimcodeRepoMeta {
  /** Tên repo dưới github.com/bedimcode/<repo> */
  repo: string;
  /** Tên hiển thị trong kho template */
  name: string;
  category: BedimcodeCategory;
  isPro: boolean;
  tags: string[];
  /** Đánh dấu featured trên UI */
  featured?: boolean;
  /** Thuộc lô chạy thử nhanh (`pnpm fetch:bedimcode` không có --all) */
  testBatch?: boolean;
}

export const GITHUB_OWNER = "bedimcode";

/** 12 repo đã xác minh CÓ nội dung đầy đủ (imgs/text thực trên GitHub main). */
export const BEDIMCODE_REPOS: BedimcodeRepoMeta[] = [
  // ── Nhiều ảnh, nội dung đầy đủ (confidence cao) ────────────────
  { repo: "responsive-watches-website", name: "Watches Website", category: "ecommerce", isPro: true, tags: ["ecommerce", "watches", "luxury"], featured: true, testBatch: true },
  { repo: "responsive-landing-page-headphones", name: "Headphones Landing Page", category: "ecommerce", isPro: false, tags: ["landing", "headphones", "product"], featured: true, testBatch: true },
  { repo: "responsive-halloween-website", name: "Halloween Website", category: "others", isPro: false, tags: ["halloween", "holiday", "event"], featured: true, testBatch: true },
  { repo: "responsive-christmas-website", name: "Christmas Website", category: "others", isPro: false, tags: ["christmas", "holiday", "event"], testBatch: true },
  { repo: "responsive-travel-website", name: "Travel Website", category: "others", isPro: false, tags: ["travel", "tourism"], testBatch: true },
  { repo: "responsive-plants-website", name: "Plants Website", category: "ecommerce", isPro: false, tags: ["plants", "organic", "ecommerce"] },
  { repo: "responsive-website-restaurant", name: "Restaurant Website", category: "ecommerce", isPro: false, tags: ["food", "restaurant"] },
  { repo: "responsive-landing-page-islands-travel", name: "Islands Travel Landing Page", category: "others", isPro: false, tags: ["landing", "travel", "islands"] },

  // ── Nội dung text-rich (confidence trung bình — cần xem trước) ──
  { repo: "responsive-website-delivery", name: "Delivery Service Website", category: "service", isPro: false, tags: ["food", "delivery", "service"] },
  { repo: "landing-page-lamborghini", name: "Lamborghini Landing Page", category: "others", isPro: true, tags: ["landing", "car", "luxury"] },
  { repo: "model-landing-page", name: "Model Agency Landing Page", category: "others", isPro: false, tags: ["landing", "model", "agency"] },
  { repo: "parallax-scrolling-website", name: "Parallax Scrolling Website", category: "others", isPro: false, tags: ["parallax", "scroll", "animation"] },
];

/** template_key trong DB: tiền tố cố định để không đụng preset t1–t26. */
export function bedimcodeTemplateKey(repo: string): string {
  return `bedimcode-${repo}`;
}
