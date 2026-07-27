/**
 * Manifest nguồn chân lý cho template import từ tài khoản GitHub "bedimcode".
 *
 * - `scripts/fetch-bedimcode-templates.ts` đọc file này để tải source về public/.
 * - `scripts/build-bedimcode-editor-data.ts` đọc file này để dựng editor_data.
 *
 * Category map về đúng 3 enum mà TemplatesLibrary đang lọc:
 *   "ecommerce" | "service" | "others"
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
  /** Thuộc lô chạy thử đợt đầu (5–10 mẫu) */
  testBatch?: boolean;
}

export const GITHUB_OWNER = "bedimcode";

export const BEDIMCODE_REPOS: BedimcodeRepoMeta[] = [
  // ── Landing pages thuần (hero + slider/animation) ──────────────
  { repo: "responsive-art-landing-page", name: "Art Landing Page - Slider Animation", category: "others", isPro: false, tags: ["landing", "art", "slider"], featured: true, testBatch: true },
  { repo: "responsive-desert-landscape-landing-page", name: "Desert Landscape Landing Page", category: "others", isPro: false, tags: ["landing", "landscape", "gsap"] },
  { repo: "responsive-fractal-glass-landing-page", name: "Fractal Glass Landing Page", category: "others", isPro: false, tags: ["landing", "glass", "modern"] },
  { repo: "responsive-sneakers-home-landing-page", name: "Sneakers Home Landing Page", category: "ecommerce", isPro: false, tags: ["landing", "sneakers", "gsap"], featured: true, testBatch: true },
  { repo: "responsive-landing-page-headphones", name: "Headphones Landing Page", category: "ecommerce", isPro: false, tags: ["landing", "headphones", "product"] },
  { repo: "responsive-landing-page-islands-travel", name: "Islands Travel Landing Page", category: "others", isPro: false, tags: ["landing", "travel", "islands"] },
  { repo: "responsive-clothing-landing-page", name: "Clothing Landing Page", category: "ecommerce", isPro: false, tags: ["landing", "clothing", "fashion"] },
  { repo: "landing-page-fashion", name: "Fashion Landing Page", category: "ecommerce", isPro: false, tags: ["landing", "fashion"] },
  { repo: "landing-page-lamborghini", name: "Lamborghini Landing Page", category: "others", isPro: true, tags: ["landing", "car", "luxury"] },
  { repo: "model-landing-page", name: "Model Agency Landing Page", category: "others", isPro: false, tags: ["landing", "model", "agency"] },
  { repo: "parallax-scrolling-website", name: "Parallax Scrolling Website", category: "others", isPro: false, tags: ["parallax", "scroll", "animation"] },

  // ── Food & Beverage ────────────────────────────────────────────
  { repo: "responsive-steakhouse-website", name: "Steakhouse Website", category: "ecommerce", isPro: false, tags: ["food", "steakhouse", "restaurant"], featured: true, testBatch: true },
  { repo: "responsive-sushi-website", name: "Sushi Website", category: "ecommerce", isPro: false, tags: ["food", "sushi", "restaurant"], testBatch: true },
  { repo: "responsive-sushi-website-2", name: "Sushi Website 2", category: "ecommerce", isPro: false, tags: ["food", "sushi", "restaurant"] },
  { repo: "responsive-cake-website", name: "Cake Website", category: "ecommerce", isPro: false, tags: ["food", "cake", "bakery"] },
  { repo: "responsive-bakery-website", name: "Bakery Website", category: "ecommerce", isPro: false, tags: ["food", "bakery"] },
  { repo: "responsive-burger-website", name: "Burger Website", category: "ecommerce", isPro: false, tags: ["food", "burger", "fastfood"] },
  { repo: "responsive-fried-chicken-website", name: "Fried Chicken Website", category: "ecommerce", isPro: false, tags: ["food", "chicken", "fastfood"] },
  { repo: "responsive-coffee-website", name: "Coffee Website", category: "ecommerce", isPro: false, tags: ["food", "coffee"], testBatch: true },
  { repo: "responsive-coffee-website-2", name: "Coffee Website 2", category: "ecommerce", isPro: false, tags: ["food", "coffee"] },
  { repo: "responsive-coffee-website-3", name: "Coffee Website 3", category: "ecommerce", isPro: false, tags: ["food", "coffee"] },
  { repo: "responsive-pizza-website", name: "Pizza Website", category: "ecommerce", isPro: false, tags: ["food", "pizza", "fastfood"] },
  { repo: "responsive-chips-website", name: "Chips Website", category: "ecommerce", isPro: false, tags: ["food", "chips", "snack"] },
  { repo: "responsive-fruit-website", name: "Fruit Website", category: "ecommerce", isPro: false, tags: ["food", "fruit", "organic"] },
  { repo: "responsive-delivery-website", name: "Delivery Website", category: "service", isPro: false, tags: ["food", "delivery", "service"] },
  { repo: "responsive-website-delivery", name: "Delivery Service Website", category: "service", isPro: false, tags: ["food", "delivery", "service"] },
  { repo: "responsive-website-restaurant", name: "Restaurant Website", category: "ecommerce", isPro: false, tags: ["food", "restaurant"] },

  // ── Ngành / dịch vụ ────────────────────────────────────────────
  { repo: "responsive-barbershop-website", name: "Barbershop Website", category: "service", isPro: false, tags: ["service", "barbershop", "beauty"], testBatch: true },
  { repo: "responsive-medical-website", name: "Medical Website", category: "service", isPro: false, tags: ["service", "medical", "health"], featured: true, testBatch: true },
  { repo: "responsive-gym-website", name: "Gym Website", category: "service", isPro: false, tags: ["service", "gym", "fitness"] },
  { repo: "responsive-yoga-website", name: "Yoga Website", category: "service", isPro: false, tags: ["service", "yoga", "wellness"] },
  { repo: "responsive-watches-website", name: "Watches Website", category: "ecommerce", isPro: true, tags: ["ecommerce", "watches", "luxury"], featured: true, testBatch: true },
  { repo: "responsive-watches-website-2", name: "Watches Website 2", category: "ecommerce", isPro: true, tags: ["ecommerce", "watches", "luxury"] },
  { repo: "responsive-shoe-website", name: "Shoe Website", category: "ecommerce", isPro: false, tags: ["ecommerce", "shoe"] },
  { repo: "responsive-sneakers-website", name: "Sneakers Website", category: "ecommerce", isPro: false, tags: ["ecommerce", "sneakers"] },
  { repo: "responsive-clothing-website", name: "Clothing Website", category: "ecommerce", isPro: false, tags: ["ecommerce", "clothing", "fashion"] },
  { repo: "responsive-ecommerce-website", name: "E-commerce Website", category: "ecommerce", isPro: false, tags: ["ecommerce", "shop"] },
  { repo: "responsive-ecommerce-website-sneakers", name: "E-commerce Sneakers Website", category: "ecommerce", isPro: false, tags: ["ecommerce", "sneakers", "shop"] },
  { repo: "responsive-car-website", name: "Car Website", category: "others", isPro: false, tags: ["car", "automotive"] },
  { repo: "responsive-car-website-2", name: "Car Website 2", category: "others", isPro: false, tags: ["car", "automotive"] },
  { repo: "responsive-car-website-3", name: "Car Website 3", category: "others", isPro: false, tags: ["car", "automotive"] },
  { repo: "responsive-real-state-website", name: "Real Estate Website", category: "service", isPro: true, tags: ["service", "real-estate", "property"] },
  { repo: "responsive-architecture-website", name: "Architecture Website", category: "service", isPro: false, tags: ["service", "architecture"] },
  { repo: "responsive-construction-website", name: "Construction Website", category: "service", isPro: false, tags: ["service", "construction"] },

  // ── Chủ đề / theme ─────────────────────────────────────────────
  { repo: "responsive-travel-website", name: "Travel Website", category: "others", isPro: false, tags: ["travel", "tourism"] },
  { repo: "responsive-travel-website-2", name: "Travel Website 2", category: "others", isPro: false, tags: ["travel", "tourism"] },
  { repo: "responsive-travel-website-3", name: "Travel Website 3", category: "others", isPro: false, tags: ["travel", "tourism"] },
  { repo: "responsive-space-website", name: "Space Website", category: "others", isPro: false, tags: ["space", "science"] },
  { repo: "responsive-space-website-2", name: "Space Website 2", category: "others", isPro: false, tags: ["space", "science"] },
  { repo: "responsive-camping-website", name: "Camping Website", category: "others", isPro: false, tags: ["camping", "outdoor", "travel"] },
  { repo: "responsive-christmas-website", name: "Christmas Website", category: "others", isPro: false, tags: ["christmas", "holiday", "event"] },
  { repo: "responsive-christmas-website-2", name: "Christmas Website 2", category: "others", isPro: false, tags: ["christmas", "holiday", "event"] },
  { repo: "responsive-christmas-website-3", name: "Christmas Website 3", category: "others", isPro: false, tags: ["christmas", "holiday", "event"] },
  { repo: "responsive-christmas-website-4", name: "Christmas Website 4", category: "others", isPro: false, tags: ["christmas", "holiday", "event"] },
  { repo: "responsive-halloween-website", name: "Halloween Website", category: "others", isPro: false, tags: ["halloween", "holiday", "event"] },
  { repo: "responsive-halloween-website-2", name: "Halloween Website 2", category: "others", isPro: false, tags: ["halloween", "holiday", "event"] },
  { repo: "responsive-halloween-website-3", name: "Halloween Website 3", category: "others", isPro: false, tags: ["halloween", "holiday", "event"] },
  { repo: "responsive-halloween-website-4", name: "Halloween Website 4", category: "others", isPro: false, tags: ["halloween", "holiday", "event"] },
  { repo: "responsive-nft-website", name: "NFT Website", category: "others", isPro: false, tags: ["nft", "crypto", "web3"] },
  { repo: "responsive-book-website", name: "Book Website", category: "ecommerce", isPro: false, tags: ["book", "ecommerce"] },
  { repo: "responsive-plants-website", name: "Plants Website", category: "ecommerce", isPro: false, tags: ["plants", "organic", "ecommerce"] },
  { repo: "responsive-cactus-website", name: "Cactus Website", category: "ecommerce", isPro: false, tags: ["cactus", "plants", "ecommerce"] },
  { repo: "responsive-temple-website", name: "Temple Website", category: "others", isPro: false, tags: ["temple", "travel", "culture"] },
  { repo: "responsive-pirate-website", name: "Pirate Website", category: "others", isPro: false, tags: ["pirate", "theme", "adventure"] },

  // ── Portfolio ──────────────────────────────────────────────────
  { repo: "responsive-portfolio-complete", name: "Portfolio Website Complete", category: "service", isPro: false, tags: ["portfolio", "personal"] },
];

/** template_key trong DB: tiền tố cố định để không đụng preset t1–t26. */
export function bedimcodeTemplateKey(repo: string): string {
  return `bedimcode-${repo}`;
}
