// ============================================================
//  VISUAL EDITOR — TYPE DEFINITIONS
//  Inspired by: Onlook (UI/UX) + Puck (data model/fields)
// ============================================================

// ── Device Preview Modes ────────────────────────────────────
export type DeviceMode = "desktop" | "tablet" | "mobile";
export type EditorViewMode = "design" | "preview" | "code";

export const ONLOOK_ATTRIBUTES = {
  DATA_ONLOOK_ID: "data-oid",
  DATA_ONLOOK_INSTANCE_ID: "data-oiid",
  DATA_ONLOOK_DOM_ID: "data-odid",
  DATA_ONLOOK_COMPONENT_NAME: "data-ocname",
  DATA_ONLOOK_INSERTED: "data-onlook-inserted",
} as const;

export const DEVICE_WIDTHS: Record<DeviceMode, number> = {
  desktop: 1280,
  tablet: 768,
  mobile: 390,
};

// ── Block Types (Component Palette) ─────────────────────────
export type BlockType =
  | "hero"
  | "product_section"
  | "form_section"
  | "footer"
  | "custom_section"
  | "text"
  | "image"
  | "button"
  | "spacer"
  | "columns"
  | "feature_card"
  | "testimonial"
  | "divider"
  | "countdown"
  | "video"
  | "form_capture"
  | "chat_widget"
  | "funnel_popup"
  | "smartwatch_landing"
  | "tea_landing"
  | "gallery"
  | "box"
  | "icon"
  | "product_card"
  | "collection_list"
  | "carousel"
  | "tabs"
  | "frame"
  | "accordion"
  | "table"
  | "survey"
  | "menu"
  | "html_code";

export type EditorNodeKind = "section" | "container" | "element" | "widget";
export type DropPosition = "before" | "after" | "inside";

const SECTION_NODE_TYPES = new Set<BlockType>([
  "hero",
  "product_section",
  "form_section",
  "footer",
  "custom_section",
  "smartwatch_landing",
  "tea_landing",
  "menu",
]);

const CONTAINER_NODE_TYPES = new Set<BlockType>([
  "box",
  "columns",
  "frame",
  "card" as BlockType,
  "tabs",
  "accordion",
  "carousel",
  "gallery",
  "collection_list",
  "product_card",
  "feature_card",
  "testimonial",
]);

const ELEMENT_NODE_TYPES = new Set<BlockType>([
  "text",
  "button",
  "image",
  "icon",
  "divider",
  "spacer",
  "html_code",
]);

const WIDGET_NODE_TYPES = new Set<BlockType>([
  "form_capture",
  "countdown",
  "chat_widget",
  "funnel_popup",
  "video",
  "table",
  "survey",
]);

export function getNodeKind(blockType: BlockType, explicitKind?: EditorNodeKind): EditorNodeKind {
  if (explicitKind) return explicitKind;
  if (SECTION_NODE_TYPES.has(blockType)) return "section";
  if (CONTAINER_NODE_TYPES.has(blockType)) return "container";
  if (ELEMENT_NODE_TYPES.has(blockType)) return "element";
  if (WIDGET_NODE_TYPES.has(blockType)) return "widget";
  return "container";
}

export function isElementNodeType(blockType: BlockType): boolean {
  return getNodeKind(blockType) === "element";
}

export function canNodeHaveChildren(nodeOrType: EditorBlock | BlockType): boolean {
  const kind = typeof nodeOrType === "string"
    ? getNodeKind(nodeOrType)
    : getNodeKind(nodeOrType.type, nodeOrType.kind);
  return kind === "section" || kind === "container";
}

// ── Block Palette Categories ─────────────────────────────────
export interface PaletteCategory {
  id: string;
  label: string;
  icon: string;
  blocks: BlockType[];
}

export const PALETTE_CATEGORIES: PaletteCategory[] = [
  {
    id: "layout",
    label: "Bố cục",
    icon: "grid",
    blocks: ["columns", "spacer", "divider"],
  },
  {
    id: "typography",
    label: "Nội dung",
    icon: "type",
    blocks: ["hero", "text", "countdown"],
  },
  {
    id: "media",
    label: "Media",
    icon: "image",
    blocks: ["image", "video"],
  },
  {
    id: "cta",
    label: "Hành động",
    icon: "cursor",
    blocks: ["button", "form_capture"],
  },
  {
    id: "social",
    label: "Social Proof",
    icon: "star",
    blocks: ["feature_card", "testimonial"],
  },
  {
    id: "widgets",
    label: "Widget",
    icon: "plug",
    blocks: ["chat_widget", "funnel_popup"],
  },
];

// ── Per-block Prop Schemas ───────────────────────────────────

export interface HeroProps {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaUrl: string;
  ctaColor: string;
  bgColor: string;
  bgImage: string;
  textAlign: "left" | "center" | "right";
  minHeight: number;
  overlayOpacity: number;
}

export interface TextProps {
  content: string;
  fontSize: number;
  color: string;
  textAlign: "left" | "center" | "right";
  lineHeight: number;
  paddingX: number;
  paddingY: number;
}

export interface ImageProps {
  src: string;
  alt: string;
  caption: string;
  width: "full" | "large" | "medium" | "small";
  borderRadius: number;
  showCaption: boolean;
  objectFit: "cover" | "contain" | "fill";
}

export interface ButtonProps {
  label: string;
  url: string;
  style: "filled" | "outline" | "ghost" | "text";
  color: string;
  textColor: string;
  size: "sm" | "md" | "lg";
  fullWidth: boolean;
  borderRadius: number;
  align: "left" | "center" | "right";
  icon: string;
}

export interface SpacerProps {
  height: number;
  bgColor: string;
}

export interface DividerProps {
  color: string;
  thickness: number;
  style: "solid" | "dashed" | "dotted";
  paddingX: number;
  paddingY: number;
}

export interface ColumnsProps {
  columns: number;
  gap: number;
  distribution: "equal" | "60-40" | "40-60" | "70-30" | "30-70";
  children: EditorBlock[][];
}

export interface FeatureCardProps {
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  bgColor: string;
  borderColor: string;
  borderRadius: number;
}

export interface TestimonialProps {
  quote: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  rating: number;
  bgColor: string;
  textColor: string;
  showRating: boolean;
}

export interface CountdownProps {
  targetDate: string;
  title: string;
  expiredText: string;
  bgColor: string;
  accentColor: string;
}

export interface VideoProps {
  url: string;
  thumbnail: string;
  autoplay: boolean;
  muted: boolean;
  controls: boolean;
  aspectRatio: "16/9" | "4/3" | "1/1";
  borderRadius: number;
}

export interface FormCaptureProps {
  title: string;
  subtitle: string;
  fields: { id: string; label: string; type: "text" | "email" | "phone"; required: boolean }[];
  submitLabel: string;
  submitColor: string;
  bgColor: string;
  borderRadius: number;
}

export interface TeaLandingProps {
  brand: string;
  navItems: string[];
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaUrl: string;
  heroImage: string;
  philosophyTitle: string;
  philosophyText: string;
  blends: { id: string; name: string; description: string; icon: string }[];
  ingredients: { id: string; name: string; description: string; icon: string }[];
  brewSteps: { id: string; label: string; value: string }[];
  reviewQuote: string;
  reviewAuthor: string;
  signupTitle: string;
  signupPlaceholder: string;
  signupButton: string;
  accentColor: string;
  bgColor: string;
}

export interface ChatWidgetProps {
  title: string;
  greeting: string;
  agentName: string;
  replyTime: string;
  primaryChannel: string;
  secondaryChannel: string;
  buttonLabel: string;
  accentColor: string;
  bgColor: string;
  position: "right" | "left";
  showSurvey: boolean;
}

export interface FunnelPopupProps {
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  trigger: "immediate" | "time_on_page" | "scroll_progress" | "exit_intent" | "inactivity";
  triggerValue: number;
  frequency: "once" | "session" | "always";
  accentColor: string;
  bgColor: string;
  imageUrl: string;
  showBackdrop: boolean;
}

export interface SmartwatchLandingProps {
  brand: string;
  eyebrow: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaUrl: string;
  productImage: string;
  cards: { id: string; kicker: string; title: string; description: string; accentColor: string }[];
  countdownTitle: string;
  accentColor: string;
  bgColor: string;
}

export interface GalleryProps {
  images: string[];
  columns: number;
  gap: number;
  borderRadius: number;
  aspectRatio: "1/1" | "16/9" | "4/3" | "auto";
}

export interface BoxProps {
  bgColor: string;
  bgImage?: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  paddingX: number;
  paddingY: number;
  shadow: "none" | "sm" | "md" | "lg";
  title: string;
  description: string;
}

export interface IconProps {
  icon: string;
  size: number;
  color: string;
  bgColor: string;
  borderRadius: number;
  align: "left" | "center" | "right";
}

export interface ProductCardProps {
  title: string;
  description: string;
  price: string;
  oldPrice: string;
  image: string;
  badge: string;
  ctaText: string;
  bgColor: string;
  borderColor: string;
  borderRadius: number;
  items?: {
    id: string;
    title: string;
    description: string;
    price: string;
    oldPrice?: string;
    image: string;
    badge?: string;
  }[];
  columns?: number;
}

export interface CollectionListProps {
  items: { id: string; title: string; desc: string; icon: string; image?: string }[];
  columns: number;
  layout: "grid" | "list";
  bgColor: string;
}

export interface CarouselProps {
  images: string[];
  autoplay: boolean;
  interval: number;
  showIndicators: boolean;
  showArrows: boolean;
  height: number;
}

export interface TabsProps {
  tabs: { id: string; label: string; content: string }[];
  activeTabId: string;
  style: "pills" | "underline" | "solid";
  accentColor: string;
}

export interface FrameProps {
  url: string;
  height: number;
  title: string;
  browserMockup: boolean;
}

export interface AccordionProps {
  items: { id: string; question: string; answer: string }[];
  allowMultiple: boolean;
  accentColor: string;
}

export interface TableProps {
  headers: string[];
  rows: string[][];
  bgColor: string;
  borderColor: string;
}

export interface SurveyProps {
  question: string;
  options: string[];
  accentColor: string;
  submitLabel: string;
}

export interface MenuProps {
  logoText: string;
  logoUrl: string;
  items: { label: string; url: string }[];
  bgColor: string;
  textColor: string;
}

export interface HtmlCodeProps {
  code: string;
  height: number;
  preserveHtml?: boolean;
  mode?: "div" | "iframe";
}

// ── Union of all block props ─────────────────────────────────
export type BlockProps =
  | { type: "hero"; props: HeroProps }
  | { type: "text"; props: TextProps }
  | { type: "image"; props: ImageProps }
  | { type: "button"; props: ButtonProps }
  | { type: "spacer"; props: SpacerProps }
  | { type: "divider"; props: DividerProps }
  | { type: "columns"; props: ColumnsProps }
  | { type: "feature_card"; props: FeatureCardProps }
  | { type: "testimonial"; props: TestimonialProps }
  | { type: "countdown"; props: CountdownProps }
  | { type: "video"; props: VideoProps }
  | { type: "form_capture"; props: FormCaptureProps }
  | { type: "chat_widget"; props: ChatWidgetProps }
  | { type: "funnel_popup"; props: FunnelPopupProps }
  | { type: "smartwatch_landing"; props: SmartwatchLandingProps }
  | { type: "tea_landing"; props: TeaLandingProps }
  | { type: "gallery"; props: GalleryProps }
  | { type: "box"; props: BoxProps }
  | { type: "icon"; props: IconProps }
  | { type: "product_card"; props: ProductCardProps }
  | { type: "collection_list"; props: CollectionListProps }
  | { type: "carousel"; props: CarouselProps }
  | { type: "tabs"; props: TabsProps }
  | { type: "frame"; props: FrameProps }
  | { type: "accordion"; props: AccordionProps }
  | { type: "table"; props: TableProps }
  | { type: "survey"; props: SurveyProps }
  | { type: "menu"; props: MenuProps }
  | { type: "html_code"; props: HtmlCodeProps };

// ── Editor Block (single canvas item) ───────────────────────
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export interface JsonObject {
  [key: string]: JsonValue;
}

// The legacy renderer still narrows props at component boundaries.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EditorBlockProps = any;

export interface ElementFrame {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  rotate?: number;
}

export interface DeviceOverride<TProps = EditorBlockProps> {
  frame?: Partial<ElementFrame>;
  props?: Partial<TProps>;
}

export type ResponsiveOverrides<TProps = EditorBlockProps> = Partial<
  Record<DeviceMode, DeviceOverride<TProps>>
>;

export interface EditorBlock<TProps = EditorBlockProps> {
  id: string;
  type: BlockType;
  kind?: EditorNodeKind;
  parentId?: string | null;
  props: TProps;
  frame?: ElementFrame;
  children?: EditorBlock[];
  responsive?: ResponsiveOverrides<TProps>;
  label?: string;
  locked?: boolean;
  hidden?: boolean;
  oid?: string;
  instanceId?: string;
  domId?: string;
  componentName?: string;
}

export type EditorNode<TProps = EditorBlockProps> = EditorBlock<TProps>;

export function getEffectiveFrame(node: EditorBlock, deviceMode: DeviceMode): ElementFrame {
  const base: ElementFrame = node.frame || { x: 0, y: 0, width: 200, height: 100, zIndex: 1, rotate: 0 };
  const override = node.responsive?.[deviceMode]?.frame;
  return {
    ...base,
    ...override,
  } as ElementFrame;
}

// ── Root editor data (serialisable state) ───────────────────
export interface EditorData {
  pageId: string;
  pageName: string;
  sections: EditorBlock[];
  pageSettings: EditorPageSettings;
  schemaVersion: number;
  assets?: any[];
}

export interface EditorPageSettings {
  bgColor: string;
  maxWidth: number;
  fontFamily: string;
  primaryColor: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  slug: string;
  customDomain: string;
  pixelId: string;
  sandboxProvider: "local" | "codesandbox" | "vercel";
  sandboxId: string;
  sandboxPort: number;
  sandboxStatus: "local" | "connecting" | "ready" | "error";
  sandboxUrl: string;
  previewPath: string;
  funnelEnabled: boolean;
  funnelFeatureFlag: string;
  funnelTrigger: "immediate" | "time_on_page" | "scroll_progress" | "exit_intent" | "inactivity";
  funnelTriggerThreshold: number;
  funnelFrequency: "once" | "session" | "always";
  posthogEnabled: boolean;
  posthogProjectKey: string;
  sessionReplayEnabled: boolean;
  globalCss?: string;
}

export function createDefaultPageSettings(pageName = ""): EditorPageSettings {
  const slug = pageName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "landing-page";

  return {
    bgColor: "#ffffff",
    maxWidth: 1280,
    fontFamily: "Inter, sans-serif",
    primaryColor: "#65a30d",
    seoTitle: pageName || "Landing Page",
    seoDescription: "Landing page duoc tao bang visual editor.",
    canonicalUrl: "",
    slug,
    customDomain: "",
    pixelId: "",
    sandboxProvider: "local",
    sandboxId: "",
    sandboxPort: 3000,
    sandboxStatus: "local",
    sandboxUrl: "",
    previewPath: `/${slug}`,
    funnelEnabled: false,
    funnelFeatureFlag: "funnelx.welcome_popup",
    funnelTrigger: "immediate",
    funnelTriggerThreshold: 5000,
    funnelFrequency: "session",
    posthogEnabled: false,
    posthogProjectKey: "",
    sessionReplayEnabled: false,
    globalCss: "",
  };
}

// ── Drag & Drop item types ───────────────────────────────────
export const DND_TYPES = {
  PALETTE_BLOCK: "PALETTE_BLOCK",   // dragging FROM palette
  CANVAS_BLOCK: "CANVAS_BLOCK",     // reordering inside canvas
} as const;

export interface PaletteDragItem {
  type: typeof DND_TYPES.PALETTE_BLOCK;
  blockType: BlockType;
}

export interface CanvasDragItem {
  type: typeof DND_TYPES.CANVAS_BLOCK;
  blockId: string;
  index: number;
  parentId?: string;
  columnIndex?: number;
}

// ── Default props factory ───────────────────────────────────
export function createDefaultBlock(blockType: BlockType): EditorBlock {
  const id = `block_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const defaults: Record<BlockType, EditorBlock["props"]> = {
    hero: {
      headline: "Tiêu đề chính của bạn ở đây",
      subheadline: "Mô tả ngắn gọn về sản phẩm hoặc dịch vụ của bạn để thu hút khách hàng.",
      ctaText: "Mua ngay",
      ctaUrl: "#",
      ctaColor: "#65a30d",
      bgColor: "#0f172a",
      bgImage: "",
      textAlign: "center",
      minHeight: 480,
      overlayOpacity: 0.5,
    } as HeroProps,
    text: {
      content: "Nhập nội dung văn bản của bạn tại đây. Bạn có thể thay đổi font, màu sắc và căn chỉnh từ bảng inspector bên phải.",
      fontSize: 16,
      color: "#374151",
      textAlign: "left",
      lineHeight: 1.7,
      paddingX: 32,
      paddingY: 24,
    } as TextProps,
    image: {
      src: "",
      alt: "Mô tả ảnh",
      caption: "",
      width: "full",
      borderRadius: 8,
      showCaption: false,
      objectFit: "cover",
    } as ImageProps,
    button: {
      label: "Nhấn vào đây",
      url: "#",
      style: "filled",
      color: "#65a30d",
      textColor: "#ffffff",
      size: "md",
      fullWidth: false,
      borderRadius: 8,
      align: "center",
      icon: "",
    } as ButtonProps,
    spacer: {
      height: 48,
      bgColor: "transparent",
    } as SpacerProps,
    divider: {
      color: "#e5e7eb",
      thickness: 1,
      style: "solid",
      paddingX: 32,
      paddingY: 16,
    } as DividerProps,
    columns: {
      columns: 2,
      gap: 24,
      distribution: "equal",
      children: [[], []],
    } as ColumnsProps,
    feature_card: {
      icon: "⚡",
      iconColor: "#65a30d",
      iconBg: "#dbeafe",
      title: "Tiêu đề tính năng",
      description: "Mô tả ngắn gọn về tính năng hoặc lợi ích mà khách hàng nhận được.",
      bgColor: "#ffffff",
      borderColor: "#e5e7eb",
      borderRadius: 12,
    } as FeatureCardProps,
    testimonial: {
      quote: "Sản phẩm tuyệt vời! Tôi đã sử dụng và rất hài lòng với chất lượng dịch vụ.",
      authorName: "Nguyễn Văn A",
      authorRole: "Giám đốc Marketing",
      authorAvatar: "",
      rating: 5,
      bgColor: "#f8fafc",
      textColor: "#1e293b",
      showRating: true,
    } as TestimonialProps,
    countdown: {
      targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      title: "Ưu đãi kết thúc sau",
      expiredText: "Ưu đãi đã kết thúc",
      bgColor: "#1e293b",
      accentColor: "#f97316",
    } as CountdownProps,
    video: {
      url: "",
      thumbnail: "",
      autoplay: false,
      muted: true,
      controls: true,
      aspectRatio: "16/9",
      borderRadius: 8,
    } as VideoProps,
    form_capture: {
      title: "Đăng ký nhận ưu đãi",
      subtitle: "Điền thông tin để nhận ngay quà tặng hấp dẫn",
      fields: [
        { id: "name", label: "Họ và tên", type: "text", required: true },
        { id: "phone", label: "Số điện thoại", type: "phone", required: true },
      ],
      submitLabel: "Đăng ký ngay",
      submitColor: "#16a34a",
      bgColor: "#ffffff",
      borderRadius: 12,
    } as FormCaptureProps,
    chat_widget: {
      title: "LadiChat hỗ trợ",
      greeting: "Xin chào, bạn cần tư vấn sản phẩm hay hỗ trợ đơn hàng?",
      agentName: "Tư vấn viên",
      replyTime: "Phản hồi trong vài phút",
      primaryChannel: "Chat ngay",
      secondaryChannel: "Zalo",
      buttonLabel: "Bắt đầu trò chuyện",
      accentColor: "#2511d9",
      bgColor: "#ffffff",
      position: "right",
      showSurvey: true,
    } as ChatWidgetProps,
    funnel_popup: {
      title: "Nhận ưu đãi trước khi rời trang",
      description: "Để lại thông tin để nhận mã giảm giá và tài liệu tư vấn phù hợp.",
      ctaText: "Nhận ưu đãi",
      ctaUrl: "#lead-form",
      trigger: "exit_intent",
      triggerValue: 60,
      frequency: "session",
      accentColor: "#65a30d",
      bgColor: "#ffffff",
      imageUrl: "",
      showBackdrop: true,
    } as FunnelPopupProps,
    smartwatch_landing: {
      brand: "Titan Watch",
      eyebrow: "Titan Watch 7",
      headline: "NEXT-LEVEL SMARTWATCH. UNMATCHED ENDURANCE.",
      subheadline: "The ultimate companion for performance, health tracking and everyday connection.",
      ctaText: "Buy now | $499",
      ctaUrl: "#order",
      productImage: "/images/product/smartwatch_product.png",
      cards: [
        { id: "processor", kicker: "(1) Performance", title: "Chronos X1 Processor", description: "Lightning-fast, smooth interface.", accentColor: "#22d3ee" },
        { id: "health", kicker: "(2) Health tracking", title: "Advanced Biometrics", description: "ECG, SpO2, heart rate.", accentColor: "#ef4444" },
        { id: "battery", kicker: "(3) Battery", title: "24-day battery life", description: "Power that lasts. Magnetic quick charge.", accentColor: "#22c55e" },
        { id: "design", kicker: "(4) Design", title: "Military-grade durability", description: "Titanium body, water resistant.", accentColor: "#94a3b8" },
        { id: "connect", kicker: "(5) Connectivity", title: "Stay connected always", description: "LTE, GPS, smart notifications.", accentColor: "#38bdf8" },
      ],
      countdownTitle: "Ready to elevate your performance?",
      accentColor: "#facc15",
      bgColor: "#05070b",
    } as SmartwatchLandingProps,
    tea_landing: {
      brand: "Pure Leaf",
      navItems: ["Shop", "About", "FAQ", "Contact"],
      headline: "Pure Leaf Organic Green Tea",
      subheadline: "Revitalize your mind and body, naturally.",
      ctaText: "Shop Now",
      ctaUrl: "#order",
      heroImage: "/images/product/green_tea_product.png",
      philosophyTitle: "Our Philosophy",
      philosophyText: "Source organic ingredients and effortless sales. We build a landing page that tells the product story clearly.",
      blends: [
        { id: "zen", name: "Zen Green Tea", description: "Lower caffeine blend for calm focus.", icon: "leaf" },
        { id: "mint", name: "Mint Fresh", description: "Refreshing mint profile for daily energy.", icon: "mint" },
        { id: "jasmine", name: "Jasmine Blossom", description: "Soft floral notes for relaxing rituals.", icon: "flower" },
      ],
      ingredients: [
        { id: "tea", name: "Tea Leaf", description: "Natural green tea leaves.", icon: "leaf" },
        { id: "mint", name: "Mint Fresh", description: "Cool and refreshing.", icon: "mint" },
        { id: "ginger", name: "Ginger Root", description: "Warm herbal balance.", icon: "ginger" },
      ],
      brewSteps: [
        { id: "temp", label: "Temperature", value: "80C" },
        { id: "time", label: "Time", value: "3 min" },
        { id: "enjoy", label: "Enjoy", value: "Sip slow" },
      ],
      reviewQuote: "The freshest tea I have ever tasted.",
      reviewAuthor: "Verified customer",
      signupTitle: "Join Our Community",
      signupPlaceholder: "Your email address",
      signupButton: "Subscribe",
      accentColor: "#6f8f22",
      bgColor: "#f5f2e7",
    } as TeaLandingProps,
    gallery: {
      images: [
        "/images/product/green_tea_product.png",
        "/images/product/skincare_product.png",
        "/images/product/smartwatch_product.png",
      ],
      columns: 3,
      gap: 16,
      borderRadius: 12,
      aspectRatio: "1/1",
    } as GalleryProps,
    box: {
      bgColor: "#f3f4f6",
      borderColor: "#e5e7eb",
      borderWidth: 1,
      borderRadius: 12,
      paddingX: 24,
      paddingY: 24,
      shadow: "md",
      title: "Hộp Tiêu Chuẩn",
      description: "Hộp này có thể chứa nội dung hoặc các phần tử khác.",
    } as BoxProps,
    icon: {
      icon: "⭐",
      size: 40,
      color: "#f59e0b",
      bgColor: "#fef3c7",
      borderRadius: 9999,
      align: "center",
    } as IconProps,
    product_card: {
      title: "Sản phẩm Premium",
      description: "Mô tả tính năng vượt trội của sản phẩm này mang lại lợi ích gì cho bạn.",
      price: "499.000đ",
      oldPrice: "799.000đ",
      image: "/images/product/skincare_product.png",
      badge: "Bán chạy",
      ctaText: "MUA NGAY",
      bgColor: "#ffffff",
      borderColor: "#e5e7eb",
      borderRadius: 16,
    } as ProductCardProps,
    collection_list: {
      items: [
        { id: "1", title: "Tính năng 1", desc: "Mô tả chi tiết tính năng 1 cực kỳ hấp dẫn.", icon: "⚡" },
        { id: "2", title: "Tính năng 2", desc: "Mô tả chi tiết tính năng 2 cực kỳ hấp dẫn.", icon: "💎" },
        { id: "3", title: "Tính năng 3", desc: "Mô tả chi tiết tính năng 3 cực kỳ hấp dẫn.", icon: "🛡️" },
      ],
      columns: 3,
      layout: "grid",
      bgColor: "transparent",
    } as CollectionListProps,
    carousel: {
      images: [
        "/images/product/green_tea_product.png",
        "/images/product/skincare_product.png",
        "/images/product/smartwatch_product.png",
      ],
      autoplay: true,
      interval: 3000,
      showIndicators: true,
      showArrows: true,
      height: 350,
    } as CarouselProps,
    tabs: {
      tabs: [
        { id: "desc", label: "Mô tả", content: "Đây là thông tin chi tiết về sản phẩm chất lượng cao." },
        { id: "spec", label: "Thông số", content: "Chất liệu: Tự nhiên 100%. Xuất xứ: Việt Nam." },
        { id: "review", label: "Đánh giá", content: "Được đánh giá 5 sao từ hơn 1000 khách hàng." },
      ],
      activeTabId: "desc",
      style: "pills",
      accentColor: "#65a30d",
    } as TabsProps,
    frame: {
      url: "https://example.com",
      height: 400,
      title: "Trang web liên kết",
      browserMockup: true,
    } as FrameProps,
    accordion: {
      items: [
        { id: "q1", question: "Sản phẩm có chính sách bảo hành thế nào?", answer: "Chúng tôi bảo hành 12 tháng 1 đổi 1 nếu có lỗi từ nhà sản xuất." },
        { id: "q2", question: "Thời gian giao hàng mất bao lâu?", answer: "Thời gian giao hàng từ 2-4 ngày làm việc tùy khu vực." },
        { id: "q3", question: "Tôi có thể thanh toán khi nhận hàng không?", answer: "Có, bạn hoàn toàn có thể chọn hình thức COD thanh toán khi nhận hàng." },
      ],
      allowMultiple: false,
      accentColor: "#65a30d",
    } as AccordionProps,
    table: {
      headers: ["Gói dịch vụ", "Tính năng", "Giá"],
      rows: [
        ["Cơ bản", "Hỗ trợ email, 1 domain", "Miễn phí"],
        ["Nâng cao", "Hỗ trợ 24/7, 5 domain, CDN", "299K / tháng"],
        ["Doanh nghiệp", "Tất cả tính năng, không giới hạn", "999K / tháng"],
      ],
      bgColor: "#ffffff",
      borderColor: "#e5e7eb",
    } as TableProps,
    survey: {
      question: "Bạn đánh giá thế nào về chất lượng sản phẩm?",
      options: ["Rất hài lòng", "Hài lòng", "Bình thường", "Chưa hài lòng"],
      accentColor: "#65a30d",
      submitLabel: "Gửi khảo sát",
    } as SurveyProps,
    menu: {
      logoText: "LADI-APP",
      logoUrl: "#",
      items: [
        { label: "Trang chủ", url: "#" },
        { label: "Tính năng", url: "#features" },
        { label: "Bảng giá", url: "#pricing" },
        { label: "Liên hệ", url: "#contact" },
      ],
      bgColor: "#ffffff",
      textColor: "#1f2937",
    } as MenuProps,
    html_code: {
      code: "<div style='padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; text-align: center; font-weight: bold;'>HTML Custom Code Block</div>",
      height: 100,
    } as HtmlCodeProps,
    product_section: {
      bgColor: "#f8fafc",
      borderColor: "transparent",
      borderWidth: 0,
      borderRadius: 0,
      paddingX: 32,
      paddingY: 64,
      shadow: "none",
      title: "Danh mục sản phẩm",
      description: "Khám phá các sản phẩm nổi bật của chúng tôi",
    } as BoxProps,
    form_section: {
      bgColor: "#ffffff",
      borderColor: "transparent",
      borderWidth: 0,
      borderRadius: 0,
      paddingX: 32,
      paddingY: 64,
      shadow: "none",
      title: "Đăng ký nhận tư vấn",
      description: "Điền thông tin bên dưới để được liên hệ sớm nhất",
    } as BoxProps,
    footer: {
      bgColor: "#0f172a",
      borderColor: "transparent",
      borderWidth: 0,
      borderRadius: 0,
      paddingX: 32,
      paddingY: 48,
      shadow: "none",
      title: "Bản quyền © 2026",
      description: "Mọi quyền được bảo lưu.",
    } as BoxProps,
    custom_section: {
      bgColor: "#ffffff",
      borderColor: "transparent",
      borderWidth: 0,
      borderRadius: 0,
      paddingX: 32,
      paddingY: 64,
      shadow: "none",
      title: "Khối tùy chỉnh",
      description: "Kéo thả phần tử vào đây để thiết kế",
    } as BoxProps,
  };

  const label: Record<BlockType, string> = {
    hero: "Hero Section",
    product_section: "Section sản phẩm",
    form_section: "Section biểu mẫu",
    footer: "Footer trang",
    custom_section: "Section tùy chỉnh",
    text: "Văn bản",
    image: "Hình ảnh",
    button: "Nút CTA",
    spacer: "Khoảng cách",
    divider: "Đường kẻ",
    columns: "Bố cục cột",
    feature_card: "Feature Card",
    testimonial: "Nhận xét",
    countdown: "Đếm ngược",
    video: "Video",
    form_capture: "Form thu thập",
    chat_widget: "Chat widget",
    funnel_popup: "Funnel popup",
    smartwatch_landing: "Smartwatch Landing",
    tea_landing: "Herb Tea Template",
    gallery: "Gallery",
    box: "Hình hộp",
    icon: "Biểu tượng",
    product_card: "Sản phẩm mẫu",
    collection_list: "Collection List",
    carousel: "Carousel",
    tabs: "Tabs",
    frame: "Frame",
    accordion: "Accordion",
    table: "Table",
    survey: "Survey",
    menu: "Menu",
    html_code: "Mã HTML",
  };

  return ensureOnlookBlockMeta({
    id,
    type: blockType,
    kind: getNodeKind(blockType),
    props: defaults[blockType],
    label: label[blockType],
    children: canNodeHaveChildren(blockType) ? [] : undefined,
  });
}

export function ensureOnlookBlockMeta(block: EditorBlock): EditorBlock {
  const suffix = block.id.replace(/^block_/, "");
  const kind = getNodeKind(block.type, block.kind);
  
  let frame = block.frame;
  if (kind !== "section" && !frame) {
    let width = 200;
    let height = 80;
    if (block.type === "button") { width = 160; height = 40; }
    else if (block.type === "icon") { width = 48; height = 48; }
    else if (block.type === "image") { width = 300; height = 200; }
    else if (block.type === "divider") { width = 400; height = 20; }
    else if (block.type === "spacer") { width = 100; height = 48; }
    
    frame = {
      x: 50,
      y: 50,
      width,
      height,
      zIndex: 10,
      rotate: 0,
    };
  }

  const props = normalizeNestedProps(block);
  
  const rawChildren = block.children ?? [];
  const children = rawChildren.map(c => {
    const childMeta = ensureOnlookBlockMeta(c);
    childMeta.parentId = block.id;
    return childMeta;
  });

  return {
    ...block,
    kind,
    props,
    frame,
    children: children && children.length > 0 ? children : (canNodeHaveChildren({ ...block, kind }) ? children : undefined),
    oid: block.oid ?? `lp_${block.type}_${suffix}`,
    instanceId: block.instanceId ?? `oiid_${suffix}`,
    domId: block.domId ?? block.id,
    componentName: block.componentName ?? labelFromBlockType(block.type),
  };
}

export function createEmptySectionNode(children: EditorBlock[] = []): EditorBlock {
  const base = createDefaultBlock("box");
  const sectionId = `block_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  return ensureOnlookBlockMeta({
    ...base,
    id: sectionId,
    kind: "section",
    label: "Section",
    props: {
      ...base.props,
      bgColor: "transparent",
      borderColor: "transparent",
      borderWidth: 0,
      borderRadius: 0,
      paddingX: 0,
      paddingY: 0,
      shadow: "none",
      title: "",
      description: "",
    },
    frame: {
      x: 0,
      y: 0,
      width: 1200,
      height: 600, // default section height
      zIndex: 1,
    },
    children: children.map(c => ({ ...c, parentId: sectionId })),
  });
}

function normalizeNestedProps(block: EditorBlock): EditorBlock["props"] {
  if (block.type !== "columns") return block.props;
  const props = block.props as ColumnsProps;
  return {
    ...props,
    children: Array.from({ length: props.columns || 2 }).map((_, index) =>
      (props.children?.[index] ?? []).map(ensureOnlookBlockMeta)
    ),
  };
}

function labelFromBlockType(blockType: BlockType): string {
  const componentNames: Record<BlockType, string> = {
    hero: "HeroBlock",
    product_section: "ProductSectionBlock",
    form_section: "FormSectionBlock",
    footer: "FooterBlock",
    custom_section: "CustomSectionBlock",
    text: "TextBlock",
    image: "ImageBlock",
    button: "ButtonBlock",
    spacer: "SpacerBlock",
    divider: "DividerBlock",
    columns: "ColumnsBlock",
    feature_card: "FeatureCardBlock",
    testimonial: "TestimonialBlock",
    countdown: "CountdownBlock",
    video: "VideoBlock",
    form_capture: "FormCaptureBlock",
    chat_widget: "ChatWidgetBlock",
    funnel_popup: "FunnelPopupBlock",
    smartwatch_landing: "SmartwatchLandingBlock",
    tea_landing: "TeaLandingBlock",
    gallery: "GalleryBlock",
    box: "BoxBlock",
    icon: "IconBlock",
    product_card: "ProductCardBlock",
    collection_list: "CollectionListBlock",
    carousel: "CarouselBlock",
    tabs: "TabsBlock",
    frame: "FrameBlock",
    accordion: "AccordionBlock",
    table: "TableBlock",
    survey: "SurveyBlock",
    menu: "MenuBlock",
    html_code: "HtmlCodeBlock",
  };

  return componentNames[blockType];
}
