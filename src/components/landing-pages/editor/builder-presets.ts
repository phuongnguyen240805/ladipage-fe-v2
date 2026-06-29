export interface BuilderFontOption {
  name: string;
  stack: string;
}

export interface BuilderFontStylePreset {
  id: string;
  name: string;
  emoji: string;
  description: string;
  fonts: {
    display: string;
    displayStack: string;
    body: string;
    bodyStack: string;
  };
  typography: {
    headingSize: number;
    headingWeight: number;
    subHeadingSize: number;
    subHeadingWeight: number;
    bodySize: number;
    bodyWeight: number;
    buttonSize: number;
    buttonWeight: number;
  };
  theme: {
    primaryColor: string;
    bgColor: string;
  };
}

export const BUILDER_FONT_OPTIONS: BuilderFontOption[] = [
  { name: "Inter", stack: "Inter, sans-serif" },
  { name: "Roboto", stack: "Roboto, sans-serif" },
  { name: "Open Sans", stack: "Open Sans, sans-serif" },
  { name: "Montserrat", stack: "Montserrat, sans-serif" },
  { name: "Poppins", stack: "Poppins, sans-serif" },
  { name: "Playfair Display", stack: "Playfair Display, serif" },
  { name: "Lora", stack: "Lora, serif" },
  { name: "Outfit", stack: "Outfit, sans-serif" },
  { name: "DM Serif Display", stack: "DM Serif Display, serif" },
  { name: "DM Sans", stack: "DM Sans, sans-serif" },
  { name: "Be Vietnam Pro", stack: "Be Vietnam Pro, sans-serif" },
];

export const BUILDER_FONT_STYLE_PRESETS: BuilderFontStylePreset[] = [
  {
    id: "modern",
    name: "Hiện đại",
    emoji: "◆",
    description: "Sạch sẽ, tối giản, chuyên nghiệp",
    fonts: {
      display: "Inter",
      displayStack: "Inter, sans-serif",
      body: "Inter",
      bodyStack: "Inter, sans-serif",
    },
    typography: {
      headingSize: 32,
      headingWeight: 700,
      subHeadingSize: 20,
      subHeadingWeight: 600,
      bodySize: 16,
      bodyWeight: 400,
      buttonSize: 16,
      buttonWeight: 600,
    },
    theme: {
      primaryColor: "#2563eb",
      bgColor: "#ffffff",
    },
  },
  {
    id: "classic",
    name: "Cổ điển",
    emoji: "Aa",
    description: "Trang trọng, đáng tin cậy",
    fonts: {
      display: "Playfair Display",
      displayStack: "Playfair Display, serif",
      body: "Lora",
      bodyStack: "Lora, serif",
    },
    typography: {
      headingSize: 36,
      headingWeight: 700,
      subHeadingSize: 22,
      subHeadingWeight: 600,
      bodySize: 17,
      bodyWeight: 400,
      buttonSize: 16,
      buttonWeight: 600,
    },
    theme: {
      primaryColor: "#92400e",
      bgColor: "#fffaf0",
    },
  },
  {
    id: "bold-commerce",
    name: "Bán hàng đậm",
    emoji: "01",
    description: "Headline mạnh, CTA rõ, hợp sản phẩm và flash sale",
    fonts: {
      display: "Montserrat",
      displayStack: "Montserrat, sans-serif",
      body: "Open Sans",
      bodyStack: "Open Sans, sans-serif",
    },
    typography: {
      headingSize: 40,
      headingWeight: 800,
      subHeadingSize: 20,
      subHeadingWeight: 700,
      bodySize: 16,
      bodyWeight: 400,
      buttonSize: 16,
      buttonWeight: 800,
    },
    theme: {
      primaryColor: "#ef4444",
      bgColor: "#f8fafc",
    },
  },
  {
    id: "soft-service",
    name: "Dịch vụ mềm",
    emoji: "UI",
    description: "Nhẹ, rõ ràng, hợp tư vấn, khóa học và dịch vụ",
    fonts: {
      display: "Poppins",
      displayStack: "Poppins, sans-serif",
      body: "DM Sans",
      bodyStack: "DM Sans, sans-serif",
    },
    typography: {
      headingSize: 34,
      headingWeight: 700,
      subHeadingSize: 19,
      subHeadingWeight: 600,
      bodySize: 16,
      bodyWeight: 400,
      buttonSize: 15,
      buttonWeight: 700,
    },
    theme: {
      primaryColor: "#7c3aed",
      bgColor: "#fbfbff",
    },
  },
  {
    id: "vietnamese-saas",
    name: "Be Vietnam Pro",
    emoji: "VN",
    description: "Đọc tốt tiếng Việt, hợp dashboard và landing B2B",
    fonts: {
      display: "Be Vietnam Pro",
      displayStack: "Be Vietnam Pro, sans-serif",
      body: "Be Vietnam Pro",
      bodyStack: "Be Vietnam Pro, sans-serif",
    },
    typography: {
      headingSize: 34,
      headingWeight: 800,
      subHeadingSize: 20,
      subHeadingWeight: 700,
      bodySize: 16,
      bodyWeight: 400,
      buttonSize: 15,
      buttonWeight: 700,
    },
    theme: {
      primaryColor: "#65a30d",
      bgColor: "#ffffff",
    },
  },
];

export const BUILDER_IMAGE_STYLES = [
  { value: "photorealistic", label: "Ảnh thực", emoji: "📸" },
  { value: "illustration", label: "Minh họa", emoji: "🎨" },
  { value: "3d-render", label: "3D Render", emoji: "▣" },
  { value: "minimal", label: "Tối giản", emoji: "□" },
  { value: "watercolor", label: "Màu nước", emoji: "~" },
];

export const BUILDER_OUTPUT_TYPE_PRESETS = [
  { id: "banner", label: "Banner", emoji: "▭" },
  { id: "product", label: "Product Shot", emoji: "□" },
  { id: "tryon", label: "Thử đồ", emoji: "👗" },
  { id: "art", label: "Nghệ thuật", emoji: "✦" },
  { id: "social", label: "Social Post", emoji: "▦" },
  { id: "free", label: "Tự do", emoji: "✨" },
];

export const BUILDER_ASPECT_RATIOS = [
  { value: "16:9", label: "16:9", tag: "Banner" },
  { value: "4:3", label: "4:3", tag: "Card" },
  { value: "1:1", label: "1:1", tag: "Social" },
  { value: "3:4", label: "3:4", tag: "Portrait" },
];
