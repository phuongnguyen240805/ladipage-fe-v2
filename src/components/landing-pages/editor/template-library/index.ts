import { EditorBlock, ensureOnlookBlockMeta } from "../types";
import { BASE_PAGE_TEMPLATE_PRESETS } from "./base-page-templates";
import { THEMED_TEMPLATE_PRESETS } from "./themed-templates";
import { conversionSectionsFor } from "./conversion-sections";
import { id, normalizeProductBlock } from "./shared";
import type { LandingTemplatePreset } from "./shared";

export type { LandingAssetPreset, LandingTemplatePreset } from "./shared";
export { LANDING_ASSETS } from "./shared";

const BASE_LANDING_TEMPLATE_PRESETS = [
  ...BASE_PAGE_TEMPLATE_PRESETS,
  ...THEMED_TEMPLATE_PRESETS,
];

export const LANDING_TEMPLATE_PRESETS: LandingTemplatePreset[] = BASE_LANDING_TEMPLATE_PRESETS.map((template) => {
  const conversionBlocks = conversionSectionsFor(template);

  return {
    ...template,
    blocks: [
      ...conversionBlocks.filter((block) => block.type === "menu").map(normalizeProductBlock),
      ...template.blocks.map(normalizeProductBlock),
      ...conversionBlocks.filter((block) => block.type !== "menu").map(normalizeProductBlock),
    ],
  };
});

export function instantiateTemplateBlocks(templateId: string): EditorBlock[] {
  const preset = LANDING_TEMPLATE_PRESETS.find((item) => item.id === templateId);
  if (!preset) return [];

  return preset.blocks.map((block) =>
    ensureOnlookBlockMeta({
      ...deepClone(block),
      id: id(),
    })
  );
}

function deepClone<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

export function resolveTemplatePresetId(input: { name: string; templateId?: string; id?: string }): string {
  // 1. Nếu templateId khớp trực tiếp với preset → dùng luôn
  if (input.templateId && LANDING_TEMPLATE_PRESETS.some((preset) => preset.id === input.templateId)) {
    return input.templateId;
  }

  // 2. Khớp trực tiếp mã template ID t1-t26
  if (input.id) {
    const directMap: Record<string, string> = {
      t1: "beauty-shop",
      t2: "wedding-invite",
      t3: "herb-tea",
      t4: "smartwatch-performance",
      t5: "beauty-spa",
      t6: "grand-opening",
      t7: "finance-consulting",
      t8: "webinar-lead",
      t9: "hero-slide-show",
      t10: "ladi-product-grid",
      t11: "course-slide-funnel",
      t12: "gallery-showcase",
      t13: "builder-product-kit",
      t14: "builder-ui-elements",
      t15: "saas-minimal",
      t16: "ecommerce-bold",
      t17: "real-estate-premium",
      t18: "online-course",
      t19: "webinar-event",
      t20: "agency-portfolio",
      t21: "clinic-trust",
      t22: "restaurant-menu",
      t23: "mobile-app",
      t24: "finance-lead",
      t25: "beauty-spa",
      t26: "local-service",
    };
    const key = input.id.toLowerCase();
    if (directMap[key]) return directMap[key];
  }

  const value = `${input.name} ${input.id ?? ""}`.toLowerCase();

  // Legacy templates
  if (value.includes("112306") || value.includes("wedding") || value.includes("cuoi") || value.includes("cưới")) return "wedding-invite";
  if (value.includes("112308") || value.includes("smartwatch") || value.includes("dong ho") || value.includes("đồng hồ")) return "smartwatch-performance";
  if (value.includes("112305") || value.includes("112309") || value.includes("my pham") || value.includes("mỹ phẩm") || value.includes("skin") || value.includes("cosmetic")) return "beauty-shop";
  if (value.includes("112307") || value.includes("tra") || value.includes("trà") || value.includes("tea") || value.includes("thao moc") || value.includes("thảo mộc")) return "herb-tea";
  if (value.includes("112310") || value.includes("grand") || value.includes("khai truong") || value.includes("khai trương")) return "grand-opening";
  if (value.includes("112311")) return "finance-consulting";
  if (value.includes("112312") || value.includes("course") || value.includes("khóa học") || value.includes("khoa hoc") || value.includes("dao tao") || value.includes("daotao")) return "webinar-lead";
  if (value.includes("112313") || value.includes("slide show") || value.includes("carousel")) return "hero-slide-show";
  if (value.includes("112314") || value.includes("product grid") || value.includes("flash sale")) return "ladi-product-grid";
  if (value.includes("112315") || value.includes("course funnel") || value.includes("e-learning")) return "course-slide-funnel";
  if (value.includes("112316") || value.includes("gallery showcase")) return "gallery-showcase";
  if (value.includes("112317") || value.includes("builder product kit")) return "builder-product-kit";
  if (value.includes("112318") || value.includes("builder ui elements")) return "builder-ui-elements";
  if (value.includes("review") || value.includes("proof") || value.includes("testimonial")) return "testimonial-strip";

  // 12 template mới — khớp theo ID t15–t26 hoặc từ khóa trong name
  if (value.includes("t15") || value.includes("saas") || value.includes("flux ai crm")) return "saas-minimal";
  if (value.includes("t16") || value.includes("ecommerce") || value.includes("flash sale 70")) return "ecommerce-bold";
  if (value.includes("t17") || value.includes("real estate") || value.includes("biệt thự")) return "real-estate-premium";
  if (value.includes("t18") || value.includes("online course") || value.includes("growthacademy")) return "online-course";
  if (value.includes("t19") || value.includes("webinar event") || value.includes("growth summit")) return "webinar-event";
  if (value.includes("t20") || value.includes("agency") || value.includes("void studio")) return "agency-portfolio";
  if (value.includes("t21") || value.includes("clinic") || value.includes("vitacare")) return "clinic-trust";
  if (value.includes("t22") || value.includes("restaurant") || value.includes("umami")) return "restaurant-menu";
  if (value.includes("t23") || value.includes("mobile app") || value.includes("pendo")) return "mobile-app";
  if (value.includes("t24") || value.includes("finance lead") || value.includes("prosperwealth")) return "finance-lead";
  if (value.includes("t25") || value.includes("beauty spa") || value.includes("lumière")) return "beauty-spa";
  if (value.includes("t26") || value.includes("local service") || value.includes("airfix")) return "local-service";

  // Fallback: random nhưng deterministic theo tên trang
  const pagePresets = LANDING_TEMPLATE_PRESETS.filter((preset) => preset.category === "page");
  const seed = [...value].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return pagePresets[seed % pagePresets.length]?.id ?? "product-launch";
}
